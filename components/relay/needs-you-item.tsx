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

/**
 * §7.4: one row per item, queue-style, one primary action — Assign, open that person's
 * queue, or Acknowledge. Never the generic "Check in": the button that opens a person's
 * queue says whose it is, because that is the one piece "Check in" never carried.
 *
 * Reuses `.queue-row` (advisor §5.1) rather than inventing a second row shape: same
 * fixed height, same inset-shadow separator, same `--meta-w` escape hatch for a wider
 * action slot than the queue's own time-pill column needs. Unlike the ranked queue, the
 * action here is the row's only path to doing anything about it, so it stays visible
 * below 768 too (`needs-row` keeps a third track there instead of `.queue-row`'s own
 * two-track collapse, which assumes the row's real target is a link, not a button).
 */
export function NeedsYouItem({ row, candidates, onAssign, onCheckIn, onAcknowledge }: NeedsYouItemProps) {
  const { item, assignee, action } = row;
  return (
    <li data-craft-row className="queue-row needs-row [--meta-w:auto]">
      <span aria-hidden />
      <p className="t-body min-w-0 truncate text-(--text-1)">{reasonFor(row)}</p>
      <span aria-hidden className="max-md:hidden" />
      <div className="justify-self-end">
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
            {assignee ? t(copy.team.openQueue, { name: assignee.name.split(" ")[0] }) : copy.actions.acknowledge}
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => onAcknowledge(item.id)}>
            {copy.actions.acknowledge}
          </Button>
        )}
      </div>
    </li>
  );
}
