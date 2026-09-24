import { Cpu } from "lucide-react";
import { copy, t } from "@/lib/copy";
import { formatClock } from "@/lib/time";
import type { UpdateRow } from "@/lib/selectors";
import type { Person } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "./person-avatar";
import { relativePast } from "./update-row";

export interface UpdateDetailProps {
  row: UpdateRow;
  author: Person | undefined;
  now: Date;
  unread: boolean;
  onMarkRead: () => void;
}

export function UpdateDetail({ row, author, now, unread, onMarkRead }: UpdateDetailProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        {author ? (
          <PersonAvatar initials={author.initials} />
        ) : (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--surface-3)">
            <Cpu className="size-(--icon-lg) text-(--text-2)" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <p className="t-meta font-semibold text-(--text-1)">
            {author ? t(copy.updates.from, { name: author.name }) : copy.updates.fromSystem}
          </p>
          <p className="tnum t-meta text-(--text-2)">
            {formatClock(new Date(row.at))} · {relativePast(row.at, now)}
          </p>
        </div>
      </div>

      {row.title && <p className="t-section text-(--text-1)">{row.title}</p>}
      <p className="t-body text-(--text-1)">{row.reason}</p>

      {unread && (
        <Button variant="secondary" size="sm" className="self-start" onClick={onMarkRead}>
          {copy.updates.markRead}
        </Button>
      )}
    </div>
  );
}
