import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { copy, t } from "@/lib/copy";
import { formatClock, minutesBetween, relativeDuration } from "@/lib/time";
import { site } from "@/lib/seed";
import { cn } from "@/lib/cn";
import { stagger, stepDelay, transition } from "@/lib/motion";
import type { Ranked } from "@/lib/priority";
import type { Item } from "@/lib/types";

const T_MAX = 40;
const B_MAX = 30;
const I_MAX = 87; // customerHigh(10) + compliance(15) + escalated(12) + safety(50)

/** The most each factor can add to a score, for anything that has to state the rule (the
 * deck's priority-rule slide reads these rather than retyping them). */
export const FACTOR_MAX = { T: T_MAX, B: B_MAX, I: I_MAX } as const;

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

function FactorBar({
  label,
  value,
  max,
  reason,
  index,
  animate,
}: {
  label: string;
  value: number;
  max: number;
  reason: string;
  /** M10: bars fill left to right with a 50ms stagger, on first open per item only. */
  index: number;
  animate: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex flex-col gap-1">
      {/* s01 (Supabase observability): tiny caps label, large number. The label is the
          least important part of a factor bar — the number is what the reader compares
          — so it gets the smaller step, not the matching one. */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="t-eyebrow text-(--text-2)">{label}</span>
        {/* The bar below is decorative — a 1.62:1 fill-to-track is not a real contrast
            pair (v1 README, a real non-text-contrast failure). "value of max" is the
            text alternative, for every reader, not only a screen reader. */}
        <span className="tnum t-body font-semibold text-(--text-1)">{t(copy.why.factorValue, { value, max })}</span>
      </div>
      {/* The track is `--line-2`, not `--surface-2` — the panel around it (item-detail.tsx)
          is already `--surface-2`, and a same-token track on a same-token panel is invisible
          (0:1 contrast) regardless of what the fill does. */}
      <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-(--line-2)">
        {/* `style` here is dynamic bar geometry from live scores, not a color/shadow/
            background token (plan §9.2 P1 9-11 is about those) — the fill itself is
            still the token bg-(--primary-bg), which resolves to `--text-1` (§4.2: the
            primary button is text-1 filled, not accent filled — the same rule applies
            here, so the bar never spends a saturated hue). motion.div isn't a plain DOM
            element to the forbid-dom-props rule, so no disable comment is needed here. */}
        <motion.div
          className="h-full origin-left rounded-full bg-(--primary-bg)"
          style={{ width: `${pct}%` }}
          initial={animate ? { scaleX: 0 } : false}
          animate={{ scaleX: 1 }}
          transition={
            animate
              ? { ...transition.bars, delay: stepDelay(index, stagger.bars) }
              : { duration: 0 }
          }
        />
      </div>
      <p className="text-(length:--t-meta-size) text-(--text-2)">{reason}</p>
    </div>
  );
}

/** M10: "Animate on first open per item only." A module-scoped set survives remounts
 * within the session (closing and reopening the same item's sheet), which a
 * per-component ref would not. Read in a `useState` initializer, written in an effect
 * — Strict Mode double-invokes the initializer, so writing there would mark an item
 * "seen" before it ever animated. */
const animatedItemIds = new Set<string>();

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
  const [animate] = useState(() => !animatedItemIds.has(item.id));
  useEffect(() => {
    animatedItemIds.add(item.id);
  }, [item.id]);

  const compare =
    nextRanked && result.score !== null && nextRanked.result.score !== null
      ? t(copy.why.compareAbove, {
          title: nextRanked.item.title,
          scoreA: result.score,
          scoreB: nextRanked.result.score,
        })
      : copy.why.topOfQueue;

  return (
    <div data-bars-animate={animate}>
      {showTitle && <p className="t-section text-(--text-1)">{copy.why.title}</p>}
      <div className={cn("flex flex-col gap-3", showTitle && "mt-3")}>
        <FactorBar index={0} label="Time" value={result.T} max={T_MAX} reason={timeReason(item, now)} animate={animate} />
        <FactorBar
          index={1}
          label="Orders blocked"
          value={result.B}
          max={B_MAX}
          reason={blockedReason(item)}
          animate={animate}
        />
        <FactorBar index={2} label="Impact" value={result.I} max={I_MAX} reason={impactReasons(item)} animate={animate} />
      </div>
      <p className="tnum t-body mt-3 border-t border-(--line-1) pt-3 font-semibold text-(--text-1)">
        {t(copy.why.scoreLine, { t: result.T, b: result.B, i: result.I, score: result.score ?? 0 })}
      </p>
      <p className="t-meta mt-1 text-(--text-2)">{verdictLine(ranked)}</p>
      <p className="t-meta mt-2 text-(--text-2)">{compare}</p>
    </div>
  );
}
