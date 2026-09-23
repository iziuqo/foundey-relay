import { copy, t } from "@/lib/copy";
import { dueKind, relativeDuration } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { Cutoff } from "@/lib/types";

const WINDOW_MIN = 120;

function departureText(cutoff: Cutoff, now: Date): string {
  const kind = dueKind(cutoff.departsAt, now);
  if (kind.kind === "late-min" || kind.kind === "late-hr") {
    return t(copy.truckClock.departed, { carrier: cutoff.carrier, door: cutoff.door });
  }
  const rel = kind.kind === "due-in" ? relativeDuration(kind.n) : kind.hhmm;
  return kind.kind === "due-in"
    ? t(copy.truckClock.leavesIn, { carrier: cutoff.carrier, door: cutoff.door, rel })
    : t(copy.truckClock.leavesAt, { carrier: cutoff.carrier, door: cutoff.door, hhmm: rel });
}

function progressFraction(cutoff: Cutoff, now: Date): number {
  const remainingMin = (new Date(cutoff.departsAt).getTime() - now.getTime()) / 60000;
  return Math.max(0, Math.min(1, 1 - remainingMin / WINDOW_MIN));
}

function Capsule({ cutoff, now }: { cutoff: Cutoff; now: Date }) {
  const fraction = progressFraction(cutoff, now);
  return (
    <div role="listitem" className="flex w-56 shrink-0 flex-col gap-2 rounded-(--radius-control) border border-(--border-1) bg-(--surface-1) p-3 xl:w-full">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-(length:--text-meta) font-semibold text-(--text-1)">{cutoff.carrier}</span>
        <span className="shrink-0 rounded-full border border-(--border-1) bg-(--surface-2) px-2 py-0.5 text-(length:--text-meta) font-medium text-(--text-2)">
          {cutoff.door}
        </span>
      </div>
      <p className="tnum text-(length:--text-meta) text-(--text-2)">{departureText(cutoff, now)}</p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--surface-2)">
        {/* eslint-disable-next-line react/forbid-dom-props -- dynamic bar geometry from the live clock, not a color/shadow/background token */}
        <div className="h-full rounded-full bg-(--accent-solid)" style={{ width: `${fraction * 100}%` }} />
      </div>
      <p className={cn("tnum text-(length:--text-meta)", cutoff.ordersAtRisk > 0 ? "text-(--act-fg)" : "text-(--text-2)")}>
        {cutoff.ordersAtRisk > 0 ? t(copy.truckClock.atRisk, { n: cutoff.ordersAtRisk }) : copy.truckClock.allOnTrack}
      </p>
    </div>
  );
}

export interface TruckClockProps {
  cutoffs: Cutoff[];
  now: Date;
  /** Vertical stack for the 1280+ rail; horizontal scroller everywhere else (§5). */
  stacked?: boolean;
}

/** §3.2 / §6.1: Flighty-style departure capsules, sorted by departure, with a door
 * chip, "leaves in", a filling progress track, and orders at risk. */
export function TruckClock({ cutoffs, now, stacked }: TruckClockProps) {
  const sorted = [...cutoffs].sort(
    (a, b) => new Date(a.departsAt).getTime() - new Date(b.departsAt).getTime(),
  );
  if (sorted.length === 0) {
    return <p className="text-(length:--text-meta) text-(--text-2)">{copy.truckClock.none}</p>;
  }
  return (
    <div
      role="list"
      aria-label={copy.trucks.title}
      // Not stacked (the below-1280 "strip", §5): a horizontally scrolling region needs
      // its own tab stop, or a keyboard user has no way to reach capsules past the fold
      // (axe "scrollable-region-focusable"). Stacked never scrolls, so it stays out of
      // the tab order.
      tabIndex={stacked ? undefined : 0}
      className={cn("flex gap-3 overflow-x-auto pb-1", stacked && "flex-col overflow-visible pb-0")}
    >
      {sorted.map((cutoff) => (
        <Capsule key={cutoff.id} cutoff={cutoff} now={now} />
      ))}
    </div>
  );
}
