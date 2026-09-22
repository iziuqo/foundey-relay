import { Coffee } from 'lucide-react'
import { Avatar } from './Avatar'
import { LoadLabel } from './LoadLabel'
import { PriorityIcon } from './PriorityIcon'
import { Chip } from './Chip'
import { Button } from './Button'
import { loadForPerson } from '../lib/selectors'
import { mayNeedHelp } from '../lib/priority'
import { copy, t } from '../copy'
import type { Item, Person } from '../lib/types'

interface Props {
  team: Person[]
  items: Item[]
  now: Date
  readOnly?: boolean
  onSeeWork: (personId: string) => void
}

function rankOf(person: Person, flagged: boolean, load: ReturnType<typeof loadForPerson>): number {
  if (flagged) return 0
  if (person.status === 'working') return load.label === 'full' ? 1 : load.label === 'busy' ? 2 : 3
  if (person.status === 'on_break') return 4
  return 5
}

/** Header row 40, body rows 64, radius 12, e-1. §6.5. The manager's own row is not listed. */
export function TeamTable({ team, items, now, readOnly, onSeeWork }: Props) {
  const rows = team
    .filter((p) => !p.isManager)
    .map((person) => {
      const currentItem = items.find((i) => i.id === person.currentTaskId)
      const flagged = currentItem ? mayNeedHelp(currentItem, person, now) : false
      const load = loadForPerson(items, person.id, now)
      return { person, currentItem, flagged, load }
    })
    .sort((a, b) => {
      const r = rankOf(a.person, a.flagged, a.load) - rankOf(b.person, b.flagged, b.load)
      return r !== 0 ? r : a.person.name.localeCompare(b.person.name)
    })

  return (
    <div className="rounded-lg shadow-e1 bg-n-0 overflow-hidden">
      <div className="flex items-center h-10 px-4 bg-n-25 text-[12px] font-semibold uppercase tracking-[0.06em] text-n-500">
        <span style={{ width: 200 }}>Person</span>
        <span className="flex-1">Right now</span>
        <span style={{ width: 140 }}>Load</span>
        <span style={{ width: 104 }} className="text-right">
          Action
        </span>
      </div>
      <ul>
        {rows.map(({ person, currentItem, flagged, load }) => (
          <li key={person.id} className="flex items-center h-16 px-4 border-t border-n-100">
            <span className="flex items-center gap-2.5" style={{ width: 200 }}>
              <Avatar initials={person.initials} size={32} status={person.status} />
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-n-900 truncate">{person.name}</span>
                <span className="block text-[13px] text-n-500 truncate">{person.role}</span>
              </span>
            </span>
            <span className="flex-1 flex items-center gap-2 min-w-0 pr-3">
              {person.status === 'working' && currentItem ? (
                <>
                  <PriorityIcon tier="now" size={16} />
                  <span className="text-[14px] text-n-900 truncate tnum">
                    {t(copy.team.rightNow.working, {
                      title: currentItem.title,
                      n: person.currentTaskStartedAt ? Math.round((now.getTime() - new Date(person.currentTaskStartedAt).getTime()) / 60000) : 0,
                    })}
                  </span>
                </>
              ) : person.status === 'working' ? (
                <>
                  <span className="w-2 h-2 rounded-full" style={{ background: 'var(--done-solid)' }} />
                  <span className="text-[14px] text-n-900">{copy.team.rightNow.available}</span>
                </>
              ) : person.status === 'on_break' ? (
                <>
                  <Coffee size={16} className="text-n-400" />
                  <span className="text-[14px] text-n-600">{copy.team.rightNow.onBreak}</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full border" style={{ borderColor: 'var(--n-400)' }} />
                  <span className="text-[14px] text-n-500">{copy.team.rightNow.out}</span>
                </>
              )}
              {flagged && <Chip tone="next">{copy.team.mayNeedHelp}</Chip>}
            </span>
            <span style={{ width: 140 }}>
              <LoadLabel load={load} />
            </span>
            <span style={{ width: 104 }} className="text-right">
              {!readOnly && (
                <Button variant="ghost" size="sm" onClick={() => onSeeWork(person.id)}>
                  {copy.actions.seeWork}
                </Button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
