import { copy, t } from "@/lib/copy";
import { dueKind, relativeDuration } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { Cutoff } from "@/lib/types";

const WINDOW_MIN = 120;

function departureText(cutoff: Cutoff, now: Date): string {
  const kind = dueKind(cutoff.departsAt, now);
  if (kind.kind === "late-min" || kind.kind === "late-hr") {
    return copy.truckClock.railDeparted;
  }
  const rel = kind.kind === "due-in" ? relativeDuration(kind.n) : kind.hhmm;
  return kind.kind === "due-in"
    ? t(copy.truckClock.railLeavesIn, { rel })
    : t(copy.truckClock.railLeavesAt, { hhmm: rel });
}

function progressFraction(cutoff: Cutoff, now: Date): number {
  const remainingMin = (new Date(cutoff.departsAt).getTime() - now.getTime()) / 60000;
  return Math.max(0, Math.min(1, 1 - remainingMin / WINDOW_MIN));
}

function Capsule({ cutoff, now }: { cutoff: Cutoff; now: Date }) {
  const fraction = progressFraction(cutoff, now);
  return (
    <div role="listitem" className="flex min-h-22 w-56 shrink-0 flex-col gap-2 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-4 min-[75rem]:w-full">
      <div className="flex items-center justify-between gap-2">
        <span className="t-body truncate font-semibold text-(--text-1)">{cutoff.carrier}</span>
        <span className="t-meta shrink-0 rounded-(--r-2) border border-(--line-1) bg-(--surface-2) px-2 text-(--text-2)">
          {cutoff.door}
        </span>
      </div>
      <p className="tnum t-meta text-(--text-2)">{departureText(cutoff, now)}</p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--surface-2)">
        {/* The track carries no emphasis: §4.5 bans saturated colour on progress tracks,
            and --primary-bg is --text-1, so the v2 fill was a near-black bar competing
            with the hero's own button from inside a rail that is meant to be reference. */}
        {/* eslint-disable-next-line react/forbid-dom-props -- dynamic bar geometry from the live clock, not a colour token */}
        <div className="h-full rounded-full bg-(--line-2)" style={{ width: `${fraction * 100}%` }} />
      </div>
      <p className={cn("tnum t-row", cutoff.ordersAtRisk > 0 ? "text-(--text-1)" : "text-(--text-2)")}>
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

/**
 * Departure capsules, sorted by departure: carrier, door, "leaves in", a filling track,
 * and the orders at risk behind it.
 *
 * Nothing in here is saturated. In the rail this is reference material (§7.3) and §4.5
 * bans hue on progress tracks outright, so "236 orders at risk" carries its weight in
 * `font-weight` and `--text-1`, not in red — three red lines stacked down the rail were
 * the loudest thing on the v2 screen after the hero, and they rank nothing.
 */
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
