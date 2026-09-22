import NumberFlow from "@number-flow/react";
import { minutesBetween, relativeDuration } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { Item } from "@/lib/types";
import { tierStrokeClass } from "./tier-tokens";
import type { EncodedTier } from "./tier-icon";

const SIZE = 56;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const URGENT_THRESHOLD_MIN = 15;

export interface CountdownArcProps {
  item: Item;
  now: Date;
  tier: EncodedTier;
}

/**
 * §6.1 hero meta row / §2.2 "a live countdown arc". M3: the minutes digit rolls
 * (NumberFlow) each simulated tick, and at 15 minutes left the arc and label shift to
 * the Act now hue over 600ms — a reading of urgency (time itself), not of the item's
 * own tier, so a Later item still turns red as its own clock actually runs out.
 * Hours-and-minutes labels ("2 h 10 min") fall back to plain text; rolling two
 * NumberFlow instances plus a literal "h" for a rare hero state wasn't worth the
 * complexity NumberFlow already earns for the common under-an-hour case.
 */
export function CountdownArc({ item, now, tier }: CountdownArcProps) {
  if (!item.dueAt) return null;

  const due = new Date(item.dueAt).getTime();
  const created = new Date(item.createdAt).getTime();
  const total = Math.max(due - created, 60000);
  const remainingMs = due - now.getTime();
  const fraction = Math.max(0, Math.min(1, remainingMs / total));
  const dash = CIRCUMFERENCE * fraction;
  const ml = minutesBetween(now, new Date(item.dueAt));
  const late = ml < 0;
  const absMin = Math.abs(ml);
  const urgent = !late && absMin <= URGENT_THRESHOLD_MIN;
  const strokeTier = urgent ? "now" : tier;
  const label = late ? `Late ${relativeDuration(ml)}` : relativeDuration(ml);

  return (
    <div className="flex w-20 flex-col items-center gap-1" role="img" aria-label={label}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={STROKE} className="stroke-(--border-1)" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
          className={cn("transition-[stroke] duration-[600ms] ease-out", tierStrokeClass[strokeTier])}
        />
      </svg>
      <span
        aria-hidden
        className={cn(
          "tnum flex items-baseline justify-center gap-0.5 text-center text-(length:--text-meta) font-semibold transition-colors duration-[600ms] ease-out",
          urgent ? "text-(--act-fg)" : "text-(--text-1)",
        )}
      >
        {late && "Late "}
        {absMin < 60 ? <NumberFlow value={absMin} suffix=" min" /> : relativeDuration(absMin)}
      </span>
    </div>
  );
}
