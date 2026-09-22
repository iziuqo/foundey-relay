import { NavLink } from 'react-router-dom'
import { ListTodo, Users, Bell, Search } from 'lucide-react'
import { copy } from '../copy'

const NAV_ITEMS = [
  { to: '/work', label: copy.nav.work, Icon: ListTodo },
  { to: '/team', label: copy.nav.team, Icon: Users },
  { to: '/updates', label: copy.nav.updates, Icon: Bell },
  { to: '/lookup', label: copy.nav.lookup, Icon: Search },
]

/** 64 tall plus safe area, icon 24 over a 12px label. §6.9. */
export function BottomTabBar() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch bg-n-0 border-t border-n-100"
      style={{ height: 'calc(64px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary"
    >
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 text-[12px] ${isActive ? 'text-n-900 font-semibold' : 'text-n-500'}`
          }
          style={{ minHeight: 48 }}
        >
          <Icon size={24} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
