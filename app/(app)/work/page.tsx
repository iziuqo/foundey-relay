"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useStore } from "@/state/store";
import { SEED_NOW_ISO } from "@/state/clock";
import { resolveHotkey } from "@/state/hotkeys";
import { useNow } from "@/lib/time";
import { queueFor, totalTodayFor, nextCutoff } from "@/lib/selectors";
import { site, items as seedItemsForFyi } from "@/lib/seed";
import { copy } from "@/lib/copy";
import { StatusSentence } from "@/components/relay/status-sentence";
import { Hero } from "@/components/relay/hero";
import { AllClear } from "@/components/relay/all-clear";
import { Queue } from "@/components/relay/queue";
import { TruckClock } from "@/components/relay/truck-clock";
import { ShiftTimeline } from "@/components/relay/shift-timeline";
import { PageGrid, PageMain, PageRail } from "@/components/relay/page-grid";
import { duration, spring } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { CheckDraw } from "@/components/relay/check-draw";

function FyiPreview() {
  const fyi = [...seedItemsForFyi]
    .filter((i) => i.source === "fyi")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);
  if (fyi.length === 0) return null;
  return (
    <div className="flex min-h-22 flex-col gap-2 rounded-(--r-4) border border-(--line-1) p-4">
      {/* t-meta rather than t-eyebrow: the eyebrow step is 12px, and /work holds a 14px
          floor for anything carrying content (G3). */}
      <p
        data-eyebrow
        className="t-meta font-semibold tracking-[0.06em] text-(--text-2) uppercase"
      >
        {copy.tiers.fyi.label}
      </p>
      <ul className="flex flex-col gap-2">
        {fyi.map((item) => (
          <li key={item.id} className="t-body text-(--text-1)">
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function WorkPage() {
  const persona = useStore((s) => s.persona);
  const items = useStore((s) => s.items);
  const doneLog = useStore((s) => s.doneLog);
  const team = useStore((s) => s.team);
  const jumpOffsetMs = useStore((s) => s.jumpOffsetMs);
  const pendingPromotion = useStore((s) => s.pendingPromotion);
  const toast = useStore((s) => s.toast);
  const completionKey = useStore((s) => s.completionKey);
  const start = useStore((s) => s.start);
  const markDone = useStore((s) => s.markDone);
  const askHelp = useStore((s) => s.askHelp);
  const waiting = useStore((s) => s.waiting);
  const notMine = useStore((s) => s.notMine);
  const moveLater = useStore((s) => s.moveLater);
  const showPending = useStore((s) => s.showPending);
  const logInteraction = useStore((s) => s.logInteraction);

  const now = useNow(SEED_NOW_ISO, jumpOffsetMs);
  const person = team.find((p) => p.id === persona) ?? team[0];

  const pending =
    pendingPromotion && !pendingPromotion.dismissed ? pendingPromotion : null;
  const queue = queueFor(
    items,
    person.id,
    now,
    pending?.frozenHeroId ?? undefined,
  );
  const { done, total } = totalTodayFor(items, doneLog, person.id);
  const myDone = doneLog.filter((d) => d.assigneeId === person.id);
  const cutoff = nextCutoff(now);
  const pendingItem = pending
    ? items.find((i) => i.id === pending.itemId)
    : undefined;
  const nowTierCount =
    queue.now.length + (queue.hero?.result.tier === "now" ? 1 : 0);
  const nextRanked = queue.now[0] ?? queue.next[0] ?? queue.later[0] ?? null;
  const heroId = queue.hero?.item.id ?? null;

  // M5. The store stamps the restore toast with its own kind, and any later action
  // replaces that toast in the same render it changes the hero — so reading the kind
  // here is already a one-shot, with no timer to keep in step with the animation. It
  // does two things: the hero flies in from the toast instead of rising into place, and
  // `nextHeroId` goes null, which takes the shared `layoutId` off every queue row so
  // the row that is about to be replaced cannot morph into the card replacing it.
  const restoring = toast?.kind === "undo-restored";

  // M4 ①. The check belongs to the *completion*, and a completion is an event rather
  // than a state something else can also arrive at.
  //
  // Rendered from the outgoing hero it drew on every exit of that card, which included
  // an undo — a green tick on the item you had just un-completed. That one was real and
  // is in evidence/m8's first capture.
  //
  // The fix after that watched the length of this persona's done list, which is a count,
  // and counts go up for reasons that are not completions: the store rehydrates from
  // localStorage after mount, and switching persona swaps the list wholesale. No
  // sequence was found where that version visibly misfired — it is replaced because
  // "how many are done" is the wrong question, not because a failing case was observed.
  // `completionKey` is bumped by `markDone` and by nothing else, and is not persisted.
  //
  // Derived rather than set: the check is "there is a completion I have not finished
  // drawing yet", so the effect only has to mark one *seen*, on a timer. Setting a flag
  // true synchronously inside the effect that notices the completion is a cascading
  // render, and the lint rule that says so is right.
  const [seenCompletionKey, setSeenCompletionKey] = useState(completionKey);
  const justCompleted = completionKey !== seenCompletionKey;
  useEffect(() => {
    if (!justCompleted) return;
    // The draw's own length, and no more. It used to hold for the draw *plus* the exit,
    // which — measured frame by frame after the slot's timing was corrected — left the
    // check sitting at full opacity over a promoted card that was already 97% in. It now
    // begins leaving exactly as that card begins arriving.
    const timer = setTimeout(() => setSeenCompletionKey(completionKey), duration.base * 1000);
    return () => clearTimeout(timer);
  }, [justCompleted, completionKey]);

  // G4: focus moves to the new hero after a done action (and back after undo) — any
  // hero-id change caused by something other than the page's first paint. Two renders
  // (state flips a beat after the id changes) is deliberately simpler than mutating a
  // ref mid-render to catch it in one.
  const mountedRef = useRef(false);
  const [focusHeroId, setFocusHeroId] = useState<string | null>(null);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    setFocusHeroId(heroId);
  }, [heroId]);

  // Catalog M8: when the ranking changes for a reason the user did not cause, the rows
  // that actually moved get a 900ms tint wash so the eye can find them. It used to fire
  // only for a row a demo injection had just *added*, which is one case of several — the
  // demo's time jump reorders the queue without adding anything, and every row it moved
  // moved silently.
  //
  // "Only animate rows whose index changed" is the catalog's own note, and it is the
  // whole point: washing the list says nothing. A done or an undo is excluded because the
  // user caused those and they have their own choreography; washing behind the promotion
  // would be a second explanation of something already being explained.
  // Tracks the completion the wash effect last saw, so a reorder caused by finishing an
  // item is attributed to the user rather than washed as if the queue moved on its own.
  const userDrivenRef = useRef(completionKey);
  const orderRef = useRef<string[]>([]);
  const [washIds, setWashIds] = useState<readonly string[]>([]);
  const rankedOrder = [...queue.now, ...queue.next, ...queue.later].map(
    (r) => r.item.id,
  );
  const orderKey = rankedOrder.join(",");
  useEffect(() => {
    const before = orderRef.current;
    const after = orderKey.length > 0 ? orderKey.split(",") : [];
    orderRef.current = after;
    if (before.length === 0) return;
    if (userDrivenRef.current !== completionKey || restoring) {
      userDrivenRef.current = completionKey;
      return;
    }
    const moved = after.filter((id, index) => {
      const was = before.indexOf(id);
      return was !== -1 && was !== index;
    });
    const arrived = after.filter((id) => !before.includes(id));
    const changed = [...new Set([...moved, ...arrived])];
    if (changed.length === 0) return;
    setWashIds(changed);
    const timer = setTimeout(() => setWashIds([]), duration.slow * 1000);
    return () => clearTimeout(timer);
  }, [orderKey, completionKey, restoring]);

  useEffect(() => {
    logInteraction(Date.now());
    function markActive() {
      logInteraction(Date.now());
    }
    window.addEventListener("pointerdown", markActive);
    window.addEventListener("keydown", markActive);
    return () => {
      window.removeEventListener("pointerdown", markActive);
      window.removeEventListener("keydown", markActive);
    };
  }, [logInteraction]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const name = resolveHotkey(event, event.target as HTMLElement | null);
      if (!name) return;
      if (name === "moveDown" || name === "moveUp") {
        const rows = Array.from(
          document.querySelectorAll<HTMLAnchorElement>("[data-row-nav]"),
        );
        if (rows.length === 0) return;
        const activeIndex = rows.findIndex(
          (el) => el === document.activeElement,
        );
        const nextIndex =
          activeIndex === -1
            ? name === "moveDown"
              ? 0
              : rows.length - 1
            : Math.min(
                rows.length - 1,
                Math.max(0, activeIndex + (name === "moveDown" ? 1 : -1)),
              );
        event.preventDefault();
        rows[nextIndex]?.focus();
      } else if (name === "markDone" && queue.hero) {
        event.preventDefault();
        markDone(queue.hero.item.id, now.toISOString());
      } else if (name === "askHelp" && queue.hero) {
        event.preventDefault();
        askHelp(queue.hero.item.id);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [queue.hero, markDone, askHelp, now]);

  return (
    <PageGrid className="py-8 lg:py-12">
      {/* §7.1 puts the status line 16px above the hero; §5.2 keeps 24 between the hero
          and the queue, which is the one override this column needs. */}
      <PageMain data-testid="work-main" className="gap-4">
        <StatusSentence
          now={now}
          nowTierCount={nowTierCount}
          done={done}
          total={total}
          nextCutoff={cutoff}
        />

        <div className="min-[75rem]:hidden">
          <TruckClock cutoffs={site.cutoffs} now={now} />
        </div>

        {/* M1/M5: one LayoutGroup so the hero and the queue rows share a single FLIP
            tree — the shared `layoutId` on ItemShell (item-shell.tsx) only bridges
            row <-> hero when both live under the same group. */}
        <LayoutGroup>
          <div className="relative">
            <AnimatePresence mode="popLayout" initial={false}>
              {queue.hero ? (
                <Hero
                  key={queue.hero.item.id}
                  ranked={queue.hero}
                  nextRanked={nextRanked}
                  now={now}
                  nextCutoffAt={cutoff?.departsAt ?? null}
                  pendingTitle={pendingItem?.title ?? null}
                  focusOnMount={focusHeroId === queue.hero.item.id}
                  restoring={restoring}
                  afterCheck={justCompleted}
                  primaryInDock
                  onShowMe={showPending}
                  onStart={() =>
                    start(queue.hero!.item.id, person.id, now.toISOString())
                  }
                  onMarkDone={() =>
                    markDone(queue.hero!.item.id, now.toISOString())
                  }
                  onAskHelp={(reason, note) =>
                    askHelp(queue.hero!.item.id, reason, note)
                  }
                  onWaiting={(who, checkBackAt) =>
                    waiting(queue.hero!.item.id, who, checkBackAt)
                  }
                  onMoveLater={(snoozeUntil) =>
                    moveLater(queue.hero!.item.id, snoozeUntil)
                  }
                  onNotMine={() => notMine(queue.hero!.item.id)}
                />
              ) : (
                <AllClear key="all-clear" done={myDone} />
              )}
            </AnimatePresence>
            {/* Its own presence, separate from the hero's: the check is not a hero and
                must not be something `popLayout` measures or waits on. */}
            <AnimatePresence>{justCompleted && <CheckDraw key="check" />}</AnimatePresence>
          </div>

          {/* M4 ④, and the reason it is a layout animation rather than a reflow: every
              hero is a different height, so promoting one moves the whole queue under it.
              Left to the browser that is a hard jump *and* a measured layout shift (G6
              asks for none); as a FLIP it is a transform, which the layout-instability
              spec excludes by definition and which is also what "the gap closes beneath
              it" is supposed to look like. */}
          {(queue.now.length > 0 ||
            queue.next.length > 0 ||
            queue.later.length > 0 ||
            queue.waiting.length > 0 ||
            queue.snoozed.length > 0) && (
            <motion.div layout transition={spring.layout}>
              <Queue
                className="mt-2"
                now={now}
                nowGroup={queue.now}
                nextGroup={queue.next}
                laterGroup={queue.later}
                waiting={queue.waiting}
                snoozed={queue.snoozed}
                // All clear (queue.hero null) already lists these same entries above —
                // showing them again in the queue's own "Done today" section would list
                // every completion twice.
                done={queue.hero ? myDone : []}
                nextCutoffAt={cutoff?.departsAt ?? null}
                nextHeroId={restoring ? null : (nextRanked?.item.id ?? null)}
                washIds={washIds}
                onStart={(id) => start(id, person.id, now.toISOString())}
                onMarkDone={(id) => markDone(id, now.toISOString())}
                onWaiting={(id, who, checkBackAt) =>
                  waiting(id, who, checkBackAt)
                }
                onMoveLater={(id, snoozeUntil) => moveLater(id, snoozeUntil)}
                onNotMine={(id) => notMine(id)}
              />
            </motion.div>
          )}
        </LayoutGroup>
      </PageMain>

      <PageRail data-testid="work-rail">
        <TruckClock cutoffs={site.cutoffs} now={now} stacked />
        <ShiftTimeline now={now} shift={site.shift} cutoffs={site.cutoffs} />
        <FyiPreview />
      </PageRail>

      {/* The handheld primary. It is the *only* primary below 768 — the hero's own
          version is hidden there (hero.tsx) rather than painted twice, which is what v2
          did. A bar rather than a floating pill: it sits flush on the dock, so the two
          fixed elements meet edge to edge instead of overlapping by a pixel, and the
          120px inset `<main>` reserves is exactly this bar plus that dock. */}
      {queue.hero && (
        <div
          data-testid="work-mobile-cta"
          className="fixed inset-x-0 bottom-(--h-dock) z-30 border-t border-(--line-1) bg-(--surface-1) px-4 py-3 md:hidden"
        >
          <Button
            size="lg"
            className="w-full"
            onClick={
              queue.hero.item.status === "in_progress"
                ? () => markDone(queue.hero!.item.id, now.toISOString())
                : () => start(queue.hero!.item.id, person.id, now.toISOString())
            }
          >
            {queue.hero.item.status === "in_progress"
              ? copy.actions.done
              : queue.hero.item.primaryAction}
          </Button>
        </div>
      )}
    </PageGrid>
  );
}
