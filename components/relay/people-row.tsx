import { copy, t } from "@/lib/copy";
import { scoreItem } from "@/lib/priority";
import type { Item, Person } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PersonAvatar } from "./person-avatar";
import { TierIcon } from "./tier-icon";
import { tierFgClass } from "./tier-tokens";
import type { PersonTierCounts } from "@/lib/selectors";

export interface PeopleRowProps {
  person: Person;
  currentItem: Item | undefined;
  counts: PersonTierCounts;
  now: Date;
  onCheckIn: () => void;
}

/**
 * §6.3: rows at 1024+, cards below — one DOM, `lg:flex-row` reflows it, so there is no
 * JS breakpoint switch to cause a hydration mismatch (§8.3). Role and the "On:" line
 * never truncate (G3). The "On:" icon takes the *item's* own tier (fixes README P0 8,
 * which hardcoded the Act now octagon for everyone). No elapsed time on the person —
 * only the item's own time pill would ever show it, and this row doesn't render one.
 */
export function PeopleRow({ person, currentItem, counts, now, onCheckIn }: PeopleRowProps) {
  const isOut = person.status === "out";
  const tier = currentItem ? scoreItem(currentItem, now).tier : null;

  return (
    <li className="flex flex-col gap-3 rounded-(--radius-control) border border-(--border-1) p-3 lg:flex-row lg:items-center lg:gap-4 lg:rounded-none lg:border-0 lg:border-b lg:p-3 lg:last:border-0">
      <div className="flex min-w-0 items-center gap-3 lg:w-56 lg:shrink-0">
        <PersonAvatar initials={person.initials} />
        <div className="min-w-0">
          <p className="text-(length:--text-meta) font-medium text-(--text-1)">{person.name}</p>
          <p data-testid="person-role" className="text-(length:--text-meta) text-(--text-2)">
            {person.role}
          </p>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {currentItem && tier && tier !== "fyi" && tier !== "done" ? (
          <span data-testid="person-on" data-tier={tier} className="flex min-w-0 items-center gap-1.5 text-(length:--text-meta) text-(--text-1)">
            <TierIcon
              tier={tier}
              safety={currentItem.safety}
              className={`${tierFgClass[tier]} shrink-0`}
            />
            <span className="min-w-0">{t(copy.team.rightNow.on, { title: currentItem.title })}</span>
          </span>
        ) : person.status === "working" ? (
          <span className="text-(length:--text-meta) text-(--text-2)">{copy.team.rightNow.available}</span>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {person.status !== "working" && (
          <Chip size="md" className="shrink-0">
            {person.status === "on_break" ? copy.team.rightNow.onBreak : copy.team.rightNow.out}
          </Chip>
        )}
        {!isOut && (
          <span className="tnum shrink-0 whitespace-nowrap text-(length:--text-meta) text-(--text-2)">
            {t(copy.team.loadCounts, { now: counts.now, next: counts.next, later: counts.later })}
          </span>
        )}
        <Button variant="secondary" size="sm" className="shrink-0" onClick={onCheckIn} disabled={isOut}>
          {copy.actions.checkIn}
        </Button>
      </div>
    </li>
  );
}
