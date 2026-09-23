"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup } from "motion/react";
import { Command } from "cmdk";
import { items as seedItems, team as seedTeam, doneToday as seedDoneToday, site } from "@/lib/seed";
import { SEED_NOW_ISO } from "@/state/clock";
import { queueFor } from "@/lib/selectors";
import * as actions from "@/state/actions";
import type { Snapshot } from "@/state/actions";
import type { Ranked } from "@/lib/priority";
import { Hero } from "@/components/relay/hero";
import { Queue } from "@/components/relay/queue";
import { AllClear } from "@/components/relay/all-clear";
import { WhyPopover } from "@/components/relay/why-popover";
import { WhyFactors } from "@/components/relay/why-factors";
import { TruckClock } from "@/components/relay/truck-clock";
import { NeedsYouList } from "@/components/relay/needs-you-list";
import { ItemDetail } from "@/components/relay/item-detail";
import { CommandMenuBody } from "@/components/relay/command-palette";
import { CheckDraw } from "@/components/relay/check-draw";
import { UndoToast } from "@/components/relay/undo-toast";
import { Toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { copy } from "@/lib/copy";
import { FitFrame } from "./fit-frame";
import { PageHead, SectionHead } from "./kit";

const NOW = new Date(SEED_NOW_ISO);
const PERSON_ID = "u1";
const noop = () => {};

function initialSnapshot(): Snapshot {
  return actions.cloneSnapshot({ items: seedItems, team: seedTeam, doneLog: seedDoneToday });
}

function Pattern({
  id,
  title,
  code,
  note,
  children,
}: {
  id: string;
  title: string;
  /** The file(s) the real thing lives in — what M11 maps a Figma component to. */
  code: string;
  note: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <SectionHead id={id} title={title}>
        {note}
      </SectionHead>
      <p className="t-mono text-(--text-2)">{code}</p>
      <div className="rounded-(--r-5) border border-(--line-1) bg-(--surface-2) p-4 sm:p-6">{children}</div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 t-eyebrow text-(--text-2)">{children}</p>;
}

/** A hero card fed a local snapshot, every handler a no-op. Used by the filmstrip. */
function HeroFrame({ ranked, next }: { ranked: Ranked; next: Ranked | null }) {
  return (
    <Hero
      ranked={ranked}
      nextRanked={next}
      now={NOW}
      nextCutoffAt={site.cutoffs[0]?.departsAt ?? null}
      pendingTitle={null}
      onShowMe={noop}
      onStart={noop}
      onMarkDone={noop}
      onAskHelp={noop}
      onWaiting={noop}
      onMoveLater={noop}
      onNotMine={noop}
    />
  );
}

/**
 * Every composition Relay's screens are assembled from, each the real component from
 * `components/relay` fed a local snapshot — never a screenshot and never a redraw.
 * `state/actions.ts`'s pure functions are used directly, so "Mark done" here runs the
 * exact transition the store wraps, and nothing on this page can touch the demo the rest
 * of the app is showing.
 */
export function PatternsPage() {
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot);
  const [initial] = useState<Snapshot>(initialSnapshot);

  const queue = useMemo(() => queueFor(snapshot.items, PERSON_ID, NOW), [snapshot.items]);
  const nextRanked = queue.now[0] ?? queue.next[0] ?? queue.later[0] ?? null;

  // The filmstrip is computed from the untouched seed so it never changes with the demo above.
  const strip = useMemo(() => {
    const before = queueFor(initial.items, PERSON_ID, NOW);
    const heroA = before.hero;
    if (!heroA) return null;
    const after = actions.markDone(initial, heroA.item.id, NOW.toISOString());
    const queueAfter = queueFor(after.items, PERSON_ID, NOW);
    const heroB = queueAfter.hero;
    if (!heroB) return null;
    const nextA = before.now[0] ?? before.next[0] ?? before.later[0] ?? null;
    const nextB = queueAfter.now[0] ?? queueAfter.next[0] ?? queueAfter.later[0] ?? null;
    return { heroA, nextA, heroB, nextB };
  }, [initial]);

  const detailAssignee = queue.hero ? seedTeam.find((p) => p.id === queue.hero!.item.assigneeId) : undefined;

  function markDone() {
    if (!queue.hero) return;
    setSnapshot((s) => actions.markDone(s, queue.hero!.item.id, NOW.toISOString()));
  }

  function replay() {
    setSnapshot(actions.cloneSnapshot(initial));
  }

  return (
    <div className="flex max-w-5xl flex-col gap-20">
      <PageHead title="Patterns">
        The compositions the screens are assembled from: the queue and the hero, the undo sequence
        as a filmstrip, the detail panel, the command palette, the explainer, the truck clock, the
        all-clear, and the states in between. Each is the shipped component.
      </PageHead>

      <Pattern
        id="pattern-queue"
        title="The queue and the hero"
        code="components/relay/hero.tsx · queue.tsx · all-clear.tsx"
        note={`One person's queue at the frozen demo instant, 10:40. Mark done runs the real signature moment: the check draws, the next item becomes the hero, the rows close the gap. Replay resets this pattern only.`}
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
                onShowMe={noop}
                onStart={noop}
                onMarkDone={markDone}
                onAskHelp={noop}
                onWaiting={noop}
                onMoveLater={noop}
                onNotMine={noop}
              />
            ) : (
              <AllClear key="all-clear" done={snapshot.doneLog} />
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
                onStart={noop}
                onMarkDone={(id) => setSnapshot((s) => actions.markDone(s, id, NOW.toISOString()))}
                onWaiting={noop}
                onMoveLater={noop}
                onNotMine={noop}
              />
            </div>
          )}
        </LayoutGroup>
      </Pattern>

      {strip && (
        <Pattern
          id="pattern-undo"
          title="Mark done, and undo"
          code="components/relay/hero.tsx · toast-bridge.tsx · undo-toast.tsx · check-draw.tsx"
          note="Four frames of the sequence, each a live component held still. Undo is one move, not the first move played backwards: the item flies from the toast back to its rank while the hero crossfades. Input is never blocked, and the toast is bottom-left, 360 by 56, for eight seconds."
        >
          <ol className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2">
            <li className="flex min-w-0 flex-col gap-2">
              <Label>1 · Before</Label>
              <FitFrame designWidth={720}>
                <LayoutGroup id="frame-1">
                <HeroFrame ranked={strip.heroA} next={strip.nextA} />
              </LayoutGroup>
              </FitFrame>
              <p className="t-meta text-(--text-2)">The hero is the one thing to do.</p>
            </li>
            <li className="flex min-w-0 flex-col gap-2">
              <Label>2 · Mark done · 0 to 200 ms</Label>
              <FitFrame designWidth={720}>
                <LayoutGroup id="frame-2">
                <div className="relative">
                  <div className="opacity-40">
                    <HeroFrame ranked={strip.heroA} next={strip.nextA} />
                  </div>
                  <CheckDraw />
                </div>
              </LayoutGroup>
              </FitFrame>
              <p className="t-meta text-(--text-2)">The check draws on the card that is leaving. Nothing else waits on it.</p>
            </li>
            <li className="flex min-w-0 flex-col gap-2">
              <Label>3 · Done · about 700 ms</Label>
              <FitFrame designWidth={720}>
                <LayoutGroup id="frame-3">
                <div className="flex flex-col gap-4">
                  <HeroFrame ranked={strip.heroB} next={strip.nextB} />
                  <Toast
                    message="Marked done"
                    detail={strip.heroA.item.title}
                    action={<UndoToast durationMs={8000} onUndo={noop} />}
                  />
                </div>
              </LayoutGroup>
              </FitFrame>
              <p className="t-meta text-(--text-2)">The next item is the hero. The toast holds Undo for eight seconds.</p>
            </li>
            <li className="flex min-w-0 flex-col gap-2">
              <Label>4 · Undo · about 420 ms</Label>
              <FitFrame designWidth={720}>
                <LayoutGroup id="frame-4">
                <HeroFrame ranked={strip.heroA} next={strip.nextA} />
              </LayoutGroup>
              </FitFrame>
              <p className="t-meta text-(--text-2)">
                The item returns to its rank in one move. The hero was never gone, only covered.
              </p>
            </li>
          </ol>
        </Pattern>
      )}

      {queue.hero && (
        <Pattern
          id="pattern-detail"
          title="The detail panel"
          code="components/relay/item-detail.tsx · item-detail-sheet.tsx · app/(app)/items/[id]"
          note="A panel beside the queue from 1024, a sheet below it. The same component in both, so the first thing in it is always why the item is where it is."
        >
          <div className="max-h-[42rem] w-full max-w-[30rem] overflow-y-auto rounded-(--r-5) border border-(--line-1) bg-(--surface-1) shadow-(--e2)">
            <ItemDetail
              item={queue.hero.item}
              assignee={detailAssignee}
              now={NOW}
              nextCutoffAt={site.cutoffs[0]?.departsAt ?? null}
              ranked={queue.hero}
              nextRanked={nextRanked}
              canAct
            />
          </div>
        </Pattern>
      )}

      <Pattern
        id="pattern-palette"
        title="The command palette"
        code="components/relay/command-palette.tsx"
        note="⌘K anywhere. Actions first, people and items once there is a query. Shown inline here at its real width, with the same body the dialog opens."
      >
        <Command
          shouldFilter
          loop
          label="Command palette example"
          className="w-full max-w-xl overflow-hidden rounded-(--r-5) border border-(--line-1) bg-(--surface-1) shadow-(--e3)"
        >
          <CommandMenuBody onNavigate={noop} onDone={noop} autoFocus={false} />
        </Command>
      </Pattern>

      {queue.hero && (
        <Pattern
          id="pattern-why"
          title="Why is this first?"
          code="components/relay/why-popover.tsx · why-factors.tsx"
          note="A plain question, four factor bars with the item's own numbers, a total, and a line comparing it with the next item. The popover and the inline placement are the same component."
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div>
              <Label>As a popover</Label>
              <WhyPopover
                ranked={queue.hero}
                nextRanked={nextRanked}
                now={NOW}
                trigger={
                  <button type="button" className="tap-48 w-fit rounded-(--r-2) t-body text-(--accent) underline underline-offset-2">
                    Why first?
                  </button>
                }
              />
            </div>
            <div className="flex w-full max-w-sm flex-col gap-2 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-4">
              <Label>Inline, in the detail panel</Label>
              <WhyFactors ranked={queue.hero} nextRanked={nextRanked} now={NOW} showTitle={false} />
            </div>
          </div>
        </Pattern>
      )}

      <Pattern
        id="pattern-truck"
        title="The truck clock"
        code="components/relay/truck-clock.tsx"
        note="Carrier cutoffs as capsules: a filling track, a rolling countdown, and the orders at risk. Reference material in a rail that holds nothing loud and nothing clickable. The rail and the strip are one component."
      >
        <div className="flex flex-col gap-6">
          <div>
            <Label>Stacked, in the rail</Label>
            <div className="max-w-xs">
              <TruckClock cutoffs={site.cutoffs} now={NOW} stacked />
            </div>
          </div>
          <div>
            <Label>Strip, below 1280</Label>
            <TruckClock cutoffs={site.cutoffs} now={NOW} />
          </div>
        </div>
      </Pattern>

      <Pattern
        id="pattern-all-clear"
        title="The all-clear"
        code="components/relay/all-clear.tsx"
        note="The one screen that is allowed a gradient, because it is rare, it is a finish line, and it never competes with a ranking. One sentence, and what got done today."
      >
        <AllClear done={seedDoneToday} />
      </Pattern>

      <Pattern
        id="pattern-states"
        title="Empty and error states"
        code="components/ui/empty-state.tsx · error-state.tsx"
        note="Every list, the rail and the sheet has a designed state. An error is the empty state's shape with a neutral icon, because red is not on the colour whitelist. A rail state never carries an action; a list or a sheet can."
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
          <div>
            <Label>List, empty</Label>
            <NeedsYouList rows={[]} candidates={[]} onAssign={noop} onCheckIn={noop} onAcknowledge={noop} />
          </div>
          <div>
            <Label>Rail, empty, no action</Label>
            <div className="max-w-xs rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-3">
              <TruckClock cutoffs={[]} now={NOW} stacked />
            </div>
          </div>
          <div>
            <Label>Sheet, empty</Label>
            <div className="rounded-(--r-4) border border-(--line-1) bg-(--surface-1)">
              <EmptyState title={copy.updates.selectHint} />
            </div>
          </div>
          <div>
            <Label>Sheet, error</Label>
            <div className="rounded-(--r-4) border border-(--line-1) bg-(--surface-1)">
              <ErrorState
                title={copy.itemDetail.notFound}
                description={copy.itemDetail.notFoundHint}
                action={
                  <Button variant="secondary" size="sm">
                    {copy.itemDetail.close}
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </Pattern>
    </div>
  );
}
