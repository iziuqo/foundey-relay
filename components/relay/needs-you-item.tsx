import { copy, t } from "@/lib/copy";
import { formatClock } from "@/lib/time";
import type { NeedsYouRow, AssignCandidate } from "@/lib/selectors";
import { Button } from "@/components/ui/button";
import { AssignPopover } from "./assign-popover";

export interface NeedsYouItemProps {
  row: NeedsYouRow;
  candidates: AssignCandidate[];
  onAssign: (itemId: string, personId: string) => void;
  onCheckIn: (personId: string) => void;
  onAcknowledge: (itemId: string) => void;
}

function reasonFor(row: NeedsYouRow): string {
  const { item, assignee } = row;
  if (row.action === "assign") {
    return item.dueAt
      ? t(copy.team.needsYouNoOwner, { title: item.title, hhmm: formatClock(new Date(item.dueAt)) })
      : t(copy.team.needsYouNoOwnerNoDue, { title: item.title });
  }
  if (row.action === "acknowledge") {
    return t(copy.team.needsYouSafety, { title: item.title });
  }
  if (item.helpAsked) {
    return t(copy.team.needsYouAsked, { name: assignee?.name.split(" ")[0] ?? "", title: item.title });
  }
  return t(copy.team.needsYouHelp, { title: item.title, n: row.minutesStalled ?? 0 });
}

/** §6.3: one row per item, one primary action — Assign, Check in, or Acknowledge. */
export function NeedsYouItem({ row, candidates, onAssign, onCheckIn, onAcknowledge }: NeedsYouItemProps) {
  const { item, assignee, action } = row;
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <p className="min-w-0 flex-1 text-(length:--text-meta) leading-(length:--leading-meta) text-(--text-1)">
        {reasonFor(row)}
      </p>
      {action === "assign" ? (
        <AssignPopover
          candidates={candidates}
          onAssign={(personId) => onAssign(item.id, personId)}
          trigger={
            <Button variant="secondary" size="sm">
              {copy.actions.assign}
            </Button>
          }
        />
      ) : action === "checkIn" ? (
        <Button variant="secondary" size="sm" onClick={() => assignee && onCheckIn(assignee.id)} disabled={!assignee}>
          {copy.actions.checkIn}
        </Button>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => onAcknowledge(item.id)}>
          {copy.actions.acknowledge}
        </Button>
      )}
    </li>
  );
}
