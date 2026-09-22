import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { useIsHandheld } from '../lib/useViewport'

interface Props {
  icon?: LucideIcon
  label: string
  value: ReactNode
  sub?: ReactNode
  tone?: 'now' | 'neutral'
  onClick?: () => void
}

/** 264×104, radius 12, e-1 (fluid width in a 2 column grid below 768). A button that filters the board and the Needs you list. §6.5. */
export function RiskTile({ icon: Icon, label, value, sub, tone = 'neutral', onClick }: Props) {
  const handheld = useIsHandheld()
  return (
    <button
      onClick={onClick}
      className="text-left rounded-lg shadow-e1 bg-n-0 p-4 flex flex-col gap-2 hover:shadow-e2 transition-shadow duration-hover"
      style={handheld ? { width: '100%', minHeight: 104 } : { width: 264, height: 104 }}
    >
      <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-n-500">{label}</span>
      <span
        className="flex items-center gap-1.5 text-[28px] leading-8 font-semibold tracking-[-0.02em] tnum"
        style={{ color: tone === 'now' ? 'var(--now-fg)' : 'var(--n-900)' }}
      >
        {Icon && <Icon size={20} />}
        {value}
      </span>
      {sub && <span className="text-[12px] text-n-500 truncate">{sub}</span>}
    </button>
  )
}
