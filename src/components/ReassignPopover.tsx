import { useState, type RefObject } from 'react'
import { Search } from 'lucide-react'
import { Popover } from './Popover'
import { Avatar } from './Avatar'
import { LoadLabel } from './LoadLabel'
import { useStore } from '../state/store'
import { loadForPerson, queueFor } from '../lib/selectors'
import { copy } from '../copy'

interface Props {
  open: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLElement>
  itemId: string
  title?: string
}

/** 320 wide, radius 8, e-3. §6.6. One click commits, no confirm. */
export function ReassignPopover({ open, onClose, anchorRef, itemId, title = copy.team.reassignTitle }: Props) {
  const { state, dispatch, now } = useStore()
  const [query, setQuery] = useState('')
  const item = state.items.find((i) => i.id === itemId)
  const originalAssignee = state.team.find((p) => p.id === item?.assigneeId)

  function commit(personId: string) {
    dispatch({ type: 'REASSIGN', itemId, toPersonId: personId, actorId: state.persona })
    setQuery('')
    onClose()
  }

  const order: Record<string, number> = { light: 0, busy: 1, full: 2 }
  const candidates = state.team
    .filter((p) => !p.isManager && p.id !== item?.assigneeId)
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    .map((person) => ({ person, load: loadForPerson(state.items, person.id, now) }))
    .sort((a, b) => {
      const aOut = a.person.status === 'out' ? 1 : 0
      const bOut = b.person.status === 'out' ? 1 : 0
      if (aOut !== bOut) return aOut - bOut
      const aBreak = a.person.status === 'on_break' ? 1 : 0
      const bBreak = b.person.status === 'on_break' ? 1 : 0
      if (aBreak !== bBreak) return aBreak - bBreak
      if (order[a.load.label] !== order[b.load.label]) return order[a.load.label] - order[b.load.label]
      const aArea = a.person.area === originalAssignee?.area ? 0 : 1
      const bArea = b.person.area === originalAssignee?.area ? 0 : 1
      return aArea - bArea
    })

  return (
    <Popover open={open} onClose={onClose} anchorRef={anchorRef} width={320}>
      <div className="text-[12px] text-n-500 mb-2 truncate">{title}</div>
      <div className="relative mb-3">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-n-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.team.findTeammate}
          className="w-full h-8 pl-8 pr-2 rounded-sm border border-n-200 text-[13px] outline-none focus-visible:border-focus"
        />
      </div>
      <div className="text-[12px] font-semibold text-n-500 mb-1">{copy.team.suggested}</div>
      <ul className="max-h-64 overflow-auto flex flex-col">
        {candidates.map(({ person, load }) => {
          const disabled = person.status === 'out'
          const q = queueFor(state.items, person.id, now)
          const doNowCount = q.now.length + (q.hero?.result.tier === 'now' ? 1 : 0)
          return (
            <li key={person.id}>
              <button
                disabled={disabled}
                onClick={() => commit(person.id)}
                className="w-full flex items-center gap-2.5 h-12 px-2 rounded-sm hover:bg-n-75 disabled:opacity-50 disabled:hover:bg-transparent text-left"
              >
                <Avatar initials={person.initials} size={24} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] text-n-900 truncate">{person.name}</span>
                  <span className="block text-[12px] text-n-500 truncate">{person.area}</span>
                </span>
                {disabled ? (
                  <span className="text-[12px] text-n-500 shrink-0">{copy.team.rightNow.out}</span>
                ) : (
                  <span className="flex items-center gap-1.5 shrink-0">
                    <LoadLabel load={load} />
                    <span className="text-[12px] text-n-500 tnum">{doNowCount}</span>
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </Popover>
  )
}
