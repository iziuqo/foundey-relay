"use client";

import { useId } from "react";
import { LayoutGroup, AnimatePresence } from "motion/react";
import { queueFor, totalTodayFor, nextCutoff } from "@/lib/selectors";
import { items as seedItems, doneToday as seedDoneToday, site } from "@/lib/seed";
import { StatusSentence } from "@/components/relay/status-sentence";
import { Hero } from "@/components/relay/hero";
import { AllClear } from "@/components/relay/all-clear";
import { Queue } from "@/components/relay/queue";
import { TruckClock } from "@/components/relay/truck-clock";
import { ShiftTimeline } from "@/components/relay/shift-timeline";
import { Abstract } from "./abstract";
import { DECK_NOW } from "./deck-now";
import { cn } from "@/lib/cn";

const noop = () => {};

/** The design width `/work` is laid out at inside a slide: wide enough that the rail
 * renders (it appears at ≥1200px only, §4.3). */
export const WORK_DESIGN_WIDTH = 1200;

/**
 * §8: a live embed of the worker screen, not a screenshot or a redrawn mock — the same
 * `StatusSentence`/`Hero`/`Queue`/`TruckClock`/`ShiftTimeline` `/work` renders with, fed
 * a fixed snapshot instead of the app's store. Theme, wire and inertness belong to the
 * `DeviceFrame` around it; this is only the screen.
 *
 * The two-track grid is written out rather than borrowed from `PageGrid`: that one keys
 * off the viewport's width, and a slide has to render the same at 1600px in the export as
 * in a presenter's 1024px window.
 *
 * `abstract` ghosts everything except the hero (`[data-deck-focus]`), which is the whole
 * argument of the cover: one live subject over a queue reduced to its structure.
 */
export function MiniWork({ abstract }: { abstract?: boolean }) {
  const groupId = useId();
  const now = DECK_NOW;
  const queue = queueFor(seedItems, "u1", now);
  const { done, total } = totalTodayFor(seedItems, seedDoneToday, "u1");
  const myDone = seedDoneToday.filter((d) => d.assigneeId === "u1");
  const cutoff = nextCutoff(now);
  const nextRanked = queue.now[0] ?? queue.next[0] ?? queue.later[0] ?? null;

  // Outside the subject, an abstracted screen is dimmed as a whole (35–40%, §8.3): the
  // bars carry the structure, the dimming keeps the tier hues in the context from
  // competing with the one live thing. `filter` would do it in one line and is banned
  // by G5, so it is opacity on each sibling of the hero instead.
  const ghost = abstract ? "opacity-40" : undefined;

  const screen = (
    <div className="grid grid-cols-[minmax(0,1fr)_22rem] gap-8 px-8 py-8">
      <div className="flex min-w-0 flex-col gap-4">
        <div className={ghost}>
          <StatusSentence
            now={now}
            nowTierCount={queue.now.length + (queue.hero?.result.tier === "now" ? 1 : 0)}
            done={done}
            total={total}
            nextCutoff={cutoff}
          />
        </div>
        {/* Each embed is its own LayoutGroup: every Hero shares `layoutId="item-shell-<id>"`,
            so two of them on one page (the print route stacks all sixteen slides) would
            otherwise fight over one background. */}
        <LayoutGroup id={groupId}>
          <div className="relative" data-deck-focus="">
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
                <AllClear key="all-clear" done={myDone} />
              )}
            </AnimatePresence>
          </div>
          <Queue
            className={cn("mt-2", ghost)}
            now={now}
            nowGroup={queue.now}
            nextGroup={queue.next}
            laterGroup={queue.later}
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
      <div className={cn("flex min-w-0 flex-col gap-6", ghost)}>
        <TruckClock cutoffs={site.cutoffs} now={now} stacked />
        <ShiftTimeline now={now} shift={site.shift} cutoffs={site.cutoffs} />
      </div>
    </div>
  );

  return abstract ? <Abstract>{screen}</Abstract> : screen;
}
