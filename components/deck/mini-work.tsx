"use client";

import { LayoutGroup, AnimatePresence } from "motion/react";
import { queueFor, totalTodayFor, nextCutoff } from "@/lib/selectors";
import { items as seedItems, doneToday as seedDoneToday, site } from "@/lib/seed";
import { StatusSentence } from "@/components/relay/status-sentence";
import { Hero } from "@/components/relay/hero";
import { AllClear } from "@/components/relay/all-clear";
import { Queue } from "@/components/relay/queue";
import { TruckClock } from "@/components/relay/truck-clock";
import { cn } from "@/lib/cn";

const noop = () => {};

/**
 * §6.8: a live embed of the worker screen, not a screenshot or a redrawn mock — the
 * same `Hero`/`Queue`/`TruckClock` §6.1 renders with, fed a fixed snapshot instead of
 * the app's store. `wire` toggles `data-fidelity="wire"` for the wireframe slide; it's
 * the same token swap `/work`'s own toggle uses, not a separate mock component (§4.7).
 * `pointer-events-none` because a deck frame is a snapshot, not something a presenter
 * can click into.
 */
export function MiniWork({ wire, className }: { wire?: boolean; className?: string }) {
  const now = new Date("2026-09-22T10:40:00-07:00");
  const queue = queueFor(seedItems, "u1", now);
  const { done, total } = totalTodayFor(seedItems, seedDoneToday, "u1");
  const cutoff = nextCutoff(now);
  const nextRanked = queue.now[0] ?? queue.next[0] ?? queue.later[0] ?? null;

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
      <StatusSentence
        now={now}
        nowTierCount={queue.now.length + (queue.hero?.result.tier === "now" ? 1 : 0)}
        done={done}
        total={total}
        nextCutoff={cutoff}
      />
      <div className="flex min-h-0 flex-1 gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <LayoutGroup id="deck-work">
            <AnimatePresence mode="popLayout" initial={false}>
              {queue.hero ? (
                <Hero
                  key={queue.hero.item.id}
                  ranked={queue.hero}
                  nextRanked={nextRanked}
                  now={now}
                  nextCutoffAt={cutoff?.departsAt ?? null}
                  pendingTitle={null}
                  onShowMe={noop}
                  onStart={noop}
                  onMarkDone={noop}
                  onAskHelp={noop}
                  onWaiting={noop}
                  onMoveLater={noop}
                  onNotMine={noop}
                />
              ) : (
                <AllClear key="all-clear" doneToday={done} />
              )}
            </AnimatePresence>
            <Queue
              now={now}
              nowGroup={queue.now}
              nextGroup={queue.next}
              laterGroup={[]}
              waiting={[]}
              snoozed={[]}
              done={[]}
              nextCutoffAt={cutoff?.departsAt ?? null}
              nextHeroId={nextRanked?.item.id ?? null}
              onStart={noop}
              onMarkDone={noop}
              onWaiting={noop}
              onMoveLater={noop}
              onNotMine={noop}
            />
          </LayoutGroup>
        </div>
        <div className="hidden w-64 shrink-0 lg:block">
          <TruckClock cutoffs={site.cutoffs} now={now} stacked />
        </div>
      </div>
    </div>
  );
}
