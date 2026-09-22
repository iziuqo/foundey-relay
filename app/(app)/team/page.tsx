"use client";

import { useMemo, useState } from "react";
import { OctagonAlert, Hand, UserX, Truck as TruckIcon } from "lucide-react";
import { useStore } from "@/state/store";
import { SEED_NOW_ISO } from "@/state/clock";
import { useNow } from "@/lib/time";
import { formatClock, relativeDuration, minutesBetween } from "@/lib/time";
import { scoreItem } from "@/lib/priority";
import {
  teamRisk,
  needsYouRows,
  assignCandidates,
  tierCountsFor,
  nextCutoff,
} from "@/lib/selectors";
import { copy, t } from "@/lib/copy";
import { RiskTile } from "@/components/relay/risk-tile";
import { NeedsYouList } from "@/components/relay/needs-you-list";
import { PeopleRow } from "@/components/relay/people-row";
import { CheckInSheet } from "@/components/relay/check-in-sheet";

type RiskFilter = "now" | "help" | "noOwner" | "truck" | null;

export default function TeamPage() {
  const persona = useStore((s) => s.persona);
  const items = useStore((s) => s.items);
  const team = useStore((s) => s.team);
  const jumpOffsetMs = useStore((s) => s.jumpOffsetMs);
  const acknowledgedIds = useStore((s) => s.acknowledgedIds);
  const reassign = useStore((s) => s.reassign);
  const acknowledge = useStore((s) => s.acknowledge);

  const [filter, setFilter] = useState<RiskFilter>(null);
  const [checkInPersonId, setCheckInPersonId] = useState<string | null>(null);
  const [highlightItemId, setHighlightItemId] = useState<string | null>(null);

  const now = useNow(SEED_NOW_ISO, jumpOffsetMs);
  const person = team.find((p) => p.id === persona) ?? team[0];
  const isManager = person.isManager;

  const risk = useMemo(() => teamRisk(items, team, now), [items, team, now]);
  const cutoff = nextCutoff(now);
  const workers = team.filter((p) => !p.isManager);
  const working = workers.filter((p) => p.status === "working").length;
  const onBreak = workers.filter((p) => p.status === "on_break").length;
  const out = workers.filter((p) => p.status === "out").length;

  const allRows = useMemo(
    () => needsYouRows(risk, items, team, now, acknowledgedIds),
    [risk, items, team, now, acknowledgedIds],
  );
  const needsRows = allRows.filter((row) => {
    if (filter === "help") return row.action === "checkIn";
    if (filter === "noOwner") return row.action === "assign";
    if (filter === "truck") return cutoff && row.item.dueAt && new Date(row.item.dueAt).getTime() <= new Date(cutoff.departsAt).getTime();
    return true;
  });

  const candidates = useMemo(() => assignCandidates(team, items, now), [team, items, now]);

  const flaggedAssigneeIds = new Set(risk.flagged.map((f) => f.assignee?.id).filter(Boolean));
  const visibleWorkers = workers.filter((p) => {
    if (filter === "now") {
      const current = items.find((i) => i.id === p.currentTaskId);
      return current && scoreItem(current, now).tier === "now";
    }
    if (filter === "help") return flaggedAssigneeIds.has(p.id);
    return true;
  });

  const checkInPerson = checkInPersonId ? team.find((p) => p.id === checkInPersonId) : null;

  function openCheckIn(personId: string, itemId?: string) {
    setCheckInPersonId(personId);
    setHighlightItemId(itemId ?? null);
  }

  function toggleFilter(next: Exclude<RiskFilter, null>) {
    setFilter((f) => (f === next ? null : next));
  }

  const needCount = risk.flagged.length + risk.noOwnerItems.length;
  const status = isManager
    ? needCount > 0
      ? t(needCount === 1 ? copy.team.statusNeedYouOne : copy.team.statusNeedYou, { n: needCount })
      : copy.team.statusAllTrack
    : t(copy.team.status, { on: working, brk: onBreak, out });

  return (
    <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-col gap-6 p-4 xl:flex-row xl:items-start xl:gap-8 xl:p-8">
      <div data-testid="team-main" className="flex min-w-0 flex-1 flex-col gap-6 xl:min-w-[36rem]">
        <div>
          <h1 data-testid="team-status" className="text-(length:--text-display) leading-(length:--leading-display) font-semibold text-(--text-1)">
            {status}
          </h1>
          <p className="tnum mt-1 text-(length:--text-meta) text-(--text-2)">
            {t(copy.team.live, { hhmm: formatClock(now) })}
          </p>
          {!isManager && <p className="mt-1 text-(length:--text-meta) text-(--text-2)">{copy.team.mirror}</p>}
        </div>

        {isManager && (
          <div className="flex flex-col gap-3">
            <div data-testid="risk-tiles" className="flex flex-wrap gap-3">
              <RiskTile
                icon={OctagonAlert}
                label={copy.team.tiles.now}
                value={risk.doNowCount}
                sub={
                  cutoff
                    ? t(copy.team.tileSubs.now, { n: risk.doNowDueBySub, hhmm: formatClock(new Date(cutoff.departsAt)) })
                    : undefined
                }
                pressed={filter === "now"}
                onClick={() => toggleFilter("now")}
              />
              <RiskTile
                icon={Hand}
                label={copy.team.tiles.help}
                value={risk.flagged.length}
                sub={
                  risk.flagged[0]
                    ? t(copy.team.tileSubs.help, {
                        title: risk.flagged[0].item.title,
                        n: risk.flagged[0].assignee?.currentTaskStartedAt
                          ? minutesBetween(new Date(risk.flagged[0].assignee.currentTaskStartedAt), now)
                          : 0,
                      })
                    : undefined
                }
                pressed={filter === "help"}
                onClick={() => toggleFilter("help")}
              />
              <RiskTile
                icon={UserX}
                label={copy.team.tiles.noOwner}
                value={risk.noOwnerItems.length}
                sub={risk.outToday[0] ? t(copy.team.tileSubs.noOwner, { name: risk.outToday[0].name.split(" ")[0] }) : copy.team.tileSubs.noOwnerNone}
                pressed={filter === "noOwner"}
                onClick={() => toggleFilter("noOwner")}
              />
              <RiskTile
                icon={TruckIcon}
                label={copy.team.tiles.truck}
                value={cutoff ? `${cutoff.carrier.split(" ")[0]} ${formatClock(new Date(cutoff.departsAt))}` : copy.trucks.none}
                sub={
                  cutoff
                    ? cutoff.ordersAtRisk > 0
                      ? t(copy.team.tileSubs.truck, {
                          n: cutoff.ordersAtRisk,
                          rel: relativeDuration(minutesBetween(now, new Date(cutoff.departsAt))),
                        })
                      : copy.trucks.onTrack
                    : undefined
                }
                pressed={filter === "truck"}
                onClick={() => toggleFilter("truck")}
              />
            </div>
            {filter && (
              <button
                type="button"
                onClick={() => setFilter(null)}
                className="self-start text-(length:--text-meta) font-medium text-(--accent) hover:underline"
              >
                {copy.team.clearFilter}
              </button>
            )}
          </div>
        )}

        {isManager && (
          <section className="flex flex-col gap-1 rounded-(--radius-control) border border-(--border-1) bg-(--surface-1) p-4 xl:hidden">
            <NeedsYouList
              rows={needsRows}
              candidates={candidates}
              onAssign={(itemId, personId) => reassign(itemId, personId, person.id)}
              onCheckIn={openCheckIn}
              onAcknowledge={acknowledge}
            />
          </section>
        )}

        <section className="rounded-(--radius-control) border border-(--border-1) bg-(--surface-1)">
          <h2 className="p-4 pb-2 text-(length:--text-meta) font-semibold text-(--text-1)">{copy.team.board}</h2>
          <ul className="flex flex-col gap-2 p-2 lg:gap-0 lg:p-0">
            {visibleWorkers.map((p) => (
              <PeopleRow
                key={p.id}
                person={p}
                currentItem={items.find((i) => i.id === p.currentTaskId)}
                counts={tierCountsFor(items, p.id, now)}
                now={now}
                onCheckIn={() => openCheckIn(p.id)}
              />
            ))}
          </ul>
        </section>
      </div>

      {isManager && (
        <aside data-testid="team-rail" className="hidden w-full shrink-0 flex-col gap-3 rounded-(--radius-control) border border-(--border-1) bg-(--surface-1) p-4 xl:flex xl:w-[clamp(18rem,26vw,22rem)]">
          <NeedsYouList
            rows={needsRows}
            candidates={candidates}
            onAssign={(itemId, personId) => reassign(itemId, personId, person.id)}
            onCheckIn={openCheckIn}
            onAcknowledge={acknowledge}
          />
        </aside>
      )}

      {checkInPerson && (
        <CheckInSheet
          person={checkInPerson}
          items={items}
          now={now}
          highlightItemId={highlightItemId}
          onClose={() => setCheckInPersonId(null)}
        />
      )}
    </div>
  );
}
