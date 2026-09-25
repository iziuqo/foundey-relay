import { Cpu } from "lucide-react";
import { copy, t } from "@/lib/copy";
import { relativeDuration, minutesBetween } from "@/lib/time";
import { cn } from "@/lib/cn";
import { FOCUS } from "@/components/ui/sizing";
import type { UpdateRow } from "@/lib/selectors";
import type { Person } from "@/lib/types";
import { PersonAvatar } from "./person-avatar";

export function relativePast(at: string, now: Date): string {
  const mins = minutesBetween(new Date(at), now);
  if (mins < 1) return copy.time.justNow;
  return t(copy.time.ago, { rel: relativeDuration(mins) });
}

/**
 * The list's form of the same thing, rounded down to the hour once there is an hour.
 *
 * The row is a grid whose last column is `auto` and `whitespace-nowrap`, so whatever this
 * returns is taken off the title before the title gets anything. Measured at 390 on the
 * production build, `relativePast` took 113px of a 356px row — more than the title's 131px,
 * for a label accurate to the minute about something two hours old — and every title in the
 * list truncated to about eight characters. Recency is what a list needs; precision is what
 * the detail is for, and it still prints the clock time beside the full relative one.
 */
export function relativePastShort(at: string, now: Date): string {
  const mins = minutesBetween(new Date(at), now);
  if (mins < 1) return copy.time.justNow;
  if (mins < 60) return t(copy.time.ago, { rel: relativeDuration(mins) });
  return t(copy.time.agoHours, { n: String(Math.floor(mins / 60)) });
}

export interface UpdateRowViewProps {
  row: UpdateRow;
  author: Person | undefined;
  now: Date;
  unread: boolean;
  selected: boolean;
  onSelect: () => void;
}

/**
 * §6.4: one row shape for every entry (`.update-row`, globals.css) — an item-backed
 * "for you" row (title set, README P1 19's fix keeps the title visible) and a plain
 * team/system entry (title null, `reason` is already a full sentence) used to be a
 * three-line row next to a two-line one. Here a row without a title promotes `reason`
 * into the title line instead, so every row is exactly one line of title plus one
 * (possibly empty) line of detail, at a shared fixed height. Unread carries no hue
 * (§4.2's chroma whitelist has no room for it) — weight on the title and a neutral
 * `--text-1` dot instead of an accent one.
 *
 * The row itself is the grid (`data-craft-row`); an absolutely positioned button
 * supplies the single click/focus target as a sibling of the visible content, never a
 * wrapper around it (`people-row.tsx`'s same shape).
 */
export function UpdateRowView({ row, author, now, unread, selected, onSelect }: UpdateRowViewProps) {
  const titleLine = row.title ?? row.reason;
  const metaLine = row.title ? row.reason : null;
  const label = row.title ? `${row.title} — ${row.reason}` : row.reason;

  return (
    <li
      data-craft-row
      className={cn("update-row group relative hover:bg-(--surface-2)", selected && "bg-(--surface-2)")}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        aria-label={label}
        className={cn("absolute inset-0 rounded-(--r-2)", FOCUS)}
      />

      <span aria-hidden className="pointer-events-none flex justify-center">
        {unread && <span className="size-1.5 rounded-full bg-(--text-1)" />}
      </span>

      <span aria-hidden className="pointer-events-none">
        {author ? (
          <PersonAvatar initials={author.initials} size="sm" />
        ) : (
          <Cpu className="icon-lg text-(--text-3)" />
        )}
      </span>

      <span className="pointer-events-none flex min-w-0 flex-col justify-center gap-0.5">
        <span className={cn("t-row truncate", unread ? "font-semibold text-(--text-1)" : "font-medium text-(--text-1)")}>
          {titleLine}
        </span>
        {/* t-body, not t-meta: on a page this short, a list of tab labels plus one
            more 14px line per row pushed a single size to 70% of the page's text
            (check 2) — the row subtitle steps up, matching how §3.4 already treats
            the queue row's own subtitle on a handheld. */}
        {metaLine && <span className="t-body truncate text-(--text-2)">{metaLine}</span>}
      </span>

      <span aria-hidden className="tnum pointer-events-none t-body justify-self-end whitespace-nowrap text-(--text-2)">
        {relativePastShort(row.at, now)}
      </span>
    </li>
  );
}
