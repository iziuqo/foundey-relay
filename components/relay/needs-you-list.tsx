import { copy } from "@/lib/copy";
import type { NeedsYouRow, AssignCandidate } from "@/lib/selectors";
import { NeedsYouItem } from "./needs-you-item";

export interface NeedsYouListProps {
  rows: NeedsYouRow[];
  candidates: AssignCandidate[];
  onAssign: (itemId: string, personId: string) => void;
  onCheckIn: (personId: string, itemId: string) => void;
  onAcknowledge: (itemId: string) => void;
}

/** The manager's hero list content (§6.3) — rendered inline above the board at 1024,
 * and in the rail at 1280+ (§5); the two call sites supply their own section/aside
 * chrome, so the same list markup isn't duplicated. */
export function NeedsYouList({ rows, candidates, onAssign, onCheckIn, onAcknowledge }: NeedsYouListProps) {
  return (
    <>
      <h2 className="text-(length:--text-meta) font-semibold text-(--text-1)">{copy.team.needsYou}</h2>
      {rows.length === 0 ? (
        <p className="text-(length:--text-meta) text-(--text-2)">{copy.team.needsYouEmpty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-(--border-1)">
          {rows.map((row) => (
            <NeedsYouItem
              key={row.item.id}
              row={row}
              candidates={candidates}
              onAssign={onAssign}
              onCheckIn={(personId) => onCheckIn(personId, row.item.id)}
              onAcknowledge={onAcknowledge}
            />
          ))}
        </ul>
      )}
    </>
  );
}
