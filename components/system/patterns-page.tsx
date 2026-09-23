"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup } from "motion/react";
import { items as seedItems, team as seedTeam, doneToday as seedDoneToday, site } from "@/lib/seed";
import { SEED_NOW_ISO } from "@/state/clock";
import { queueFor } from "@/lib/selectors";
import * as actions from "@/state/actions";
import type { Snapshot } from "@/state/actions";
import { Hero } from "@/components/relay/hero";
import { Queue } from "@/components/relay/queue";
import { AllClear } from "@/components/relay/all-clear";
import { WhyPopover } from "@/components/relay/why-popover";
import { WhyFactors } from "@/components/relay/why-factors";
import { TruckClock } from "@/components/relay/truck-clock";
import { Button } from "@/components/ui/button";

const NOW = new Date(SEED_NOW_ISO);
const PERSON_ID = "u1";

function initialSnapshot(): Snapshot {
  return actions.cloneSnapshot({ items: seedItems, team: seedTeam, doneLog: seedDoneToday });
}

function PatternSection({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-(length:--text-title) leading-(--leading-title) font-semibold text-(--text-1)">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-(length:--text-body) text-(--text-2)">{note}</p>
      </div>
      <div className="rounded-(--radius-hero) border border-(--border-1) bg-(--surface-2) p-4 sm:p-6">
        {children}
      </div>
    </section>
  );
}

/**
 * §6.7 Patterns: the hero, the queue, the why popover, the truck clock, and a replay
 * button for the done choreography (M1, §7.2) — each a real component fed a local
 * snapshot, not the app's own store (state/store.ts is a module singleton; a
 * "Mark done" click here must never touch the demo the rest of the app is showing).
 * `state/actions.ts`'s pure functions are reused directly, so "Mark done" here runs
 * the exact same transition `state/store.ts` wraps for the app itself.
 */
export function PatternsPage() {
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot);
  const [initial] = useState<Snapshot>(initialSnapshot);

  const queue = useMemo(() => queueFor(snapshot.items, PERSON_ID, NOW), [snapshot.items]);
  const nextRanked = queue.now[0] ?? queue.next[0] ?? queue.later[0] ?? null;

  function markDone() {
    if (!queue.hero) return;
    setSnapshot((s) => actions.markDone(s, queue.hero!.item.id, NOW.toISOString()));
  }

  function replay() {
    setSnapshot(actions.cloneSnapshot(initial));
  }

  return (
    <div className="flex max-w-5xl flex-col gap-16">
      <header>
        <h1 className="text-(length:--text-title) font-semibold text-(--text-1)">Patterns</h1>
        <p className="mt-2 text-(length:--text-body) text-(--text-2)">
          The five compositions §6 builds screens from, each the real component from{" "}
          <code className="text-(length:--text-kbd)">components/relay</code> — never a screenshot or a
          redrawn approximation.
        </p>
      </header>

      <PatternSection
        title="Hero, queue, and the done choreography"
        note={`One person's queue at the frozen demo instant (10:40). "Mark done" runs the real M1
          moment (§7.2): the row check-draws, the next item's row morphs into the hero, and the
          remaining rows close the gap. "Replay" resets this pattern only — it never touches the
          app's own demo state.`}
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={markDone} disabled={!queue.hero}>
            Mark hero done
          </Button>
          <Button size="sm" variant="secondary" onClick={replay}>
            Replay
          </Button>
        </div>
        <LayoutGroup id="patterns-hero">
          <AnimatePresence mode="popLayout" initial={false}>
            {queue.hero ? (
              <Hero
                key={queue.hero.item.id}
                ranked={queue.hero}
                nextRanked={nextRanked}
                now={NOW}
                nextCutoffAt={site.cutoffs[0]?.departsAt ?? null}
                pendingTitle={null}
                onShowMe={() => {}}
                onStart={() => {}}
                onMarkDone={markDone}
                onAskHelp={() => {}}
                onWaiting={() => {}}
                onMoveLater={() => {}}
                onNotMine={() => {}}
              />
            ) : (
              <AllClear key="all-clear" doneToday={snapshot.doneLog.length} />
            )}
          </AnimatePresence>
          {(queue.now.length > 0 || queue.next.length > 0 || queue.later.length > 0) && (
            <div className="mt-4">
              <Queue
                now={NOW}
                nowGroup={queue.now}
                nextGroup={queue.next}
                laterGroup={queue.later}
                waiting={queue.waiting}
                snoozed={queue.snoozed}
                done={[]}
                nextCutoffAt={site.cutoffs[0]?.departsAt ?? null}
                nextHeroId={nextRanked?.item.id ?? null}
                onStart={() => {}}
                onMarkDone={(id) => setSnapshot((s) => actions.markDone(s, id, NOW.toISOString()))}
                onWaiting={() => {}}
                onMoveLater={() => {}}
                onNotMine={() => {}}
              />
            </div>
          )}
        </LayoutGroup>
      </PatternSection>

      {queue.hero && (
        <PatternSection
          title="Why is this first?"
          note={`Xero's structure (§3.6): a plain question, three factor bars with the item's own
            numbers, a total, and a line comparing it with the next item. The popover (hero, §6.1) and
            the inline placement (item detail, §6.2) are the same WhyFactors component.`}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col gap-2">
              <p className="text-(length:--text-meta) font-medium text-(--text-2)">As a popover</p>
              <WhyPopover
                ranked={queue.hero}
                nextRanked={nextRanked}
                now={NOW}
                trigger={
                  <button
                    type="button"
                    className="w-fit text-(length:--text-body) text-(--accent) underline underline-offset-2"
                  >
                    Why first?
                  </button>
                }
              />
            </div>
            <div className="flex w-full max-w-sm flex-col gap-2 rounded-(--radius-control) border border-(--border-1) bg-(--surface-1) p-4">
              <p className="text-(length:--text-meta) font-medium text-(--text-2)">Inline (item detail)</p>
              <WhyFactors ranked={queue.hero} nextRanked={nextRanked} now={NOW} showTitle={false} />
            </div>
          </div>
        </PatternSection>
      )}

      <PatternSection
        title="Truck clock"
        note={`Carrier cutoffs as Flighty style capsules: a filling progress track, a digit roll
          countdown, and orders at risk. Stacked (rail, §5 at 1280+) and unstacked (strip, below
          1280) are the same component.`}
      >
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-(length:--text-meta) font-medium text-(--text-2)">Stacked (rail)</p>
            <div className="max-w-xs">
              <TruckClock cutoffs={site.cutoffs} now={NOW} stacked />
            </div>
          </div>
          <div>
            <p className="mb-2 text-(length:--text-meta) font-medium text-(--text-2)">Strip</p>
            <TruckClock cutoffs={site.cutoffs} now={NOW} />
          </div>
        </div>
      </PatternSection>
    </div>
  );
}
