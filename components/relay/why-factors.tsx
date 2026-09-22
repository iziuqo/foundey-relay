import { copy, t } from "@/lib/copy";
import { formatClock, minutesBetween, relativeDuration } from "@/lib/time";
import { site } from "@/lib/seed";
import { cn } from "@/lib/cn";
import type { Ranked } from "@/lib/priority";
import type { Item } from "@/lib/types";

const T_MAX = 40;
const B_MAX = 30;
const I_MAX = 87; // customerHigh(10) + compliance(15) + escalated(12) + safety(50)

function timeReason(item: Item, now: Date): string {
  if (!item.dueAt) return copy.why.factors.noDue;
  const target = new Date(item.dueAt);
  const ml = minutesBetween(now, target);
  if (ml < 0) return t(copy.why.factors.lateBy, { rel: relativeDuration(ml) });
  const cutoff = item.cutoffId ? site.cutoffs.find((c) => c.id === item.cutoffId) : undefined;
  if (cutoff) return t(copy.why.factors.truck, { carrier: cutoff.carrier, hhmm: formatClock(target) });
  return t(copy.why.factors.dueIn, { hhmm: formatClock(target), rel: relativeDuration(ml) });
}

function blockedReason(item: Item): string {
  return item.ordersBlocked > 0
    ? t(copy.why.factors.blocked, { n: item.ordersBlocked })
    : copy.why.factors.noneBlocked;
}

function impactReasons(item: Item): string {
  const reasons: string[] = [];
  if (item.safety) reasons.push(copy.why.factors.safety);
  if (item.compliance) reasons.push(copy.why.factors.compliance);
  if (item.escalated) reasons.push(copy.why.factors.escalated);
  if (item.customerImpact === "high") reasons.push(copy.why.factors.customerHigh);
  else if (item.customerImpact === "low") reasons.push(copy.why.factors.customerLow);
  return reasons.length > 0 ? reasons.join(" ") : copy.why.factors.noImpact;
}

function verdictLine(ranked: Ranked): string {
  if (ranked.item.safety) return copy.why.verdict.safety;
  const score = ranked.result.score ?? 0;
  if (ranked.result.tier === "now") return t(copy.why.verdict.now, { score });
  if (ranked.result.tier === "next") return t(copy.why.verdict.next, { score });
  return t(copy.why.verdict.later, { score });
}

function FactorBar({ label, value, max, reason }: { label: string; value: number; max: number; reason: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-(length:--text-meta) font-medium text-(--text-1)">{label}</span>
        <span className="tnum text-(length:--text-meta) font-medium text-(--text-2)">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--surface-2)">
        {/* eslint-disable-next-line react/forbid-dom-props -- dynamic bar geometry from
            live scores, not a color/shadow/background token (plan §9.2 P1 9-11 is about
            those); the fill itself is still the token bg-(--accent-solid). */}
        <div className="h-full rounded-full bg-(--accent-solid)" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-(length:--text-meta) text-(--text-2)">{reason}</p>
    </div>
  );
}

export interface WhyFactorsProps {
  ranked: Ranked;
  nextRanked: Ranked | null;
  now: Date;
  /** The popover repeats the question as its own title; the inline detail placement
   * (§6.2) already has "Why is this first?" as the section heading, so it skips this. */
  showTitle?: boolean;
}

/**
 * The Xero-structured "why" breakdown (§3.6): three factor bars with the item's own
 * numbers, a total line, a verdict, and a comparison with the next item down. Numbers
 * come straight from `scoreItem` via the `Ranked` the caller already computed; this
 * never recomputes the score. Shared by the hero's popover (WhyPopover) and the item
 * detail page/sheet, which shows the same bars inline instead of behind a click (§6.2).
 */
export function WhyFactors({ ranked, nextRanked, now, showTitle = true }: WhyFactorsProps) {
  const { item, result } = ranked;
  const compare =
    nextRanked && result.score !== null && nextRanked.result.score !== null
      ? t(copy.why.compareAbove, {
          title: nextRanked.item.title,
          scoreA: result.score,
          scoreB: nextRanked.result.score,
        })
      : copy.why.topOfQueue;

  return (
    <div>
      {showTitle && (
        <p className="text-(length:--text-title) leading-(length:--leading-title) font-semibold text-(--text-1)">
          {copy.why.title}
        </p>
      )}
      <div className={cn("flex flex-col gap-3", showTitle && "mt-3")}>
        <FactorBar label="Time" value={result.T} max={T_MAX} reason={timeReason(item, now)} />
        <FactorBar label="Orders blocked" value={result.B} max={B_MAX} reason={blockedReason(item)} />
        <FactorBar label="Impact" value={result.I} max={I_MAX} reason={impactReasons(item)} />
      </div>
      <p className="tnum mt-3 border-t border-(--border-1) pt-3 text-(length:--text-meta) font-medium text-(--text-1)">
        {t(copy.why.scoreLine, { t: result.T, b: result.B, i: result.I, score: result.score ?? 0 })}
      </p>
      <p className="mt-1 text-(length:--text-meta) text-(--text-2)">{verdictLine(ranked)}</p>
      <p className="mt-2 text-(length:--text-meta) text-(--text-2)">{compare}</p>
    </div>
  );
}
