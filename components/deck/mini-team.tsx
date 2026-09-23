"use client";

import { OctagonAlert, Hand, UserX, Truck as TruckIcon } from "lucide-react";
import { items as seedItems, team as seedTeam } from "@/lib/seed";
import { formatClock, relativeDuration, minutesBetween } from "@/lib/time";
import { teamRisk, needsYouRows, assignCandidates, tierCountsFor, nextCutoff } from "@/lib/selectors";
import { copy, t } from "@/lib/copy";
import { RiskTile } from "@/components/relay/risk-tile";
import { NeedsYouList } from "@/components/relay/needs-you-list";
import { Roster } from "@/components/relay/roster";
import { DECK_NOW } from "./deck-now";

const noop = () => {};

/** The design width `/team` is laid out at inside a slide. */
export const TEAM_DESIGN_WIDTH = 1200;

/**
 * §8: the manager screen's live embed, same pattern as `MiniWork` — the real
 * `RiskTile`/`NeedsYouList`/`Roster`, a fixed snapshot, and the frame around it owning
 * theme, wire and inertness. It mirrors `app/(app)/team/page.tsx` as the manager sees it:
 * one computed sentence, four neutral tiles, Needs you above the roster.
 */
export function MiniTeam() {
  const now = DECK_NOW;
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
    <div className="flex flex-col gap-6 px-8 py-8">
      <div>
        <h1 className="t-section max-w-[44ch] font-semibold text-balance text-(--text-1)">{status}</h1>
        <p className="tnum t-meta mt-1 text-(--text-2)">{t(copy.team.live, { hhmm: formatClock(now) })}</p>
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
      <NeedsYouList rows={needsRows} candidates={candidates} onAssign={noop} onCheckIn={noop} onAcknowledge={noop} />
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
  );
}
