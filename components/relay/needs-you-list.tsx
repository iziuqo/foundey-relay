import { copy } from "@/lib/copy";
import { SectionBand } from "@/components/ui/section-band";
import type { NeedsYouRow, AssignCandidate } from "@/lib/selectors";
import { NeedsYouItem } from "./needs-you-item";

export interface NeedsYouListProps {
  rows: NeedsYouRow[];
  candidates: AssignCandidate[];
  onAssign: (itemId: string, personId: string) => void;
  onCheckIn: (personId: string, itemId: string) => void;
  onAcknowledge: (itemId: string) => void;
}

/**
 * §7.4 "Needs you (n)": the triage list, stacked above the roster at every width — it
 * holds Assign and Acknowledge controls, so it can never live in `PageRail` (§5.1
 * requires zero interactive elements there). Same band-plus-rows shape as the worker
 * queue's tier groups (`queue.tsx`), for one shared vocabulary between the two screens.
 */
export function NeedsYouList({ rows, candidates, onAssign, onCheckIn, onAcknowledge }: NeedsYouListProps) {
  return (
    <div data-testid="needs-you" className="overflow-hidden rounded-(--r-4) border border-(--line-1) bg-(--surface-1)">
      <SectionBand label={copy.team.needsYou} count={rows.length} />
      {rows.length === 0 ? (
        <p className="t-body px-3 py-4 text-(--text-2)">{copy.team.needsYouEmpty}</p>
      ) : (
        <ul data-craft-list>
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
    </div>
  );
}
