import { site } from '../data/seed'
import { formatClock } from '../lib/time'
import { copy, t } from '../copy'

/** A 40px ring plus "n of total done", then "Shift ends HH:mm". §6.2 rail. */
export function MyShiftCard({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.min(1, done / total) : 0
  const deg = Math.round(pct * 360)

  return (
    <div className="rounded-lg shadow-e1 bg-n-0 p-4 flex items-center gap-3">
      <div
        className="rounded-full flex items-center justify-center shrink-0"
        style={{ width: 40, height: 40, background: `conic-gradient(var(--done-solid) ${deg}deg, var(--n-100) 0deg)` }}
        aria-hidden="true"
      >
        <div className="rounded-full bg-n-0 flex items-center justify-center" style={{ width: 30, height: 30 }} />
      </div>
      <div>
        <div className="text-[14px] font-semibold text-n-900 tnum">{t(copy.myShift.doneOf, { done, total })}</div>
        <div className="text-[12px] text-n-500 tnum">{t(copy.myShift.ends, { hhmm: formatClock(new Date(site.shift.end)) })}</div>
      </div>
    </div>
  )
}
