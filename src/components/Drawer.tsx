import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import { PriorityIcon, tierIconMeta } from './PriorityIcon'
import { TimePill } from './TimePill'
import { SourceTag } from './SourceTag'
import { WhyList } from './WhyList'
import { HowWeSortModal } from './HowWeSortModal'
import { ActionBar } from './ActionBar'
import { Avatar } from './Avatar'
import { LoadLabel } from './LoadLabel'
import { PriorityRow } from './PriorityRow'
import { EmptyState } from './EmptyState'
import { Button } from './Button'
import { ReassignPopover } from './ReassignPopover'
import { useStore } from '../state/store'
import { scoreItem } from '../lib/priority'
import { queueFor, loadForPerson } from '../lib/selectors'
import { site } from '../data/seed'
import { formatClock } from '../lib/time'
import { copy, t } from '../copy'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[12px] text-n-500">{label}</span>
      <span className="text-[14px] text-n-900 tnum">{value}</span>
    </div>
  )
}

function ManagerFooterActions({ itemId, assigneeName }: { itemId: string; assigneeName?: string }) {
  const { dispatch } = useStore()
  const [reassignOpen, setReassignOpen] = useState(false)
  const firstName = assigneeName?.split(' ')[0] ?? 'them'

  return (
    <div className="flex items-center gap-2 relative">
      <Button variant="primary" size="md" onClick={() => setReassignOpen(true)}>
        {copy.actions.reassign}
      </Button>
      <Button variant="secondary" size="md" onClick={() => dispatch({ type: 'SHOW_TOAST', message: copy.drawer.messagingToast })}>
        {t(copy.drawer.message, { name: firstName })}
      </Button>
      <ReassignPopover open={reassignOpen} onClose={() => setReassignOpen(false)} itemId={itemId} />
    </div>
  )
}

function ItemDrawerBody({ itemId, onPrev, onNext, onClose }: { itemId: string; onPrev?: () => void; onNext?: () => void; onClose: () => void }) {
  const { state, now } = useStore()
  const [howOpen, setHowOpen] = useState(false)
  const item = state.items.find((i) => i.id === itemId)
  if (!item) return <EmptyState>{copy.tiers.empty}</EmptyState>

  const result = scoreItem(item, now)
  const tier = result.tier
  const meta = tierIconMeta(tier)
  const assignee = state.team.find((p) => p.id === item.assigneeId)
  const cutoff = item.cutoffId ? site.cutoffs.find((c) => c.id === item.cutoffId) : null
  const isManagerViewingOthers = state.persona === 'm1' && item.assigneeId !== 'm1'

  return (
    <>
      <div className="flex items-center gap-3 h-14 px-5 border-b border-n-100 shrink-0">
        <PriorityIcon tier={tier} size={16} />
        <span className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: meta.color }}>
          {copy.tiers[tier].label}
        </span>
        <div className="flex-1" />
        {onPrev && (
          <button aria-label="Previous item" onClick={onPrev} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-n-75">
            <ChevronUp size={16} />
          </button>
        )}
        {onNext && (
          <button aria-label="Next item" onClick={onNext} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-n-75">
            <ChevronDown size={16} />
          </button>
        )}
        <button aria-label="Close" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-n-75">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        <div>
          <h2 className="text-[20px] leading-[28px] font-semibold text-n-900 mb-2">{item.title}</h2>
          <div className="flex items-center gap-2">
            <TimePill dueAt={item.dueAt} now={now} tier={tier} size="lg" />
            <SourceTag source={item.source} />
          </div>
        </div>

        {result.score !== null && <WhyList item={item} result={result} onOpenHow={() => setHowOpen(true)} />}

        <div className="grid grid-cols-2 gap-4">
          <DetailRow label={copy.drawer.assignedTo} value={assignee?.name ?? 'Unassigned'} />
          <DetailRow label={copy.drawer.ordersWaiting} value={String(item.ordersBlocked)} />
          <DetailRow label={copy.drawer.unitsAffected} value={String(item.unitsAffected)} />
          <DetailRow label={copy.drawer.truck} value={cutoff ? `${cutoff.carrier} ${formatClock(new Date(cutoff.departsAt))}` : 'None'} />
          <DetailRow label={copy.drawer.created} value={formatClock(new Date(item.createdAt))} />
          <DetailRow label={copy.drawer.itemId} value={item.id} />
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] text-n-500">
            {t(copy.drawer.activityCreated, { hhmm: formatClock(new Date(item.createdAt)), source: copy.sourceLabels[item.source] })}
          </p>
          {item.status === 'in_progress' && assignee?.currentTaskId === item.id && assignee.currentTaskStartedAt && (
            <p className="text-[13px] text-n-500">
              {t(copy.drawer.activityStarted, { name: assignee.name, hhmm: formatClock(new Date(assignee.currentTaskStartedAt)) })}
            </p>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-n-100 p-4" style={{ minHeight: 72 }}>
        {isManagerViewingOthers ? <ManagerFooterActions itemId={item.id} assigneeName={assignee?.name} /> : <ActionBar item={item} now={now} size="md" />}
      </div>

      <HowWeSortModal open={howOpen} onClose={() => setHowOpen(false)} />
    </>
  )
}

