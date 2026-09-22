import { ChevronDown, ChevronRight } from 'lucide-react'
import { PriorityIcon, tierIconMeta } from './PriorityIcon'
import { copy, t } from '../copy'
import type { Tier } from '../lib/types'

interface Props {
  tier: Extract<Tier, 'now' | 'next' | 'later' | 'fyi'>
  count: number
  collapsible?: boolean
  collapsed?: boolean
  onToggle?: () => void
}

export function TierHeader({ tier, count, collapsible, collapsed, onToggle }: Props) {
  const meta = tierIconMeta(tier)
  const tierCopy = copy.tiers[tier]

  return (
    <div className="flex items-center h-10 px-4 bg-n-25 gap-2">
      <PriorityIcon tier={tier} size={16} />
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.06em] m-0" style={{ color: meta.color }}>
        {tierCopy.label}
      </h2>
      <span className="text-[12px] text-n-500 tnum">{count}</span>
      <div className="flex-1" />
      {collapsible ? (
        <button onClick={onToggle} className="flex items-center gap-1 text-[12px] text-n-500 hover:text-n-900">
          {collapsed ? t(copy.actions.showMore, { n: count }) : copy.actions.showLess}
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
      ) : (
        <span className="text-[12px] text-n-500">{tierCopy.helper}</span>
      )}
    </div>
  )
}
