import { MoreHorizontal } from "lucide-react";
import { copy, t } from "@/lib/copy";
import { scoreItem } from "@/lib/priority";
import { cn } from "@/lib/cn";
import type { Item, Person } from "@/lib/types";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { FOCUS } from "@/components/ui/sizing";
import { PersonAvatar } from "./person-avatar";
import { TierIcon } from "./tier-icon";
import { tierFgClass } from "./tier-tokens";
import { AssignPopover } from "./assign-popover";
import type { PersonTierCounts, AssignCandidate } from "@/lib/selectors";

export interface PeopleRowProps {
  person: Person;
  currentItem: Item | undefined;
  counts: PersonTierCounts;
  candidates: AssignCandidate[];
  now: Date;
  /** Selecting the row opens the read-only sheet — this is the row's main target. */
  onOpen: () => void;
  /** The ghost menu's one quick action: hand the person's current item to someone else
   * without leaving the board. */
  onReassign: (personId: string) => void;
  /** Reassigning is a manager capability — a worker viewing the mirrored board gets
   * every column but this one control (§6's "everyone sees this same board"). */
  canReassign: boolean;
}

/**
 * §7.4: a dense record row, no per-row action button. v2 rendered seven identical
 * 84.5×32 "Check in" buttons at row heights 88/88/67/88/67/88/87 (measured), driven by
 * whether the role string wrapped onto a second line — so here it can't: role clamps
 * onto the name's line inside a fixed-width column instead (`.roster-row`, globals.css).
 *
 * Exactly two controls, siblings rather than nested (an absolutely positioned hit-target
 * covering the row, and the ghost menu on top of it via z-order — never a button wrapping
 * a button): selecting the row opens the person's queue read only; the ghost menu is the
 * table's one quick action. "On:" keeps the item's own tier icon (README P0 8's fix) —
 * the only per-row colour on this screen, because nothing else here needs to compete with
 * a ranking. No elapsed time on the person: only the item's own signal would show one,
 * and this row doesn't render it.
 */
export function PeopleRow({ person, currentItem, counts, candidates, now, onOpen, onReassign, canReassign }: PeopleRowProps) {
  const isOut = person.status === "out";
  const tier = currentItem ? scoreItem(currentItem, now).tier : null;
  const firstName = person.name.split(" ")[0];

  return (
    <li data-craft-row className="roster-row group relative">
      <button
        type="button"
        onClick={onOpen}
        aria-label={t(copy.team.openQueue, { name: firstName })}
        className={cn("absolute inset-0 rounded-(--r-2)", FOCUS)}
      />

      <div className="pointer-events-none flex min-w-0 items-center gap-1.5 [grid-area:person]">
        <PersonAvatar initials={person.initials} />
        {person.status === "working" ? (
          <span className="min-w-0 truncate">
            <span data-row-title className="t-row text-(--text-1)">{person.name}</span>
            <span className="t-meta text-(--text-2)"> · {person.role}</span>
          </span>
        ) : (
          /* The presence chip used to sit here and win the space fight, on the reasoning
             that it is the point of the row in this state (found in wire mode: a wider
             monospace name was clipping the chip down to nothing). It held, and it cost
             the name: measured at 1440 *and* at 1920, "Aisha Bello" and "Kwame Asante"
             were both cut, because this column is a hard `minmax(0, 22ch)` that never
             grows — while the `working` column next to it rendered an empty span for
             exactly these people. So the chip moved there. It can no longer be squeezed
             by anything, the name is no longer squeezed by it, and a column that was
             blank on every away row now says what the person is doing. */
          <span data-row-title className="t-row min-w-0 truncate text-(--text-1)">{person.name}</span>
        )}
      </div>

      {currentItem && tier && tier !== "fyi" && tier !== "done" ? (
        <span
          data-testid="person-on"
          data-tier={tier}
          className="pointer-events-none flex min-w-0 items-center gap-1.5 [grid-area:working]"
        >
          <TierIcon tier={tier} safety={currentItem.safety} className={cn("shrink-0", tierFgClass[tier])} />
          <span className="t-body min-w-0 text-(--text-1) md:truncate">
            {t(copy.team.rightNow.on, { title: currentItem.title })}
          </span>
        </span>
      ) : person.status === "working" ? (
        <span data-testid="person-on" className="pointer-events-none t-body min-w-0 text-(--text-2) [grid-area:working]">
          {copy.team.rightNow.available}
        </span>
      ) : person.status === "on_break" || person.status === "out" ? (
        <span data-testid="person-on" className="pointer-events-none [grid-area:working]">
          <Chip size="md">
            {person.status === "on_break" ? copy.team.rightNow.onBreak : copy.team.rightNow.out}
          </Chip>
        </span>
      ) : (
        <span data-testid="person-on" className="pointer-events-none [grid-area:working]" />
      )}

      {/* Tiny label, larger number (`o01`/`s01`'s pattern, already used for the detail
          panel's stat pairs): the caps head above carries the label, so the value
          itself can read at `t-body` rather than repeating `t-meta` a third time in
          the row. Also keeps this list off the one size v2 spent 83% of `/work` on —
          a 7-row roster with three tabular columns each hits that same dominant-size
          failure at `t-meta` alone (craft check 2), measured at 57.6% here. */}
      <span className="pointer-events-none tnum t-body hidden justify-self-end text-(--text-1) md:block [grid-area:now]">
        {counts.now}
      </span>
      <span className="pointer-events-none tnum t-body hidden justify-self-end text-(--text-1) md:block [grid-area:next]">
        {counts.next}
      </span>
      <span className="pointer-events-none tnum t-body hidden justify-self-end text-(--text-1) md:block [grid-area:later]">
        {counts.later}
      </span>

      {canReassign && (
        <div className="relative hidden justify-self-end md:block [grid-area:menu]">
          <AssignPopover
            candidates={candidates}
            onAssign={(personId) => onReassign(personId)}
            trigger={
              <IconButton size="sm" aria-label={t(copy.team.reassignCurrent, { name: firstName })} disabled={!currentItem || isOut}>
                <MoreHorizontal aria-hidden />
              </IconButton>
            }
          />
        </div>
      )}
    </li>
  );
}
