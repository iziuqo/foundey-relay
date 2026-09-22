import { minutesBetween, relativeDuration } from "@/lib/time";
import type { Item } from "@/lib/types";
import { tierStrokeClass } from "./tier-tokens";
import type { EncodedTier } from "./tier-icon";

const SIZE = 56;
const STROKE = 4;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface CountdownArcProps {
  item: Item;
  now: Date;
  tier: EncodedTier;
}

/** §6.1 hero meta row / §2.2 "a live countdown arc". The digit roll (M3) is phase 6
 * motion; this renders the arc and the current minutes as plain tabular text. */
export function CountdownArc({ item, now, tier }: CountdownArcProps) {
  if (!item.dueAt) return null;

  const due = new Date(item.dueAt).getTime();
  const created = new Date(item.createdAt).getTime();
  const total = Math.max(due - created, 60000);
  const remainingMs = due - now.getTime();
  const fraction = Math.max(0, Math.min(1, remainingMs / total));
  const dash = CIRCUMFERENCE * fraction;
  const ml = minutesBetween(now, new Date(item.dueAt));
  const label = ml < 0 ? `Late ${relativeDuration(ml)}` : relativeDuration(ml);

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
          className={tierStrokeClass[tier]}
        />
      </svg>
      <span aria-hidden className="tnum text-center text-(length:--text-meta) font-semibold text-(--text-1)">
        {label}
      </span>
    </div>
  );
}
