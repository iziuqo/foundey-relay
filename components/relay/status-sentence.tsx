import { copy, t } from "@/lib/copy";
import { greetingPeriod, dueKind, relativeDuration } from "@/lib/time";
import type { Cutoff } from "@/lib/types";

export interface StatusSentenceProps {
  name: string;
  now: Date;
  /** Count of items in the Act now tier, hero included — drives the "N things need you" clause. */
  nowTierCount: number;
  done: number;
  total: number;
  nextCutoff: Cutoff | null;
}

function truckLine(cutoff: Cutoff, now: Date): string {
  const kind = dueKind(cutoff.departsAt, now);
  if (kind.kind === "due-in" || kind.kind === "tomorrow") {
    const rel = kind.kind === "due-in" ? relativeDuration(kind.n) : kind.hhmm;
    return t(copy.status.truckLine, { carrier: cutoff.carrier, rel });
  }
  if (kind.kind === "late-min" || kind.kind === "late-hr") {
    return t(copy.truckClock.departed, { carrier: cutoff.carrier, door: cutoff.door });
  }
  return t(copy.truckClock.leavesAt, { carrier: cutoff.carrier, door: cutoff.door, hhmm: kind.hhmm });
}

/**
 * §3.3 / §6.1: replaces "Good morning, Priya" and a duplicate page title with one
 * computed status sentence, plus a shift-progress line under it. Page title and
 * greeting are the same element — the left nav's active state is the only other
 * location cue (README §8.9).
 */
export function StatusSentence({ name, now, nowTierCount, done, total, nextCutoff }: StatusSentenceProps) {
  const period = greetingPeriod(now);
  const greeting = t(copy.greeting[period], { name });
  const remaining = Math.max(total - done, 0);
  const status =
    nowTierCount > 0
      ? t(nowTierCount === 1 ? copy.status.needYouOne : copy.status.needYou, { n: nowTierCount })
      : t(copy.status.nothingUrgent, { n: remaining });
  const truck = nextCutoff ? truckLine(nextCutoff, now) : null;

  return (
    <div>
      <h1 className="text-(length:--text-display) leading-(length:--leading-display) font-semibold text-(--text-1)">
        {greeting} {status}
      </h1>
      <p className="tnum mt-1 text-(length:--text-body) text-(--text-2)">
        {t(copy.status.progress, { done, total })}
        {truck ? ` · ${truck}` : ""}
      </p>
    </div>
  );
}