function PersonDrawerBody({ personId, onClose }: { personId: string; onClose: () => void }) {
  const { state, now } = useStore()
  const person = state.team.find((p) => p.id === personId)
  const [reassignFor, setReassignFor] = useState<string | null>(null)
  const canReassign = state.persona === 'm1'
  if (!person) return <EmptyState>{copy.tiers.empty}</EmptyState>

  const q = queueFor(state.items, personId, now)
  const load = loadForPerson(state.items, personId, now)
  const rows = [...(q.hero ? [q.hero] : []), ...q.now, ...q.next, ...q.later]

  return (
    <>
      <div className="flex items-center gap-3 h-14 px-5 border-b border-n-100 shrink-0">
        <Avatar initials={person.initials} size={28} status={person.status} />
        <div className="min-w-0">
          <div className="text-[14px] font-semibold text-n-900 truncate">{person.name}</div>
          <div className="text-[12px] text-n-500 truncate">{person.role}</div>
        </div>
        <div className="flex-1" />
        <LoadLabel load={load} />
        <button aria-label="Close" onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-n-75 ml-2">
          <X size={16} />
        </button>
      </div>
      <p className="text-[12px] text-n-500 px-5 pt-3">{t(copy.team.personNote, { name: person.name.split(' ')[0] })}</p>
      <div className="flex-1 overflow-y-auto px-5 py-3">
        {rows.length === 0 ? (
          <EmptyState>{copy.tiers.empty}</EmptyState>
        ) : (
          <ul className="rounded-lg shadow-e1 overflow-hidden">
            {rows.map((r) => (
              <PriorityRow
                key={r.item.id}
                item={r.item}
                now={now}
                tier={r.result.tier}
                onOpen={() => {}}
                onStart={() => {}}
                onDone={() => {}}
                readOnly={!canReassign}
                actionOverride={canReassign ? { label: copy.actions.reassign, onClick: () => setReassignFor(r.item.id) } : undefined}
              />
            ))}
          </ul>
        )}
      </div>
      {reassignFor && <ReassignPopover open itemId={reassignFor} onClose={() => setReassignFor(null)} />}
    </>
  )
}

type Props =
  | { kind: 'item'; itemId: string; onClose: () => void; onPrev?: () => void; onNext?: () => void }
  | { kind: 'person'; personId: string; onClose: () => void }

/** 480 wide, below the top bar, no scrim. Slides in from x+24. §6.3, §6.5. Wrap callers in AnimatePresence for the exit transition. */
export function Drawer(props: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') props.onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [props])

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.32 }}
      className="fixed right-0 bg-n-0 shadow-e4 flex flex-col z-30"
      style={{ top: 56, bottom: 0, width: 480 }}
      role="complementary"
    >
      {props.kind === 'item' ? (
        <ItemDrawerBody itemId={props.itemId} onPrev={props.onPrev} onNext={props.onNext} onClose={props.onClose} />
      ) : (
        <PersonDrawerBody personId={props.personId} onClose={props.onClose} />
      )}
    </motion.aside>
  )
}
