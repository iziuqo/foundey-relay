"use client";

import { MoreHorizontal } from "lucide-react";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import type { Ranked } from "@/lib/priority";
import { TierIcon } from "./tier-icon";
import { CountdownArc } from "./countdown-arc";
import { WhyPopover } from "./why-popover";
import { HelpPopover } from "./help-popover";
import { ItemOverflowPopover } from "./item-overflow-popover";
import { NewUrgentBand } from "./new-urgent-band";
import { tierBorderClass, tierFgClass, tierGlowShadowClass } from "./tier-tokens";

type ActiveTier = "now" | "next" | "later";

export interface HeroProps {
  ranked: Ranked;
  nextRanked: Ranked | null;
  now: Date;
  nextCutoffAt: string | null;
  pendingTitle: string | null;
  onShowMe: () => void;
  onStart: () => void;
  onMarkDone: () => void;
  onAskHelp: (reason: string, note: string) => void;
  onWaiting: (waitingOn: string, checkBackAt: string) => void;
  onMoveLater: (snoozeUntil: string) => void;
  onNotMine: () => void;
}

/** §6.1 hero card. Four text styles, top to bottom: meta row, title, why, actions. */
export function Hero({
  ranked,
  nextRanked,
  now,
  nextCutoffAt,
  pendingTitle,
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

  return (
    <section
      data-testid="hero"
      aria-label={copy.hero[tier]}
      className={cn(
        "rounded-(--radius-hero) border bg-(--surface-1) p-5",
        tier === "now" && "bg-(--act-bg)",
        tierBorderClass[tier],
        tierGlowShadowClass[tier],
      )}
    >
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
        data-testid="hero-title"
        className="mt-3 text-(length:--text-hero) leading-(length:--leading-hero) font-semibold text-(--text-1)"
      >
        {item.title}
      </h2>

      {/* Why */}
      <p data-testid="hero-why" className="mt-2 text-(length:--text-body) text-(--text-2)">
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
    </section>
  );
}
