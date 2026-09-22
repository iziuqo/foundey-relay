import { ArrowRight } from 'lucide-react'
import { PriorityIcon, tierIconMeta } from './PriorityIcon'
import { TimePill } from './TimePill'
import { SourceTag } from './SourceTag'
import { Chip } from './Chip'
import { ActionBar } from './ActionBar'
import { NewUrgentBand } from './NewUrgentBand'
import { site } from '../data/seed'
import { formatClock } from '../lib/time'
import { copy, t } from '../copy'
import type { Ranked } from '../lib/priority'

const TIER_STYLE: Record<'now' | 'next' | 'later', { border: string; rail?: string }> = {
  now: { border: 'var(--now-border)', rail: 'var(--now-solid)' },
  next: { border: 'var(--next-border)', rail: 'var(--next-rail)' },
  later: { border: 'var(--n-200)' },
}

const EYEBROW: Record<'now' | 'next' | 'later', string> = {
  now: copy.hero.now,
  next: copy.hero.next,
  later: copy.hero.later,
}

interface Props {
  ranked: Ranked
  now: Date
  position: number
  total: number
  workingMinutes?: number | null
  band?: { title: string; onShowMe: () => void; onStayHere: () => void } | null
}

export function HeroCard({ ranked, now, position, total, workingMinutes, band }: Props) {
  const { item, result } = ranked
  const tier = result.tier as 'now' | 'next' | 'later'
  const style = TIER_STYLE[tier]
  const meta = tierIconMeta(tier)
  const cutoff = item.cutoffId ? site.cutoffs.find((c) => c.id === item.cutoffId) : null

  return (
    <div
      className="relative bg-n-0 rounded-xl shadow-e2 p-6 w-full"
      style={{ maxWidth: 744, border: `1px solid ${style.border}`, boxShadow: style.rail ? `inset 4px 0 0 ${style.rail}` : undefined }}
    >
      {band && <NewUrgentBand title={band.title} onShowMe={band.onShowMe} onStayHere={band.onStayHere} />}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <PriorityIcon tier={tier} size={20} />
        <span className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: meta.color }}>
          {EYEBROW[tier]}
        </span>
        <span className="text-[12px] text-n-500 tnum">{t(copy.hero.of, { i: position, n: total })}</span>
        <div className="flex-1" />
        <TimePill dueAt={item.dueAt} now={now} tier={tier} size="lg" />
      </div>

      <h2 className="text-[22px] leading-[30px] font-semibold tracking-[-0.01em] text-n-900 mb-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.title}
      </h2>

      <p className="text-[15px] leading-[22px] mb-2">
        <span className="font-semibold text-n-900">{copy.hero.whyFirst}</span> <span className="text-n-600">{item.whyText}</span>
      </p>

      <p className="flex items-center gap-1.5 text-[14px] leading-5 text-n-600 mb-2">
        <ArrowRight size={14} />
        {t(copy.hero.nextStep, { action: item.primaryAction })}
      </p>

      <div className="flex items-center gap-2 text-[13px] leading-[18px] text-n-500 flex-wrap">
        <SourceTag source={item.source} />
        {cutoff && (
          <>
            <span aria-hidden="true">·</span>
            <span>{t(copy.hero.truckAt, { carrier: cutoff.carrier, hhmm: formatClock(new Date(cutoff.departsAt)) })}</span>
          </>
        )}
        {item.ordersBlocked > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <span>{t(copy.hero.ordersWaiting, { n: item.ordersBlocked })}</span>
          </>
        )}
      </div>

      {item.status === 'in_progress' && workingMinutes != null && (
        <div className="mt-3">
          <Chip tone="accent">{t(copy.hero.working, { n: workingMinutes })}</Chip>
        </div>
      )}

      <div className="h-px bg-n-100 my-5" />

      <ActionBar item={item} now={now} size="lg" />
    </div>
  )
}
