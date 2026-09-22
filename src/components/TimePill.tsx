import { Clock } from 'lucide-react'
import { formatClock, isTomorrow, minutesBetween, relativeDuration } from '../lib/time'
import { copy, t } from '../copy'
import type { Tier } from '../lib/types'

export function timePillLabel(dueAt: string | null, now: Date): string {
  if (!dueAt) return ''
  const due = new Date(dueAt)
  const ml = minutesBetween(now, due)
  if (ml < 0) {
    const abs = -ml
    return abs < 60 ? t(copy.time.lateMin, { n: abs }) : t(copy.time.lateHr, { n: Math.round(abs / 60) })
  }
  if (ml <= 60) return t(copy.time.dueIn, { n: ml })
  if (isTomorrow(due, now)) return t(copy.time.tomorrow, { hhmm: formatClock(due) })
  return t(copy.time.due, { hhmm: formatClock(due) })
}

interface Props {
  dueAt: string | null
  now: Date
  tier: Tier
  size?: 'sm' | 'lg'
}

export function TimePill({ dueAt, now, tier, size = 'sm' }: Props) {
  if (!dueAt) return null
  const due = new Date(dueAt)
  const ml = minutesBetween(now, due)
  const overdue = ml < 0
  const dueSoon = ml >= 0 && ml <= 60

  let toneClass = 'bg-n-75 text-n-600'
  if (overdue) toneClass = 'bg-now-solid text-white'
  else if (dueSoon) toneClass = tier === 'now' ? 'bg-now-bg text-now-fg' : 'bg-next-bg text-next-fg'

  const sizeClass = size === 'lg' ? 'h-7 px-2.5 text-[14px]' : 'h-[22px] px-2 text-[12px]'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium tnum ${sizeClass} ${toneClass}`}>
      <Clock size={size === 'lg' ? 14 : 12} />
      {timePillLabel(dueAt, now)}
    </span>
  )
}

export { relativeDuration }
