import { copy } from '../copy'
import type { LoadResult } from '../lib/priority'

const LABEL_TEXT: Record<LoadResult['label'], string> = {
  light: copy.team.load.light,
  busy: copy.team.load.busy,
  full: copy.team.load.full,
}

const LABEL_COLOR: Record<LoadResult['label'], string> = {
  light: 'var(--done-fg)',
  busy: 'var(--next-fg)',
  full: 'var(--now-fg)',
}

/** Word plus a 3-segment bar. Never a percentage. §4.4. */
export function LoadLabel({ load }: { load: LoadResult }) {
  const filled = load.label === 'light' ? 1 : load.label === 'busy' ? 2 : 3
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[14px] font-medium" style={{ color: LABEL_COLOR[load.label] }}>
        {LABEL_TEXT[load.label]}
      </span>
      <span className="inline-flex gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-1.5 h-2.5 rounded-full"
            style={{ background: i < filled ? LABEL_COLOR[load.label] : 'var(--n-200)' }}
          />
        ))}
      </span>
    </span>
  )
}
