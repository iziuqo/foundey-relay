import { useState } from 'react'
import { Check } from 'lucide-react'
import { site } from '../data/seed'
import { formatClock } from '../lib/time'
import { relativeDuration } from './TimePill'
import type { ScoreResult } from '../lib/priority'
import type { Item } from '../lib/types'
import { copy, t } from '../copy'

interface FactorEntry {
  text: string
  weight: number
}

export function buildFactors(item: Item, result: ScoreResult): FactorEntry[] {
  const entries: FactorEntry[] = []
  const ml = result.minutesLeft

  if (result.T > 0) {
    if (ml !== null && ml < 0) {
      entries.push({ text: t(copy.why.factors.lateBy, { rel: relativeDuration(-ml) }), weight: result.T })
    } else if (item.dueAt && ml !== null) {
      entries.push({
        text: t(copy.why.factors.dueIn, { hhmm: formatClock(new Date(item.dueAt)), rel: relativeDuration(ml) }),
        weight: result.T,
      })
    }
  }
  if (result.B > 0) entries.push({ text: t(copy.why.factors.blocked, { n: item.ordersBlocked }), weight: result.B })
  if (item.cutoffId) {
    const cutoff = site.cutoffs.find((c) => c.id === item.cutoffId)
    if (cutoff) {
      entries.push({
        text: t(copy.why.factors.truck, { carrier: cutoff.carrier, hhmm: formatClock(new Date(cutoff.departsAt)) }),
        weight: Math.max(result.T, 8),
      })
    }
  }
  if (item.customerImpact === 'high') entries.push({ text: copy.why.factors.customerHigh, weight: 10 })
  else if (item.customerImpact === 'low') entries.push({ text: copy.why.factors.customerLow, weight: 4 })
  if (item.compliance) entries.push({ text: copy.why.factors.compliance, weight: 15 })
  if (item.escalated) entries.push({ text: copy.why.factors.escalated, weight: 12 })
  if (item.safety) entries.push({ text: copy.why.factors.safety, weight: 50 })
  return entries
}

interface Props {
  item: Item
  result: ScoreResult
  onOpenHow: () => void
}

/** §4.3. Every factor that scored above 0, as a plain sentence with a relative weight bar. */
export function WhyList({ item, result, onOpenHow }: Props) {
  const [showScore, setShowScore] = useState(false)
  const factors = buildFactors(item, result)
  const maxWeight = Math.max(...factors.map((f) => f.weight), 1)

  return (
    <div className="rounded-lg bg-n-25 p-4">
      <h3 className="text-[15px] font-semibold text-n-900 mb-3">{copy.why.title}</h3>
      <ul className="flex flex-col gap-2.5">
        {factors.map((f, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <Check size={14} className="shrink-0" color="var(--done-solid)" />
            <span className="text-[14px] text-n-900 flex-1">{f.text}</span>
            <span
              className="block rounded-full shrink-0"
              style={{ width: Math.max(6, 64 * (f.weight / maxWeight)), height: 4, background: 'var(--n-300)' }}
              aria-hidden="true"
            />
          </li>
        ))}
      </ul>
      {result.score !== null && (
        <div className="mt-3">
          <button onClick={() => setShowScore((s) => !s)} className="text-[13px] text-n-500 underline underline-offset-2">
            {copy.why.showScore}
          </button>
          {showScore && (
            <p className="mt-1 text-[13px] text-n-600 tnum">
              {t(copy.why.scoreLine, { t: result.T, b: result.B, i: result.I, score: result.score })}
            </p>
          )}
        </div>
      )}
      <button onClick={onOpenHow} className="mt-3 text-[13px] font-medium block text-accent">
        {copy.why.howLink}
      </button>
    </div>
  )
}
