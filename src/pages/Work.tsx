import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { ListOrdered } from 'lucide-react'
import { AppShell, PageGrid } from '../components/Layout'
import { TopBar } from '../components/TopBar'
import { HeroCard } from '../components/HeroCard'
import { AllClear } from '../components/AllClear'
import { TierHeader } from '../components/TierHeader'
import { PriorityRow } from '../components/PriorityRow'
import { EmptyState } from '../components/EmptyState'
import { TruckList } from '../components/TruckList'
import { HowWeSortModal } from '../components/HowWeSortModal'
import { Drawer } from '../components/Drawer'
import { MyShiftCard } from '../components/MyShiftCard'
import { UpdatesCard } from '../components/UpdatesCard'
import { useStore } from '../state/store'
import { queueFor } from '../lib/selectors'
import { useStableOrder } from '../lib/useStableOrder'
import { formatClock } from '../lib/time'
import type { Ranked } from '../lib/priority'
import type { Tier } from '../lib/types'
import { copy, t } from '../copy'

function QueueSection({
  tier,
  ranked,
  now,
  visibleCount,
  onShowMore,
  selectedId,
  onOpen,
  onStart,
  onDone,
  collapsible,
  collapsed,
  onToggleCollapsed,
}: {
  tier: Extract<Tier, 'now' | 'next' | 'later' | 'fyi'>
  ranked: Ranked[]
  now: Date
  visibleCount: number
  onShowMore: () => void
  selectedId: string | null
  onOpen: (id: string) => void
  onStart: (id: string) => void
  onDone: (id: string) => void
  collapsible?: boolean
  collapsed?: boolean
  onToggleCollapsed?: () => void
}) {
  const shown = ranked.slice(0, visibleCount)
  const remaining = ranked.length - shown.length

  return (
    <>
      <TierHeader tier={tier} count={ranked.length} collapsible={collapsible} collapsed={collapsed} onToggle={onToggleCollapsed} />
      {!collapsed && (
        <>
          {ranked.length === 0 ? (
            <EmptyState>{copy.tiers.empty}</EmptyState>
          ) : (
            <ul>
              {shown.map((r) => (
                <PriorityRow
                  key={r.item.id}
                  item={r.item}
                  now={now}
                  tier={r.result.tier}
                  selected={selectedId === r.item.id}
                  onOpen={() => onOpen(r.item.id)}
                  onStart={() => onStart(r.item.id)}
                  onDone={() => onDone(r.item.id)}
                />
              ))}
            </ul>
          )}
          {remaining > 0 && (
            <div className="px-4 py-2">
              <button onClick={onShowMore} className="text-[13px] font-medium text-n-600 hover:text-n-900">
                {t(copy.actions.showMore, { n: remaining })}
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default function WorkPage({ frozen = false }: { frozen?: boolean } = {}) {
  const { state, dispatch, now, totalToday } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [howOpen, setHowOpen] = useState(false)
  const [liveMessage, setLiveMessage] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [laterCollapsedManual, setLaterCollapsedManual] = useState<boolean | null>(null)
  const [visibleCounts, setVisibleCounts] = useState({ now: 3, next: 3, later: 3 })

  const personId = state.persona
  const person = state.team.find((p) => p.id === personId)
  const frozenHeroId = state.pendingPromotion?.frozenHeroId ?? null
  const q = useMemo(() => queueFor(state.items, personId, now, frozenHeroId), [state.items, personId, now, frozenHeroId])
  const { done: doneCount, total: totalCount } = totalToday(personId)

  const rankedId = (r: Ranked) => r.item.id
  const laterCollapsedDefault = q.now.length + q.next.length >= 4
  const laterCollapsed = laterCollapsedManual ?? laterCollapsedDefault
  const stableNow = useStableOrder(q.now, state.lastInteractionAt, 10000, rankedId)
  const stableNext = useStableOrder(q.next, state.lastInteractionAt, 10000, rankedId)
  const stableLater = useStableOrder(q.later, state.lastInteractionAt, 10000, rankedId)
  const anyChanged = stableNow.changed || stableNext.changed || stableLater.changed

  function logInteraction() {
    dispatch({ type: 'LOG_INTERACTION', atMs: Date.now() })
  }

  useEffect(() => {
    if (frozen) return
    function onActivity() {
      dispatch({ type: 'LOG_INTERACTION', atMs: Date.now() })
    }
    window.addEventListener('pointerdown', onActivity)
    window.addEventListener('keydown', onActivity)
    return () => {
      window.removeEventListener('pointerdown', onActivity)
      window.removeEventListener('keydown', onActivity)
    }
  }, [dispatch, frozen])

  const openItemId = frozen ? null : searchParams.get('item')
  function openDrawer(id: string) {
    logInteraction()
    setSearchParams((p) => {
      p.set('item', id)
      return p
    })
  }
  function closeDrawer() {
    setSearchParams((p) => {
      p.delete('item')
      return p
    })
  }
  function start(id: string) {
    logInteraction()
    dispatch({ type: 'START', itemId: id, actorId: personId, nowIso: now.toISOString() })
  }
  function done(id: string) {
    logInteraction()
    const wasHero = q.hero?.item.id === id
    dispatch({ type: 'DONE', itemId: id, nowIso: now.toISOString() })
    if (wasHero) {
      const next = q.now[0] ?? q.next[0] ?? q.later[0]
      setLiveMessage(next ? t(copy.live.doneNext, { title: next.item.title }) : copy.live.doneCaughtUp)
    }
  }

  const flatOrder = [...(q.hero ? [q.hero] : []), ...q.now, ...q.next, ...q.later]

  // What's actually on screen right now, in order: the hero, then each expanded tier's visible rows.
  // J/K walk this list (not the full flatOrder) so selection never lands on a hidden row. §7.8.
  const navigableIds = useMemo(() => {
    const ids: string[] = []
    if (q.hero) ids.push(q.hero.item.id)
    ids.push(...stableNow.order.slice(0, visibleCounts.now).map(rankedId))
    ids.push(...stableNext.order.slice(0, visibleCounts.next).map(rankedId))
    if (!laterCollapsed) ids.push(...stableLater.order.slice(0, visibleCounts.later).map(rankedId))
    return ids
  }, [q.hero, stableNow.order, stableNext.order, stableLater.order, visibleCounts, laterCollapsed])

  useEffect(() => {
    setSelectedIndex((i) => Math.min(i, Math.max(0, navigableIds.length - 1)))
  }, [navigableIds.length])

  useEffect(() => {
    if (frozen) return
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      const key = e.key.toLowerCase()
      if (e.key === '?') setHowOpen((o) => !o)
      if (key === 'e') {
        const id = navigableIds[selectedIndex]
        if (id) done(id)
      }
      if (e.key === 'Escape' && openItemId) closeDrawer()
      if ((key === 'j' || e.key === 'ArrowDown') && navigableIds.length > 0) {
        e.preventDefault()
        logInteraction()
        setSelectedIndex((i) => Math.min(navigableIds.length - 1, i + 1))
      }
      if ((key === 'k' || e.key === 'ArrowUp') && navigableIds.length > 0) {
        e.preventDefault()
        logInteraction()
        setSelectedIndex((i) => Math.max(0, i - 1))
      }
      if (e.key === 'Enter') {
        const id = navigableIds[selectedIndex]
        if (id) openDrawer(id)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigableIds, selectedIndex, openItemId, frozen])

  const band = state.pendingPromotion && !state.pendingPromotion.dismissed
    ? {
        title: state.items.find((i) => i.id === state.pendingPromotion!.itemId)?.title ?? '',
        onShowMe: () => dispatch({ type: 'SHOW_PENDING' }),
        onStayHere: () => dispatch({ type: 'DISMISS_PENDING' }),
      }
    : null

  if (!person) return null

  const workingMinutes =
    q.hero?.item.status === 'in_progress' && person.currentTaskStartedAt
      ? Math.round((now.getTime() - new Date(person.currentTaskStartedAt).getTime()) / 60000)
      : null

  const firstName = person.name.split(' ')[0]
  const greeting = t(now.getHours() < 12 ? copy.greeting.morning : copy.greeting.afternoon, { name: firstName })
  const doNowTotal = q.now.length + (q.hero?.result.tier === 'now' ? 1 : 0)
  const progressText = t(copy.status.progress, { done: doneCount, total: totalCount })
  const metaLine = !q.hero
    ? progressText
    : doNowTotal > 0
      ? `${t(doNowTotal === 1 ? copy.status.needYouOne : copy.status.needYou, { n: doNowTotal })} ${progressText}`
      : t(copy.status.nothingUrgent, { n: flatOrder.length })

  const selectedId = selectedIndex > 0 ? navigableIds[selectedIndex] : null

  return (
    <AppShell>
      <TopBar title={copy.nav.work} showSearch />
      <PageGrid
        main={
          <div className="relative" onClickCapture={logInteraction}>
            <div aria-live="polite" className="sr-only">
              {liveMessage}
            </div>

            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-[24px] leading-8 font-semibold text-n-900">{greeting}</h2>
                <p className="text-[14px] leading-5 text-n-600 mt-1">{metaLine}</p>
              </div>
              <button onClick={() => setHowOpen(true)} className="flex items-center gap-1.5 text-[13px] font-medium text-n-600 hover:text-n-900 mt-1">
                <ListOrdered size={14} />
                {copy.why.howLink}
              </button>
            </div>

            {q.hero ? (
              <HeroCard ranked={q.hero} now={now} position={1} total={flatOrder.length} workingMinutes={workingMinutes} band={band} />
            ) : (
              <AllClear doneCount={doneCount} />
            )}

            {(q.now.length > 0 || q.next.length > 0 || q.later.length > 0 || q.hero) && (
              <div className="mt-8 rounded-lg shadow-e1 bg-n-0 overflow-hidden">
                <AnimatePresence>
                  {anyChanged && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex items-center justify-between px-4 py-2 bg-accent-bg text-[13px]"
                    >
                      <span className="text-accent">{copy.changedPlace}</span>
                      <button
                        onClick={() => {
                          stableNow.showFresh()
                          stableNext.showFresh()
                          stableLater.showFresh()
                        }}
                        className="font-semibold text-accent"
                      >
                        {copy.showIt}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <QueueSection
                  tier="now"
                  ranked={stableNow.order}
                  now={now}
                  visibleCount={visibleCounts.now}
                  onShowMore={() => setVisibleCounts((v) => ({ ...v, now: v.now + stableNow.order.length }))}
                  selectedId={selectedId}
                  onOpen={openDrawer}
                  onStart={start}
                  onDone={done}
                />
                <QueueSection
                  tier="next"
                  ranked={stableNext.order}
                  now={now}
                  visibleCount={visibleCounts.next}
                  onShowMore={() => setVisibleCounts((v) => ({ ...v, next: v.next + stableNext.order.length }))}
                  selectedId={selectedId}
                  onOpen={openDrawer}
                  onStart={start}
                  onDone={done}
                />
                <QueueSection
                  tier="later"
                  ranked={stableLater.order}
                  now={now}
                  visibleCount={visibleCounts.later}
                  onShowMore={() => setVisibleCounts((v) => ({ ...v, later: v.later + stableLater.order.length }))}
                  selectedId={selectedId}
                  onOpen={openDrawer}
                  onStart={start}
                  onDone={done}
                  collapsible
                  collapsed={laterCollapsed}
                  onToggleCollapsed={() => setLaterCollapsedManual(!laterCollapsed)}
                />
              </div>
            )}

            {(q.waiting.length > 0 || q.snoozed.length > 0) && (
              <div className="mt-4 flex flex-col gap-2 text-[13px] text-n-500">
                {q.waiting.length > 0 && <div>{t(copy.tiers.waitingGroup, { n: q.waiting.length })}</div>}
                {q.snoozed.length > 0 && <div>{t(copy.tiers.laterGroup, { n: q.snoozed.length })}</div>}
              </div>
            )}

            <details className="mt-6">
              <summary className="text-[13px] font-medium text-n-600 cursor-pointer">{t(copy.tiers.done.withCount, { n: doneCount })}</summary>
              <ul className="mt-2 flex flex-col gap-1.5">
                {state.doneLog
                  .filter((d) => d.assigneeId === personId)
                  .map((d) => (
                    <li key={d.id} className="flex items-center justify-between text-[13px] text-n-500 px-1">
                      <span className="truncate">{d.title}</span>
                      <span className="tnum shrink-0 ml-2">{formatClock(new Date(d.doneAt))}</span>
                    </li>
                  ))}
              </ul>
            </details>

            <div className="mt-10 text-center">
              <p className="text-[12px] text-n-500">{copy.shortcuts}</p>
            </div>
          </div>
        }
        rail={
          <>
            <TruckList now={now} />
            <MyShiftCard done={doneCount} total={totalCount} />
            <UpdatesCard now={now} />
          </>
        }
      />

      <HowWeSortModal open={howOpen} onClose={() => setHowOpen(false)} />

      <AnimatePresence>
        {openItemId && <Drawer key="item-drawer" kind="item" itemId={openItemId} onClose={closeDrawer} />}
      </AnimatePresence>
    </AppShell>
  )
}
