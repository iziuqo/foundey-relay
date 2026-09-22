"use client";

import { useEffect, useRef } from "react";
import { MoreHorizontal } from "lucide-react";
import { motion, usePresence } from "motion/react";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { transition } from "@/lib/motion";
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
  onShowMe: () => void;
  onStart: () => void;
  onMarkDone: () => void;
  onAskHelp: (reason: string, note: string) => void;
  onWaiting: (waitingOn: string, checkBackAt: string) => void;
  onMoveLater: (snoozeUntil: string) => void;
  onNotMine: () => void;
}

/**
 * §6.1 hero card. Four text styles, top to bottom: meta row, title, why, actions.
 *
 * The card's visual chrome (border, background, tier glow) lives in `ItemShell`, an
 * absolutely positioned sibling that shares a `layoutId` with whichever queue row is
 * about to be promoted (M1, §7.2). This element's own content fades up 8px on mount —
 * the hero's half of that same moment, independent of the shell's box morph so text
 * never rides along with a resize (see item-shell.tsx).
 *
 * Deliberately no `exit` prop — the completed item has nothing to animate into (it's
 * done, not demoted to a row), and the promoted item's box is carried by its shell's
 * shared `layoutId` regardless of whether this component exits gracefully. Even so,
 * `AnimatePresence` (work/page.tsx) doesn't unmount an outgoing child in the same
 * commit — it always waits at least one effect cycle to confirm nothing wants to
 * animate, which is exactly long enough for a fast assertion (or a real user's Ctrl+Z
 * double-tap) to see two `data-testid="hero"` nodes at once. `usePresence` calls
 * `safeToRemove` the instant this render is told to exit, to make that window as short
 * as possible, and marks the outgoing copy `inert` with its testid/aria-label stripped
 * for whatever's left of it — so it never answers a strict-mode locator, never
 * duplicates the landmark for axe, and never leaves a focusable button reachable in a
 * node nobody can see.
 */
export function Hero({
  ranked,
  nextRanked,
  now,
  nextCutoffAt,
  pendingTitle,
  focusOnMount,
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
  const [isPresent, safeToRemove] = usePresence();

  useEffect(() => {
    if (focusOnMount) sectionRef.current?.focus();
  }, [focusOnMount]);

  useEffect(() => {
    if (!isPresent) safeToRemove?.();
  }, [isPresent, safeToRemove]);

  return (
    <motion.section
      ref={sectionRef}
      data-testid={isPresent ? "hero" : undefined}
      aria-label={isPresent ? copy.hero[tier] : undefined}
      inert={!isPresent || undefined}
      tabIndex={-1}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.base}
      className="relative rounded-(--radius-hero) p-5 outline-none"
    >
      <ItemShell itemId={item.id} tier={tier} variant="hero" />

      {pendingTitle && <NewUrgentBand title={pendingTitle} onShowMe={onShowMe} />}

      {/* Meta row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <TierIcon tier={tier} safety={item.safety} className={cn("size-(--size-icon-md)", tierFgClass[tier])} />
          <span className={cn("text-(length:--text-meta) font-semibold", tierFgClass[tier])}>
            {copy.tiers[tier].label}
          </span>
          <span className="text-(length:--text-meta) text-(--text-2)">· {item.cause}</span>
        </div>
        <CountdownArc item={item} now={now} tier={tier} />
      </div>

      {/* Title */}
      <h2
        data-testid={isPresent ? "hero-title" : undefined}
        className="mt-3 text-(length:--text-hero) leading-(length:--leading-hero) font-semibold text-(--text-1)"
      >
        {item.title}
      </h2>

      {/* Why */}
      <p data-testid={isPresent ? "hero-why" : undefined} className="mt-2 text-(length:--text-body) text-(--text-2)">
        {item.whyText}{" "}
        <WhyPopover
          ranked={ranked}
          nextRanked={nextRanked}
          now={now}
          trigger={
            <button
              type="button"
              className={cn(
                "font-medium underline decoration-(--border-2) underline-offset-2 hover:decoration-current",
                tierFgClass[tier],
              )}
            >
              {copy.why.title}
            </button>
          }
        />
      </p>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="lg" onClick={inProgress ? onMarkDone : onStart}>
          {inProgress ? copy.actions.done : item.primaryAction}
        </Button>
        {item.helpAsked ? (
          <span className="inline-flex h-(--size-control-lg) items-center rounded-(--radius-control) border border-(--border-1) px-4 text-(length:--text-meta) text-(--text-2)">
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
    </motion.section>
  );
}
