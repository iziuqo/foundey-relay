import { Truck } from 'lucide-react'
import { site } from '../data/seed'
import { minutesBetween, relativeDuration, formatClock } from '../lib/time'
import { copy, t } from '../copy'

/** "Next trucks" rail card and "Trucks today" Team card share this. §6.2, §6.5. */
export function TruckList({ now, title = copy.trucks.title }: { now: Date; title?: string }) {
  return (
    <div className="rounded-lg shadow-e1 bg-n-0 p-4">
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-n-500 mb-3">{title}</h3>
      <ul className="flex flex-col gap-3">
        {site.cutoffs.map((c) => {
          const ml = minutesBetween(now, new Date(c.departsAt))
          const risk = c.ordersAtRisk
          const color = risk > 50 ? 'var(--now-fg)' : risk > 0 ? 'var(--next-fg)' : 'var(--done-fg)'
          return (
            <li key={c.id} className="flex items-center justify-between gap-2 text-[13px]">
              <div className="flex items-center gap-2 min-w-0">
                <Truck size={14} className="text-n-400 shrink-0" />
                <span className="truncate text-n-900 font-medium">{c.carrier}</span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="tnum text-n-600">
                  {formatClock(new Date(c.departsAt))} · {ml > 0 ? `in ${relativeDuration(ml)}` : 'Departed'}
                </span>
                <span className="tnum text-[12px]" style={{ color }}>
                  {risk > 0 ? t(copy.trucks.atRisk, { n: risk }) : copy.trucks.onTrack}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
