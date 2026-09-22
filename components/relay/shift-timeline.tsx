import { copy } from "@/lib/copy";
import { formatClock } from "@/lib/time";
import type { Cutoff } from "@/lib/types";

export interface ShiftTimelineProps {
  now: Date;
  shift: { start: string; end: string; handoffAt: string };
  cutoffs: Cutoff[];
}

/** §3.8 / §6.1 rail: the Clockwise/Amie "now line" across the shift, with truck ticks
 * and a handoff tick at 16:30. Ticks and the now line are genuine dynamic geometry
 * (live clock, real cutoff times), not color — see eslint.config.mjs's carve-out. */
export function ShiftTimeline({ now, shift, cutoffs }: ShiftTimelineProps) {
  const startMs = new Date(shift.start).getTime();
  const endMs = new Date(shift.end).getTime();
  const span = Math.max(endMs - startMs, 1);
  const pct = (iso: string) => Math.max(0, Math.min(100, ((new Date(iso).getTime() - startMs) / span) * 100));
  const nowPct = pct(now.toISOString());

  return (
    <div aria-label={copy.shiftTimeline.label} className="flex flex-col gap-2">
      <div className="relative h-2 w-full rounded-full bg-(--surface-2)">
        {/* eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (elapsed shift time), not color */}
        <div className="absolute inset-y-0 left-0 rounded-full bg-(--surface-3)" style={{ width: `${nowPct}%` }} />
        {cutoffs.map((cutoff) => (
          <span
            key={cutoff.id}
            title={cutoff.carrier}
            aria-hidden
            className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-(--text-3)"
            // eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (this cutoff's own departure time), not color
            style={{ left: `${pct(cutoff.departsAt)}%` }}
          />
        ))}
        <span
          title={copy.shiftTimeline.handoff.replace("{hhmm}", formatClock(new Date(shift.handoffAt)))}
          aria-hidden
          className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-(--when-fg)"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (the shift's own handoff time), not color
          style={{ left: `${pct(shift.handoffAt)}%` }}
        />
        <span
          aria-hidden
          className="absolute top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--act-fg)"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (the live clock), not color
          style={{ left: `${nowPct}%` }}
        />
      </div>
      <div className="tnum flex justify-between text-(length:--text-meta) text-(--text-2)">
        <span>{formatClock(new Date(shift.start))}</span>
        <span>{copy.shiftTimeline.now} {formatClock(now)}</span>
        <span>{formatClock(new Date(shift.end))}</span>
      </div>
    </div>
  );
}
