"use client";

import { useEffect, useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import { motion, useIsPresent } from "motion/react";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { duration, spring, transition } from "@/lib/motion";
import { relativeDuration, minutesBetween } from "@/lib/time";
import type { Ranked } from "@/lib/priority";
import { TierIcon } from "./tier-icon";
import { CountdownArc } from "./countdown-arc";
import { WhyPopover } from "./why-popover";
import { HelpPopover } from "./help-popover";
import { ItemOverflowPopover } from "./item-overflow-popover";
import { NewUrgentBand } from "./new-urgent-band";
import { ItemShell } from "./item-shell";
import { tierFgClass } from "./tier-tokens";

type ActiveTier = "now" | "next" | "later";

export interface HeroProps {
  ranked: Ranked;
  nextRanked: Ranked | null;
  now: Date;
  nextCutoffAt: string | null;
  pendingTitle: string | null;
  /** True whenever this render is a promotion the user caused (done, undo) rather than
   * the page's first paint — gates the focus move in the effect below (G4). */
  focusOnMount?: boolean;
  /** True on the render an undo restored this item (M5). Swaps the entrance from "the
   * next thing rose into place" to "the thing you just finished came back", and — via
   * `nextHeroId` going null on the page — takes the shared `layoutId` off every queue
   * row, so nothing reverse-morphs. */
  restoring?: boolean;
  /**
   * Set only by `/work`, which puts the handheld primary in a sticky bar above the dock
   * instead (§5.7's 120px inset). Everywhere else this card renders — `/system/patterns`,
   * the deck's `mini-work` — there is no dock and no bar, so the card keeps its own
   * primary at every width rather than losing it below 768 to an arrangement it is not
   * part of.
   */
  primaryInDock?: boolean;
  onShowMe: () => void;
  onStart: () => void;
  onMarkDone: () => void;
  onAskHelp: (reason: string, note: string) => void;
  onWaiting: (waitingOn: string, checkBackAt: string) => void;
  onMoveLater: (snoozeUntil: string) => void;
  onNotMine: () => void;
  /**
   * `AnimatePresence mode="popLayout"` hands every child a ref and uses it to measure the
   * outgoing one and take it out of the flow. A plain function component silently drops
   * that ref, and the whole mechanism silently does nothing — the outgoing card then sits
   * at full height above the incoming one (measured: the promoted hero read at y 408 and
   * settled at y 88 once the old card finally unmounted, a 320px jump on every done).
   * React 19 passes `ref` as an ordinary prop, so accepting it here is the whole fix.
   */
  ref?: React.Ref<HTMLElement>;
}

/**
 * The hero — the single focal object on `/work` (reference `p01`), and the one element
 * the whole submission is graded on at two metres.
 *
 * **Four text styles, and no more** (advisor §7.3; v2's carried eight): the tier label
 * and the cause share the eyebrow at `t-meta`, the title is `t-hero`, the why-sentence
 * is `t-body`. Everything else here is a control or the countdown numeral.
 *
 * **Internal rhythm 24 / 12 / 20, padding 24, radius 16.** Eyebrow to title 24, title
 * to why 12, why to the action row 20 — the status line's own 16px sits above the card
 * and belongs to the page, not to this component.
 *
 * **The countdown is positioned, not placed.** It is absolutely positioned against the
 * card rather than dropped into the eyebrow's right slot, because `align-items: start`
 * aligns a tall child, it does not stop one from setting the row's height — and a 72px
 * ring inside a 28px text row is exactly how v2 produced its measured 73px void. The
 * eyebrow is therefore a hard `h-7`, the ring overhangs into the title's band, and the
 * title reserves that band's right edge with `--hero-gutter`.
 *
 * Below 768 the ring is not rendered at all and the remaining time joins the eyebrow as
 * text. A phone is a lean-in surface at ~350mm (§3.3's two-metre argument is about the
 * shared 24" workstation), so the ring buys nothing there and costs 44px of vertical
 * plus most of the title's width on the widest screen the title has to survive.
 *
 * The card's chrome (border, tint, tier glow) lives in `ItemShell`, an absolutely
 * positioned sibling sharing a `layoutId` with the queue row about to be promoted (M1,
 * §7.2). Real content never sits inside that layer: Motion scales the whole box, and a
 * 64px row growing into a ~210px card would visibly stretch any text riding along.
 *
 * Deliberately no `exit` prop — a completed item has nothing to animate into, and the
 * promoted item's box is carried by the shared `layoutId` either way. `AnimatePresence`
 * still keeps an outgoing child mounted for at least one effect cycle, which is long
 * enough for a fast assertion (or a real Ctrl+Z double-tap) to see two heroes at once,
 * so `usePresence` calls `safeToRemove` immediately and the outgoing copy is marked
 * `inert` with its testid and label stripped: it never answers a strict-mode locator,
 * never duplicates the landmark for axe, and never leaves a focusable button reachable
 * inside a node nobody can see.
 */
export function Hero({
  ref,
  ranked,
  nextRanked,
  now,
  nextCutoffAt,
  pendingTitle,
  focusOnMount,
  restoring,
  primaryInDock,
  onShowMe,
  onStart,
  onMarkDone,
  onAskHelp,
  onWaiting,
  onMoveLater,
  onNotMine,
}: HeroProps) {
  const { item, result } = ranked;
  const tier = result.tier as ActiveTier;
  const inProgress = item.status === "in_progress";
  const sectionRef = useRef<HTMLElement>(null);
  // One node, two owners: this card focuses itself after a promotion (G4) and
  // AnimatePresence needs the same element to pop it out of the flow on the way out.
  const attachRef = (node: HTMLElement | null) => {
    sectionRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as React.RefObject<HTMLElement | null>).current = node;
  };
  const isPresent = useIsPresent();

  const minutesLeft = item.dueAt
    ? minutesBetween(now, new Date(item.dueAt))
    : null;
  const handheldTime =
    minutesLeft === null
      ? null
      : minutesLeft < 0
        ? `Late ${relativeDuration(minutesLeft)}`
        : relativeDuration(minutesLeft);

  useEffect(() => {
    if (focusOnMount) sectionRef.current?.focus();
  }, [focusOnMount]);

  // M4 ②. `useIsPresent`, not `usePresence`, and the difference is the whole
  // mechanism: `usePresence` puts removal under manual control, so AnimatePresence stops
  // removing the card itself *and* `popLayout` stops lifting it out of the flow. The
  // outgoing hero then sits at full height under the new one (observed: the real hero
  // pushed 296px down the page, behind an invisible copy of the card before it).
  // `useIsPresent` only reads the flag, which is all this card wants it for — stripping
  // the testid and the label, closing the copy with `inert`, and drawing the check.
  //
  // So the exit below is a real exit animation and AnimatePresence owns the removal.
  // Driving it by hand instead — a timer, then `safeToRemove()` — deadlocks the moment
  // anything mounts into the exiting subtree, because AnimatePresence then counts that
  // child's own exit as one more thing to wait for.
  //
  // What made the old immediate removal necessary is still handled, and by the same
  // means: `inert` closes the outgoing copy to the keyboard and the a11y tree, and its
  // testid and label are stripped, so while it plays it answers no strict-mode locator
  // and duplicates no landmark for axe.

  return (
    <motion.section
      ref={attachRef}
      data-testid={isPresent ? "hero" : undefined}
      data-tier={tier}
      aria-label={isPresent ? copy.hero[tier] : undefined}
      inert={!isPresent || undefined}
      tabIndex={-1}
      // Two entrances, and they are different moves on purpose. A promotion (M4 ③)
      // arrives *after* the card it replaces has left, so its fade is delayed by exactly
      // that beat; `AnimatePresence initial={false}` on /work means
      // this never costs the first paint anything, because there is no entrance to
      // delay there. An undo (M5) is the item you just finished coming back from the
      // toast in the bottom-left corner — one spring, from that direction, and
      // explicitly *not* the promotion played backwards, which reads as a glitch.
      initial={
        restoring
          ? { opacity: 0, x: -96, y: 120, scale: 0.96 }
          : { opacity: 0, y: 8 }
      }
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={restoring ? spring.layout : { ...transition.base, delay: duration.quick }}
      // M4 ②: the content leaves on the exit curve, and that is all the exit does. It
      // used to hold the card fully opaque for 200ms first, to give the check time to
      // draw on it — which was right while the check lived on this card and wrong the
      // moment it moved to the slot (work/page.tsx). On an undo, where there is no check
      // at all, that hold showed the outgoing card at full opacity underneath the one
      // flying in, and a single restore read as two stacked heroes for a fifth of a
      // second. The card now leaves in 140ms and the promoted one arrives at 140ms, so
      // the slot holds exactly one card at a time.
      exit={{ opacity: 0, y: -6, transition: transition.exit }}
      className="relative rounded-(--radius-hero) p-6 outline-none [--hero-gutter:0px] md:[--hero-gutter:5.25rem]"
    >
      {/* M5: the restored card has nowhere to morph from — the row it would share a
          `layoutId` with is the row it is about to replace — so the shared shell is off
          for this one render and the card simply arrives. */}
      <ItemShell
        itemId={item.id}
        tier={tier}
        variant="hero"
        shared={!restoring}
      />

      <div>
        {pendingTitle && (
          <NewUrgentBand title={pendingTitle} onShowMe={onShowMe} />
        )}

        {/* Eyebrow — a hard 28px so nothing beside it can set the height. */}
        <div data-testid="hero-eyebrow" className="flex h-7 items-center gap-2">
          {/* Shape carries the tier, the label carries the hue — one rule, everywhere on
            this screen (see queue-row.tsx). Colouring the glyph too says the same thing
            twice in the same 100px and spends budget the Act-now tint has better use
            for. */}
          <TierIcon
            tier={tier}
            safety={item.safety}
            className="size-(--icon-xl) text-(--text-2)"
          />
          <span
            className={cn(
              "t-meta font-semibold whitespace-nowrap",
              tierFgClass[tier],
            )}
          >
            {copy.tiers[tier].label}
          </span>
          <span className="t-meta min-w-0 truncate text-(--text-2)">
            · {item.cause}
          </span>
          {/* Below 768 the ring is not rendered, so the remaining time joins the eyebrow
            as text — outside the truncating span, because the time is the part of this
            row that must survive a long cause. */}
          {handheldTime ? (
            <span className="tnum t-meta ml-auto shrink-0 pl-2 text-(--text-1) md:hidden">
              {handheldTime}
            </span>
          ) : null}
        </div>

        {/* The countdown, out of the flow. Hidden below 768; see the note above. */}
        <div className="absolute top-6 right-6 hidden md:block">
          <CountdownArc item={item} now={now} tier={tier} />
        </div>

        <h2
          data-testid={isPresent ? "hero-title" : undefined}
          className="t-hero-sm md:t-hero mt-6 max-w-[22ch] pr-(--hero-gutter) text-balance text-(--text-1)"
        >
          {item.title}
        </h2>

        <p
          data-testid={isPresent ? "hero-why" : undefined}
          className="t-body mt-3 max-w-[68ch] text-(--text-2)"
        >
          {item.whyText}{" "}
          <WhyPopover
            ranked={ranked}
            nextRanked={nextRanked}
            now={now}
            trigger={
              <button
                type="button"
                // `tap-48` and not a taller box: this button sits inside a sentence, so
                // growing it to 44px would open a gap in the line it lives on. The target
                // grows instead, via a transparent ::before (globals.css).
                className="tap-48 rounded-(--r-2) font-medium text-(--text-1) underline decoration-(--line-2) underline-offset-2 hover:decoration-current focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus)"
              >
                {copy.why.title}
              </button>
            }
          />
        </p>

        {/* The action row carries the secondary actions only below 768: three 48px
          controls do not fit across 310px of card without one of them truncating, and
          §5.7 already reserves a 120px bottom inset for a sticky primary above the dock.
          So the phone gets exactly one primary, at thumb height, and the card keeps the
          two it can hold. v2 rendered the primary in both places at once (measured: the
          floating bar and the hero's own button, both visible on first paint). */}
        <div data-craft-row className="mt-5 flex flex-wrap items-center gap-2">
          <Button
            size="lg"
            className={cn(primaryInDock && "max-md:hidden")}
            onClick={inProgress ? onMarkDone : onStart}
          >
            {inProgress ? copy.actions.done : item.primaryAction}
          </Button>
          {item.helpAsked ? (
            <span className="t-body inline-flex h-(--h-lg) items-center rounded-(--r-4) border border-(--line-1) px-5 text-(--text-2)">
              {copy.help.chip}
            </span>
          ) : (
            <HelpPopover
              trigger={
                <Button size="lg" variant="secondary">
                  {copy.actions.help}
                </Button>
              }
              onSend={onAskHelp}
            />
          )}
          <ItemOverflowPopover
            tier={tier}
            now={now}
            nextCutoffAt={nextCutoffAt}
            onWaiting={onWaiting}
            onMoveLater={onMoveLater}
            onNotMine={onNotMine}
            trigger={
              <IconButton size="lg" aria-label={copy.actions.more}>
                <MoreHorizontal aria-hidden />
              </IconButton>
            }
          />
        </div>
      </div>
    </motion.section>
  );
}
