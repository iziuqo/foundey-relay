"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup } from "motion/react";
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
import { Button } from "@/components/ui/button";

function FyiPreview() {
  const fyi = [...seedItemsForFyi]
    .filter((i) => i.source === "fyi")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  if (fyi.length === 0) return null;
  return (
    <div className="flex min-h-22 flex-col gap-2 rounded-(--r-4) border border-(--line-1) p-4">
      {/* t-meta rather than t-eyebrow: the eyebrow step is 12px, and /work holds a 14px
          floor for anything carrying content (G3). */}
      <p data-eyebrow className="t-meta font-semibold tracking-[0.06em] text-(--text-2) uppercase">
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

  const pending = pendingPromotion && !pendingPromotion.dismissed ? pendingPromotion : null;
  const queue = queueFor(items, person.id, now, pending?.frozenHeroId ?? undefined);
  const { done, total } = totalTodayFor(items, doneLog, person.id);
  const cutoff = nextCutoff(now);
  const pendingItem = pending ? items.find((i) => i.id === pending.itemId) : undefined;
  const nowTierCount = queue.now.length + (queue.hero?.result.tier === "now" ? 1 : 0);
  const nextRanked = queue.now[0] ?? queue.next[0] ?? queue.later[0] ?? null;
  const heroId = queue.hero?.item.id ?? null;

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

  // M5's tint wash, scoped to a row a demo injection just added (§8.4) — the one
  // "something moved for a reason other than my own click" case the app has today.
  const knownItemIdsRef = useRef<Set<string>>(new Set(items.map((i) => i.id)));
  const [justPromotedId, setJustPromotedId] = useState<string | null>(null);
  useEffect(() => {
    const known = knownItemIdsRef.current;
    const added = items.find((i) => !known.has(i.id));
    knownItemIdsRef.current = new Set(items.map((i) => i.id));
    if (!added) return;
    setJustPromotedId(added.id);
    const timer = setTimeout(() => setJustPromotedId(null), 900);
    return () => clearTimeout(timer);
  }, [items]);

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
        const rows = Array.from(document.querySelectorAll<HTMLAnchorElement>("[data-row-nav]"));
        if (rows.length === 0) return;
        const activeIndex = rows.findIndex((el) => el === document.activeElement);
        const nextIndex =
          activeIndex === -1
            ? name === "moveDown"
              ? 0
              : rows.length - 1
            : Math.min(rows.length - 1, Math.max(0, activeIndex + (name === "moveDown" ? 1 : -1)));
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
                primaryInDock
                onShowMe={showPending}
                onStart={() => start(queue.hero!.item.id, person.id, now.toISOString())}
                onMarkDone={() => markDone(queue.hero!.item.id, now.toISOString())}
                onAskHelp={() => askHelp(queue.hero!.item.id)}
                onWaiting={(who, checkBackAt) => waiting(queue.hero!.item.id, who, checkBackAt)}
                onMoveLater={(snoozeUntil) => moveLater(queue.hero!.item.id, snoozeUntil)}
                onNotMine={() => notMine(queue.hero!.item.id)}
              />
            ) : (
              <AllClear key="all-clear" doneToday={done} />
            )}
          </AnimatePresence>

          {(queue.now.length > 0 ||
            queue.next.length > 0 ||
            queue.later.length > 0 ||
            queue.waiting.length > 0 ||
            queue.snoozed.length > 0) && (
            <Queue
              className="mt-2"
              now={now}
              nowGroup={queue.now}
              nextGroup={queue.next}
              laterGroup={queue.later}
              waiting={queue.waiting}
              snoozed={queue.snoozed}
              done={doneLog.filter((d) => d.assigneeId === person.id)}
              nextCutoffAt={cutoff?.departsAt ?? null}
              nextHeroId={nextRanked?.item.id ?? null}
              justPromotedId={justPromotedId}
              onStart={(id) => start(id, person.id, now.toISOString())}
              onMarkDone={(id) => markDone(id, now.toISOString())}
              onWaiting={(id, who, checkBackAt) => waiting(id, who, checkBackAt)}
              onMoveLater={(id, snoozeUntil) => moveLater(id, snoozeUntil)}
              onNotMine={(id) => notMine(id)}
            />
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
            {queue.hero.item.status === "in_progress" ? copy.actions.done : queue.hero.item.primaryAction}
          </Button>
        </div>
      )}
    </PageGrid>
  );
}
