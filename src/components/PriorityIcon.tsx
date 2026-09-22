import { OctagonAlert, TriangleAlert, CircleDashed, CircleCheck, Info, type LucideIcon } from 'lucide-react'
import type { Tier } from '../lib/types'

/** The only place that maps tier to icon and color. §4.1, §8.3. */
const TIER_ICON: Record<Tier, { Icon: LucideIcon; color: string; label: string }> = {
  now: { Icon: OctagonAlert, color: 'var(--now-fg)', label: 'Do now' },
  next: { Icon: TriangleAlert, color: 'var(--next-icon)', label: 'Up next' },
  later: { Icon: CircleDashed, color: 'var(--later-icon)', label: 'Later today' },
  done: { Icon: CircleCheck, color: 'var(--done-solid)', label: 'Done' },
  fyi: { Icon: Info, color: 'var(--fyi-icon)', label: 'For your info' },
}

export function tierIconMeta(tier: Tier) {
  return TIER_ICON[tier]
}

export function PriorityIcon({ tier, size = 16 }: { tier: Tier; size?: number }) {
  const { Icon, label } = TIER_ICON[tier]
  return <Icon size={size} color={TIER_ICON[tier].color} aria-label={label} strokeWidth={2} />
}
