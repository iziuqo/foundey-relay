import { NavLink } from 'react-router-dom'
import { ListTodo, Users, Bell, Search } from 'lucide-react'
import { Wordmark } from './Wordmark'
import { Avatar } from './Avatar'
import { useStore } from '../state/store'
import { queueFor } from '../lib/selectors'
import { site } from '../data/seed'
import { copy, t } from '../copy'

const NAV_ITEMS = [
  { to: '/work', label: copy.nav.work, Icon: ListTodo },
  { to: '/team', label: copy.nav.team, Icon: Users },
  { to: '/updates', label: copy.nav.updates, Icon: Bell },
  { to: '/lookup', label: copy.nav.lookup, Icon: Search },
]

/** Width 248, same nav for everyone. §6.1. */
export function LeftNav() {
  const { state, now } = useStore()
  const person = state.team.find((p) => p.id === state.persona)
  const q = queueFor(state.items, state.persona, now)
  const doNowCount = q.now.length + (q.hero?.result.tier === 'now' ? 1 : 0)

  const shiftEndMs = new Date(site.shift.end).getTime()
  const minsLeft = Math.round((shiftEndMs - now.getTime()) / 60000)
  const h = Math.floor(Math.max(0, minsLeft) / 60)
  const m = Math.max(0, minsLeft) % 60

  if (!person) return null

  return (
    <nav className="shrink-0 flex flex-col" style={{ width: 248, background: 'var(--n-50)', padding: 12 }} aria-label="Primary">
      <div className="flex items-center h-14 px-2">
        <Wordmark />
      </div>
      <ul className="flex flex-col gap-1 mt-2 flex-1">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 h-10 px-2.5 rounded-md text-[14px] transition-colors duration-hover ${
                  isActive ? 'bg-n-0 shadow-e1 font-semibold text-n-900' : 'font-medium text-n-600 hover:text-n-900'
                }`
              }
            >
              <Icon size={20} />
              <span className="flex-1">{label}</span>
              {to === '/work' && doNowCount > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[11px] font-semibold text-white tnum"
                  style={{ background: 'var(--now-solid)' }}
                >
                  {doNowCount}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="px-2.5 pt-3 border-t border-n-100">
        <div className="flex items-center gap-2 mb-2">
          <Avatar initials={person.initials} size={28} status={person.status} />
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-n-900 truncate">{person.name}</div>
            <div className="text-[12px] text-n-500 truncate">{person.role}</div>
          </div>
        </div>
        <div className="text-[12px] text-n-500 tnum">
          {minsLeft > 0 ? t(copy.shift.line, { name: site.shift.name, h, m }) : t(copy.shift.ended, { name: site.shift.name })}
        </div>
      </div>
    </nav>
  )
}
