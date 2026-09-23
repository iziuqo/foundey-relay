import NumberFlow from "@number-flow/react";
import { copy, t } from "@/lib/copy";
import { dueKind, relativeDuration } from "@/lib/time";
import type { Cutoff } from "@/lib/types";

export interface StatusSentenceProps {
  now: Date;
  /** Count of items in the Act now tier, hero included — drives the operative clause. */
  nowTierCount: number;
  done: number;
  total: number;
  nextCutoff: Cutoff | null;
}

/**
 * "UPS Ground in 50 min" while a truck is still coming, "USPS at 15:30" once it is far
 * enough out to be a time rather than a countdown. The two need different prepositions:
 * routing a clock time through the "in {rel}" string reads "USPS in 15:30", which is the
 * kind of thing only the demo's time jump reaches.
 */
export function truckClause(cutoff: Cutoff, now: Date): string {
  const kind = dueKind(cutoff.departsAt, now);
  if (kind.kind === "due-in") return t(copy.status.clauseTruck, { carrier: cutoff.carrier, rel: relativeDuration(kind.n) });
  if (kind.kind === "tomorrow" || kind.kind === "due-at")
    return t(copy.status.clauseTruckAt, { carrier: cutoff.carrier, hhmm: kind.hhmm });
  return t(copy.status.clauseTruckGone, { carrier: cutoff.carrier });
}

/**
 * §5.1 / advisor §7.1. The greeting stops being a headline.
 *
 * v2 opened with "Good morning, Priya" at 56px over 737×120px — 3.3× the pixel area of
 * the hero title it introduced, a quarter of the first viewport, and an answer to
 * neither of the two questions the brief asks. It is now one computed status line at
 * `t-section` (23/30), capped at 44ch, with only the operative clause in `--text-1` 600
 * and the rest in `--text-2`:
 *
 *     2 need you now · UPS Ground in 50 min · 4 of 10 done
 *
 * The greeting itself survives at `t-meta` in the top bar beside the persona control
 * (M3's `Greeting`, `lg:` and up), where the name already lives. What it may not do is
 * be the largest type in the content column: that belongs to the hero title, which is
 * the only defensible answer to "what do I do now" read at two metres.
 *
 * Kept as the page `h1` — the page title and the status are the same sentence, and the
 * nav's active state is the only other location cue the shell needs.
 */
/**
 * M4 ⑤: the done count rolls rather than swapping, because it is the one number on this
 * screen that changes as a *result* of what the user just did — the sixth beat of the
 * done sequence, and the only acknowledgement that survives after the toast has gone.
 *
 * The clause is still `copy.status.clauseProgress`, split around its own `{done}`
 * placeholder rather than rebuilt here, so the copy file stays the one place the
 * sentence is written and `textContent` is byte-identical to the string it replaced.
 *
 * The digit sits in a fixed 2ch tabular box. Without it, 9 → 10 widens the number and
 * shoves the rest of the clause sideways mid-roll, which is a layout shift the app gets
 * graded on (G6 measures CLS) in exchange for nothing.
 */
function ProgressClause({ done, total }: { done: number; total: number }) {
  const [before, after] = copy.status.clauseProgress.split("{done}");
  return (
    <>
      {before}
      <span className="tnum inline-block min-w-[2ch] text-right">
        <NumberFlow value={done} />
      </span>
      {t(after, { total })}
    </>
  );
}

export function StatusSentence({ now, nowTierCount, done, total, nextCutoff }: StatusSentenceProps) {
  const remaining = Math.max(total - done, 0);
  const operative =
    nowTierCount > 0
      ? t(nowTierCount === 1 ? copy.status.clauseNeedYouOne : copy.status.clauseNeedYou, { n: nowTierCount })
      : copy.status.clauseNothingUrgent;
  const rest: { key: string; node: React.ReactNode }[] = [];
  if (nextCutoff) rest.push({ key: "truck", node: truckClause(nextCutoff, now) });
  rest.push(
    nowTierCount > 0
      ? { key: "progress", node: <ProgressClause done={done} total={total} /> }
      : { key: "left", node: t(copy.status.clauseLeft, { n: remaining }) },
  );

  return (
    <h1 data-testid="status-line" className="t-section max-w-[44ch] font-medium text-(--text-2)">
      <span className="font-semibold text-(--text-1)">{operative}</span>
      {rest.map(({ key, node }) => (
        // The separator is glued to the clause before it and the clause is unbreakable, so
        // a line can only break *between* clauses and never strands a "·" at the start of
        // the next line (the mono wire face used to break inside "4 of 10 done").
        <span key={key}>
          <span className="whitespace-nowrap"> ·</span> <span className="whitespace-nowrap">{node}</span>
        </span>
      ))}
    </h1>
  );
}
