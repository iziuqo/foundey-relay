import { copy } from "@/lib/copy";
import { PeopleRow } from "./people-row";
import type { AssignCandidate, PersonTierCounts } from "@/lib/selectors";
import type { Item, Person } from "@/lib/types";

export interface RosterProps {
  workers: Person[];
  items: Item[];
  countsFor: (personId: string) => PersonTierCounts;
  candidates: AssignCandidate[];
  now: Date;
  onOpen: (personId: string) => void;
  onReassign: (itemId: string, personId: string) => void;
  /** The ghost menu's reassign action is a manager capability — a worker gets the same
   * board (§6's "everyone sees this same board") minus the one control that mutates it. */
  canReassign: boolean;
}

/**
 * §7.4: the roster half of the manager board. The NOW/NEXT/LATER caps heads sit in a
 * header row sharing `.roster-row`'s own grid so the three counts line up with the
 * columns below them — v2 printed "2 · 3 · 1" with no key at all. The header isn't a
 * `data-craft-row` itself: it carries no data, so it sits outside the measured list.
 */
export function Roster({ workers, items, countsFor, candidates, now, onOpen, onReassign, canReassign }: RosterProps) {
  return (
    <div className="overflow-hidden rounded-(--r-4) border border-(--line-1) bg-(--surface-1)">
      <h2 className="t-meta px-3 pt-3 pb-1 font-semibold text-(--text-1)">{copy.team.board}</h2>
      {/* t-meta with manual caps/tracking, not the `t-eyebrow` utility — that step is
          12px, and this page holds the same 14px floor `/work` does for anything
          carrying content (see `FyiPreview`, work/page.tsx: G3's "no computed font
          under 14px outside kbd"). */}
      <div aria-hidden className="roster-head">
        <span />
        <span />
        <span className="t-meta justify-self-end font-semibold tracking-[0.06em] text-(--text-2) uppercase">
          {copy.team.columns.now}
        </span>
        <span className="t-meta justify-self-end font-semibold tracking-[0.06em] text-(--text-2) uppercase">
          {copy.team.columns.next}
        </span>
        <span className="t-meta justify-self-end font-semibold tracking-[0.06em] text-(--text-2) uppercase">
          {copy.team.columns.later}
        </span>
        <span />
      </div>
      <ul data-craft-list data-testid="team-board">
        {workers.map((person) => {
          const currentItem = items.find((i) => i.id === person.currentTaskId);
          return (
            <PeopleRow
              key={person.id}
              person={person}
              currentItem={currentItem}
              counts={countsFor(person.id)}
              candidates={candidates}
              now={now}
              onOpen={() => onOpen(person.id)}
              onReassign={(personId) => currentItem && onReassign(currentItem.id, personId)}
              canReassign={canReassign}
            />
          );
        })}
      </ul>
    </div>
  );
}
