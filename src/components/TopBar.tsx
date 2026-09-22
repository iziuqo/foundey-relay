import { useRef, useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { Avatar } from './Avatar'
import { Popover } from './Popover'
import { Wordmark } from './Wordmark'
import { HowWeSortModal } from './HowWeSortModal'
import { useStore } from '../state/store'
import { queueFor } from '../lib/selectors'
import { useIsHandheld } from '../lib/useViewport'
import { copy, t } from '../copy'

interface Props {
  title: string
  showSearch?: boolean
  onSearch?: (q: string) => void
  right?: React.ReactNode
}

/** Sticky, 56 tall. §6.2, §6.5. */
export function TopBar({ title, showSearch, onSearch, right }: Props) {
  const { state, now } = useStore()
  const person = state.team.find((p) => p.id === state.persona)
  const [menuOpen, setMenuOpen] = useState(false)
  const [howOpen, setHowOpen] = useState(false)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const handheld = useIsHandheld()
  if (!person) return null

  if (handheld) {
    const q = queueFor(state.items, state.persona, now)
    const doNowCount = q.now.length + (q.hero?.result.tier === 'now' ? 1 : 0)
    return (
      <header className="sticky top-0 z-20 flex items-center gap-3 px-4 bg-n-50/95 backdrop-blur" style={{ height: 56 }}>
        <Wordmark size={20} withLabel={false} />
        <div className="flex-1" />
        <span className="text-[13px] font-medium text-n-600 tnum">{t(copy.handheld.needYou, { n: doNowCount })}</span>
        <button ref={avatarRef} onClick={() => setMenuOpen((o) => !o)} aria-label="Account menu" style={{ minWidth: 48, minHeight: 48 }} className="flex items-center justify-center">
          <Avatar initials={person.initials} size={32} status={person.status} />
        </button>
        <Popover open={menuOpen} onClose={() => setMenuOpen(false)} anchorRef={avatarRef} width={220} align="end">
          <div className="px-2 py-1.5 mb-1 border-b border-n-100">
            <div className="text-[14px] font-medium text-n-900">{person.name}</div>
            <div className="text-[12px] text-n-500">{person.role}</div>
          </div>
          <button onClick={() => setHowOpen(true)} className="w-full text-left px-2 py-2 rounded-sm text-[14px] text-n-900 hover:bg-n-75">
            {copy.why.howLink}
          </button>
        </Popover>
        <HowWeSortModal open={howOpen} onClose={() => setHowOpen(false)} />
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 h-14 px-8 bg-n-50/95 backdrop-blur" style={{ height: 56 }}>
      <h1 className="text-[24px] leading-8 font-semibold tracking-[-0.015em] text-n-900">{title}</h1>
      <div className="flex-1" />
      {right}
      {showSearch && (
        <div className="relative">
          <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-n-400" />
          <input
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder={copy.search}
            aria-label={copy.search}
            className="h-8 pl-8 pr-2 rounded-sm border border-n-200 bg-n-0 text-[13px] outline-none focus-visible:border-focus"
            style={{ width: 240 }}
          />
        </div>
      )}
      <div className="relative">
        <button ref={avatarRef} onClick={() => setMenuOpen((o) => !o)} aria-label="Account menu" aria-haspopup="menu">
          <Avatar initials={person.initials} size={32} status={person.status} />
        </button>
        <Popover open={menuOpen} onClose={() => setMenuOpen(false)} anchorRef={avatarRef} width={220} align="end">
          <div className="px-2 py-1.5 mb-1 border-b border-n-100">
            <div className="text-[14px] font-medium text-n-900">{person.name}</div>
            <div className="text-[12px] text-n-500">{person.role}</div>
          </div>
          <button
            disabled
            title={copy.settings.tooltip}
            className="w-full text-left px-2 py-2 rounded-sm text-[14px] text-n-400 cursor-not-allowed"
          >
            {copy.settings.label}
          </button>
          <button
            onClick={() => {
              setHowOpen(true)
              setMenuOpen(false)
            }}
            className="w-full text-left px-2 py-2 rounded-sm text-[14px] text-n-900 hover:bg-n-75"
          >
            {copy.why.howLink}
          </button>
        </Popover>
      </div>
      <HowWeSortModal open={howOpen} onClose={() => setHowOpen(false)} />
    </header>
  )
}
