"use client";

import { OctagonAlert, Hand, UserX, Truck as TruckIcon } from "lucide-react";
import { items as seedItems, team as seedTeam } from "@/lib/seed";
import { formatClock, relativeDuration, minutesBetween } from "@/lib/time";
import { teamRisk, needsYouRows, assignCandidates, tierCountsFor, nextCutoff } from "@/lib/selectors";
import { copy, t } from "@/lib/copy";
import { RiskTile } from "@/components/relay/risk-tile";
import { NeedsYouList } from "@/components/relay/needs-you-list";
import { Roster } from "@/components/relay/roster";
import { cn } from "@/lib/cn";

const noop = () => {};

/** §6.8: the manager screen's live embed, same pattern as MiniWork. */
export function MiniTeam({ wire, className }: { wire?: boolean; className?: string }) {
  const now = new Date("2026-09-22T10:40:00-07:00");
  const risk = teamRisk(seedItems, seedTeam, now);
  const cutoff = nextCutoff(now);
  const workers = seedTeam.filter((p) => !p.isManager);
  const needsRows = needsYouRows(risk, seedItems, seedTeam, now, []);
  const candidates = assignCandidates(seedTeam, seedItems, now);
  const needCount = risk.flagged.length + risk.noOwnerItems.length;
  const status =
    needCount > 0
      ? t(needCount === 1 ? copy.team.statusNeedYouOne : copy.team.statusNeedYou, { n: needCount })
      : copy.team.statusAllTrack;

  return (
    <div
      // A slide embed is a picture of the app, so it stays out of the accessibility tree
      // and the tab order: `inert` is the semantic half of the `pointer-events-none` above.
      // Without it the real components inside bring their own landmarks (Hero's "Do this
      // now" region, the Needs you aside), and stacking 16 slides on /deck/print turns
      // those into duplicates axe flags as landmark-unique — plus every mock button lands
      // in the deck's tab order. The slide's own title and body carry the meaning.
      inert
      aria-hidden="true"
      data-fidelity={wire ? "wire" : "hi"}
      className={cn("pointer-events-none flex flex-col gap-4 overflow-hidden bg-(--bg) p-4", className)}
    >
      <div>
        <h1 className="text-(length:--text-display) leading-(length:--leading-display) font-semibold text-(--text-1)">
          {status}
        </h1>
        <p className="tnum mt-1 text-(length:--text-meta) text-(--text-2)">
          {t(copy.team.live, { hhmm: formatClock(now) })}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <RiskTile icon={OctagonAlert} label={copy.team.tiles.now} value={risk.doNowCount} onClick={noop} />
        <RiskTile icon={Hand} label={copy.team.tiles.help} value={risk.flagged.length} onClick={noop} />
        <RiskTile icon={UserX} label={copy.team.tiles.noOwner} value={risk.noOwnerItems.length} onClick={noop} />
        <RiskTile
          icon={TruckIcon}
          label={copy.team.tiles.truck}
          value={cutoff ? `${cutoff.carrier.split(" ")[0]} ${formatClock(new Date(cutoff.departsAt))}` : copy.trucks.none}
          sub={
            cutoff && cutoff.ordersAtRisk > 0
              ? t(copy.team.tileSubs.truck, {
                  n: cutoff.ordersAtRisk,
                  rel: relativeDuration(minutesBetween(now, new Date(cutoff.departsAt))),
                })
              : undefined
          }
          onClick={noop}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <NeedsYouList rows={needsRows} candidates={candidates} onAssign={noop} onCheckIn={noop} onAcknowledge={noop} />
        <div className="min-h-0 flex-1 overflow-hidden">
          <Roster
            workers={workers}
            items={seedItems}
            countsFor={(personId) => tierCountsFor(seedItems, personId, now)}
            candidates={candidates}
            now={now}
            onOpen={noop}
            onReassign={noop}
            canReassign
          />
        </div>
      </div>
    </div>
  );
}
