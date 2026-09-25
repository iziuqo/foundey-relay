import NumberFlow from "@number-flow/react";
import { minutesBetween, relativeDuration } from "@/lib/time";
import { ringLabel } from "./ring-label";
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
 * wrapper still says "50 min" in full.
 *
 * A value that cannot be a bare number (past 100 minutes, or late) used to render its
 * whole label at `t-section` on the claim that 23px fits the ring. Measured, it does
 * not: "22 h 20 min" wrapped to three lines and "Late 2 h 2 min" to two, both spilling
 * over the stroke — and "22 h 20 min" is the seeded default of the last item in the
 * queue, not an edge case (M15, G11). So those values split: the magnitude stays large
 * enough to read across the aisle at `t-hero-sm`, and the unit sits under it at
 * `t-eyebrow`. The minutes a split drops are not lost — they are in this element's own
 * `aria-label`, and in the row's TimePill.
 *
 * The unit line is the unit and nothing else, because the space it has is not the 72px
 * box, it is the ring's chord at that line's own height — about 46px. "MIN LATE" is
 * 64px there and collided with the stroke; "MIN" is 28px and "H" is 10px. The word is
 * no loss: a late item's arc is *empty*, which is a stronger signal at two metres than
 * a 12px word, and "Late 2 h 2 min" is still the accessible name.
 *
 * Late magnitudes round **up** and future ones round down, so the ring never
 * under-reports how late something is: 115 minutes late reads "2 H", not "1 H".
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
  // Late is past urgent, not short of it: the numeral takes the Act-now hue too, so an
  // empty arc is never read as a cool, unstarted one.
  const hot = urgent || late;
  const strokeTier = hot ? "now" : tier;
  const label = late ? `Late ${relativeDuration(ml)}` : relativeDuration(ml);
  // The split form's rules live in `ring-label.ts`, as a pure function, so the tests can
  // enumerate what this actually renders instead of a list someone typed into a spec.
  const { bare, magnitude, magnitudeUnit, magnitudeStep, unit } = ringLabel(ml);

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
          // A round cap on a zero-length dash still paints: a late item, whose arc is by
          // definition empty, was drawing a single red pip at twelve o'clock that read as
          // a rendering fault rather than as a value.
          strokeLinecap={dash > 0 ? "round" : "butt"}
          strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
          className={cn(
            "transition-[stroke] duration-(--dur-hue) ease-(--ease-out)",
            tierStrokeClass[strokeTier],
          )}
        />
      </svg>
      <span
        aria-hidden
        className={cn(
          "tnum absolute inset-0 flex flex-col items-center justify-center text-center leading-none transition-colors duration-(--dur-hue) ease-(--ease-out)",
          hot ? "text-(--act-fg)" : "text-(--text-1)",
        )}
      >
        {bare ? (
          <span className="t-hero leading-none">
            <NumberFlow value={absMin} />
          </span>
        ) : (
          <>
            {/* The step comes from `ringLabel`, not from here: it is measured against
                the ring's chord at that step's own line height, and the fit test walks
                the same function. */}
            <span className={cn("leading-none", magnitudeStep)}>
              {magnitude}
              {magnitudeUnit}
            </span>
            {/* `t-meta`, not `t-eyebrow`. The small line was 12px, which is under the
                14px floor G3 holds every route to — it simply never failed, because no
                seeded hero reached the split form until one of them became late. */}
            <span className="t-meta leading-none text-(--text-2)">{unit}</span>
          </>
        )}
      </span>
    </div>
  );
}
