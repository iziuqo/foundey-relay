import type { ReactNode } from 'react'

export type ChipTone = 'now' | 'next' | 'accent' | 'done' | 'neutral'

const TONE_CLASSES: Record<ChipTone, string> = {
  now: 'bg-now-bg text-now-fg',
  next: 'bg-next-bg text-next-fg',
  accent: 'bg-accent-bg text-accent',
  done: 'bg-done-bg text-done-fg',
  neutral: 'bg-n-75 text-n-600',
}

export function Chip({ tone = 'neutral', children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center h-[22px] px-2 rounded-xs text-[12px] font-medium leading-none ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}
