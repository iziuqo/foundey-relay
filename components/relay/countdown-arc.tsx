import NumberFlow from "@number-flow/react";
import { minutesBetween, relativeDuration } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { Item } from "@/lib/types";
import { tierStrokeClass } from "./tier-tokens";
import type { EncodedTier } from "./tier-icon";

const SIZE = 72;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const URGENT_THRESHOLD_MIN = 15;

export interface CountdownArcProps {
  item: Item;
  now: Date;
  tier: EncodedTier;
  className?: string;
}

/**
 * The hero countdown: one 72px ring with the numeral inside it.
 *
 * v3 M4 moved the numeral from under the ring into it, and that is a geometry fix, not
 * a style one. Stacked, the object measured 76px tall, and as the tallest child of the
 * hero's eyebrow row it set that row's height — which is the whole of v2's measured
 * 73px void between the eyebrow and the title (advisor §7.3). Square, it sits outside
 * the eyebrow's flow entirely (hero.tsx positions it absolutely) and the eyebrow is
 * free to be the 28px text row it should always have been.
 *
 * The numeral is `t-hero`, tabular: §3.3 counts the hero countdown as one of exactly
 * three things on this screen that are read at two metres, and that needs 33px. Only
 * the number is shown — the ring itself is the unit, and the accessible name on the
 * wrapper still says "50 min" in full. Values that cannot be a bare number (an
 * hours-and-minutes label, or a late one) drop to `t-section`, which fits the ring
 * without the digits colliding with the stroke.
 *
 * At 15 minutes left the arc and numeral shift to the Act-now hue over 600ms — a
 * reading of time itself, not of the item's tier, so a When-you-can item still turns
 * red as its own clock actually runs out.
 */
export function CountdownArc({ item, now, tier, className }: CountdownArcProps) {
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
  const bare = !late && absMin < 100;

  return (
    <div
      data-testid="hero-countdown"
      role="img"
      aria-label={label}
      className={cn("relative size-18 shrink-0", className)}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" strokeWidth={STROKE} className="stroke-(--line-1)" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
          className={cn(
            "transition-[stroke] duration-(--dur-slow) ease-(--ease-out)",
            tierStrokeClass[strokeTier],
          )}
        />
      </svg>
      <span
        aria-hidden
        className={cn(
          "tnum absolute inset-0 flex items-center justify-center text-center transition-colors duration-(--dur-slow) ease-(--ease-out)",
          bare ? "t-hero" : "t-section",
          urgent ? "text-(--act-fg)" : "text-(--text-1)",
        )}
      >
        {bare ? <NumberFlow value={absMin} /> : label}
      </span>
    </div>
  );
}
