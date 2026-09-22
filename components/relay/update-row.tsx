import { Cpu } from "lucide-react";
import { copy, t } from "@/lib/copy";
import { relativeDuration, minutesBetween } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { UpdateRow } from "@/lib/selectors";
import type { Person } from "@/lib/types";
import { PersonAvatar } from "./person-avatar";

export function relativePast(at: string, now: Date): string {
  const mins = minutesBetween(new Date(at), now);
  if (mins < 1) return copy.time.justNow;
  return t(copy.time.ago, { rel: relativeDuration(mins) });
}

export interface UpdateRowViewProps {
  row: UpdateRow;
  author: Person | undefined;
  now: Date;
  unread: boolean;
  selected: boolean;
  onSelect: () => void;
}

/** §6.4: every row shows its item title plus the reason line (README P1 19 — v1's "For
 * you" rows showed only the reason). Unread dot. One row shape covers both an
 * item-backed row (title set) and a plain team/system entry (title null, `reason` is
 * already a full sentence). */
export function UpdateRowView({ row, author, now, unread, selected, onSelect }: UpdateRowViewProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "flex w-full min-h-(--size-row-min) items-start gap-3 border-b border-(--border-1) px-3 py-3 text-left last:border-0",
          "hover:bg-(--surface-2) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus) focus-visible:ring-inset",
          selected && "bg-(--surface-2)",
        )}
      >
        <span className="flex w-5 shrink-0 justify-center pt-1.5">
          {unread && <span aria-hidden className="size-2 rounded-full bg-(--accent-solid)" />}
        </span>
        {author ? (
          <PersonAvatar initials={author.initials} size="sm" className="mt-0.5" />
        ) : (
          <Cpu className="mt-0.5 size-(--size-icon-md) shrink-0 text-(--text-3)" aria-hidden />
        )}
        <span className="min-w-0 flex-1">
          {row.title && (
            <span className="block text-(length:--text-meta) font-medium text-(--text-1)">{row.title}</span>
          )}
          <span className="block text-(length:--text-meta) text-(--text-2)">{row.reason}</span>
          <span className="tnum mt-0.5 block text-(length:--text-meta) text-(--text-2)">{relativePast(row.at, now)}</span>
        </span>
      </button>
    </li>
  );
}
