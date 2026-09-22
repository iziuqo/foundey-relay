import { useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { OctagonAlert, Hand, UserX, Truck as TruckIcon } from 'lucide-react'
import { AppShell, PageGrid } from '../components/Layout'
import { TopBar } from '../components/TopBar'
import { RiskTile } from '../components/RiskTile'
import { TeamTable } from '../components/TeamTable'
import { TruckList } from '../components/TruckList'
import { Button } from '../components/Button'
import { ReassignPopover } from '../components/ReassignPopover'
import { Drawer } from '../components/Drawer'
import { useStore } from '../state/store'
import { teamRisk, nextCutoff } from '../lib/selectors'
import { scoreItem } from '../lib/priority'
import { formatClock, relativeDuration, minutesBetween } from '../lib/time'
import { copy, t } from '../copy'

type RiskFilter = 'now' | 'help' | 'noOwner' | null

export default function TeamPage({ frozen = false }: { frozen?: boolean } = {}) {
  const { state, now } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [assignFor, setAssignFor] = useState<string | null>(null)
  const [filter, setFilter] = useState<RiskFilter>(null)
  const assignAnchorRef = useRef<HTMLElement | null>(null)

  function openAssign(itemId: string, e: React.MouseEvent<HTMLElement>) {
    assignAnchorRef.current = e.currentTarget
    setAssignFor(itemId)
  }

  const isManager = state.persona === 'm1'
  const risk = useMemo(() => teamRisk(state.items, state.team, now), [state.items, state.team, now])
  const cutoff = nextCutoff(now)

  const working = state.team.filter((p) => !p.isManager && p.status === 'working').length
  const onBreak = state.team.filter((p) => !p.isManager && p.status === 'on_break').length
  const out = state.team.filter((p) => !p.isManager && p.status === 'out').length

  const visibleTeam = useMemo(() => {
    if (!filter || filter === 'noOwner') return state.team
    if (filter === 'help') {
      const flaggedIds = new Set(risk.flagged.map((f) => f.assignee?.id))
      return state.team.filter((p) => p.isManager || flaggedIds.has(p.id))
    }
    return state.team.filter((p) => {
      if (p.isManager) return true
      const currentItem = state.items.find((i) => i.id === p.currentTaskId)
      return currentItem && scoreItem(currentItem, now).tier === 'now'
    })
  }, [filter, state.team, state.items, now, risk.flagged])

  const personId = frozen ? null : searchParams.get('person')
  function openPerson(id: string) {
    setSearchParams((p) => {
      p.set('person', id)
      return p
    })
  }
  function closePerson() {
    setSearchParams((p) => {
      p.delete('person')
      return p
    })
  }

  return (
    <AppShell>
      <TopBar
        title={copy.nav.team}
        right={
          isManager ? (
            <span className="flex items-center gap-1.5 text-[13px] text-n-500 mr-3">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--done-solid)', animation: 'live-pulse 2s ease-in-out infinite' }} />
              {t(copy.team.live, { hhmm: formatClock(now) })}
            </span>
          ) : undefined
        }
      />
      <PageGrid
        main={
          <div className="flex flex-col gap-6">
            <p className="text-[14px] text-n-600 -mt-4">{t(copy.team.status, { on: working, brk: onBreak, out })}</p>

            {!isManager && <p className="text-[13px] text-n-500 -mt-2">{copy.team.mirror}</p>}

            {isManager && (
              <div className="grid grid-cols-2 md:flex md:items-center gap-4">
                <RiskTile
                  icon={OctagonAlert}
                  label={copy.team.tiles.now}
                  value={risk.doNowCount}
                  sub={t(copy.team.tileSubs.now, { n: risk.doNowDueBySub, hhmm: cutoff ? formatClock(new Date(cutoff.departsAt)) : '' })}
                  tone="now"
                  onClick={() => setFilter((f) => (f === 'now' ? null : 'now'))}
                />
                <RiskTile
                  icon={Hand}
                  label={copy.team.tiles.help}
                  value={risk.flagged.length}
                  sub={risk.flagged[0] ? t(copy.team.tileSubs.help, { title: risk.flagged[0].item.title, n: risk.flagged[0].assignee?.currentTaskStartedAt ? Math.round((now.getTime() - new Date(risk.flagged[0].assignee.currentTaskStartedAt).getTime()) / 60000) : 0 }) : undefined}
                  onClick={() => setFilter((f) => (f === 'help' ? null : 'help'))}
                />
                <RiskTile
                  icon={UserX}
                  label={copy.team.tiles.noOwner}
                  value={risk.noOwnerItems.length}
                  sub={risk.outToday[0] ? t(copy.team.tileSubs.noOwner, { name: risk.outToday[0].name.split(' ')[0] }) : copy.team.tileSubs.noOwnerNone}
                  onClick={() => setFilter((f) => (f === 'noOwner' ? null : 'noOwner'))}
                />
                <RiskTile
                  icon={TruckIcon}
                  label={copy.team.tiles.truck}
                  value={cutoff ? `${cutoff.carrier.split(' ')[0]} ${formatClock(new Date(cutoff.departsAt))}` : copy.trucks.none}
                  sub={
                    cutoff
                      ? cutoff.ordersAtRisk > 0
                        ? `${t(copy.trucks.atRisk, { n: cutoff.ordersAtRisk })} · in ${relativeDuration(minutesBetween(now, new Date(cutoff.departsAt)))}`
                        : copy.trucks.onTrack
                      : undefined
                  }
                  tone={cutoff && cutoff.ordersAtRisk > 50 ? 'now' : 'neutral'}
                />
              </div>
            )}

            {filter && (
              <button onClick={() => setFilter(null)} className="self-start text-[13px] font-medium text-accent">
                {copy.team.clearFilter}
              </button>
            )}
            <TeamTable team={visibleTeam} items={state.items} now={now} readOnly={!isManager} onSeeWork={openPerson} />
          </div>
        }
        rail={
          isManager ? (
            <>
              <div className="rounded-lg shadow-e1 bg-n-0 p-4">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-n-500 mb-3">{copy.team.needsYou}</h3>
                {risk.noOwnerItems.length === 0 && risk.flagged.length === 0 ? (
                  <p className="text-[13px] text-n-500">{copy.team.needsYouEmpty}</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {risk.flagged.map(({ item, assignee }) => {
                      const askedFirst = item.helpAsked
                      const minutesStalled = assignee?.currentTaskStartedAt ? Math.round((now.getTime() - new Date(assignee.currentTaskStartedAt).getTime()) / 60000) : 0
                      return (
                        <li key={item.id} className="flex items-center justify-between gap-3">
                          <p className="text-[13px] text-n-900 leading-[18px] min-w-0">
                            {askedFirst
                              ? t(copy.team.needsYouAsked, { name: assignee?.name ?? '', title: item.title })
                              : t(copy.team.needsYouHelp, { title: item.title, n: minutesStalled })}
                          </p>
                          <Button variant="secondary" size="sm" onClick={() => openPerson(assignee?.id ?? '')}>
                            {copy.actions.checkIn}
                          </Button>
                        </li>
                      )
                    })}
                    {risk.noOwnerItems.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3">
                        <p className="text-[13px] text-n-900 leading-[18px] min-w-0">
                          {t(copy.team.needsYouNoOwner, { title: item.title, hhmm: item.dueAt ? formatClock(new Date(item.dueAt)) : '' })}
                        </p>
                        <Button variant="secondary" size="sm" onClick={(e) => openAssign(item.id, e)}>
                          {copy.actions.assign}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <TruckList now={now} title="Trucks today" />
            </>
          ) : (
            <TruckList now={now} title="Trucks today" />
          )
        }
      />

      {assignFor && <ReassignPopover open itemId={assignFor} anchorRef={assignAnchorRef as React.RefObject<HTMLElement>} onClose={() => setAssignFor(null)} />}

      <AnimatePresence>
        {personId && <Drawer key="person-drawer" kind="person" personId={personId} onClose={closePerson} />}
      </AnimatePresence>
    </AppShell>
  )
}
