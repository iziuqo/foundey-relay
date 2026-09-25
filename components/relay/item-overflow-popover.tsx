"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronLeft } from "lucide-react";
import { copy } from "@/lib/copy";
import { afterLunchIso, formatClock, siteTimeIso } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import type { EncodedTier } from "./tier-icon";

type Flow = "menu" | "waiting" | "later";

export interface ItemOverflowPopoverProps {
  trigger: React.ReactNode;
  tier: EncodedTier;
  now: Date;
  nextCutoffAt: string | null;
  onWaiting: (waitingOn: string, checkBackAt: string) => void;
  onMoveLater: (snoozeUntil: string) => void;
  onNotMine: () => void;
}

/** §6.1 row/hero overflow menu: Waiting on…, Move to later, Not mine. Built as one
 * Popover with an internal flow instead of a dropdown-that-opens-more-popovers, so
 * focus and portals stay simple. Move to later is disabled for Act now (copy.laterDisabled). */
export function ItemOverflowPopover({
  trigger,
  tier,
  now,
  nextCutoffAt,
  onWaiting,
  onMoveLater,
  onNotMine,
}: ItemOverflowPopoverProps) {
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState<Flow>("menu");
  const [waitingOn, setWaitingOn] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState("13:00");

  function reset(next: boolean) {
    setOpen(next);
    if (!next) {
      setFlow("menu");
      setWaitingOn(null);
    }
  }

  function finishWaiting(checkBackAt: string) {
    if (!waitingOn) return;
    onWaiting(waitingOn, checkBackAt);
    reset(false);
  }

  function finishLater(snoozeUntil: string) {
    onMoveLater(snoozeUntil);
    reset(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={reset}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          className="popover-content z-50 w-72 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-2 shadow-(--e3)"
        >
          {flow !== "menu" && (
            <button
              type="button"
              onClick={() => setFlow("menu")}
              className="mb-1 inline-flex items-center gap-1 rounded-(--r-4) px-2 py-1 text-(length:--t-meta-size) text-(--text-2) hover:bg-(--surface-2)"
            >
              <ChevronLeft className="icon-sm" aria-hidden />
              Back
            </button>
          )}

          {flow === "menu" && (
            <div className="flex flex-col">
              <MenuButton onClick={() => setFlow("waiting")}>{copy.actions.waiting}</MenuButton>
              <MenuButton onClick={() => setFlow("later")} disabled={tier === "now"}>
                {copy.actions.later}
              </MenuButton>
              {tier === "now" && (
                <p className="px-3 pb-1 text-(length:--t-meta-size) text-(--text-2)">{copy.laterDisabled}</p>
              )}
              <MenuButton
                onClick={() => {
                  onNotMine();
                  reset(false);
                }}
              >
                {copy.actions.notMine}
              </MenuButton>
            </div>
          )}

          {flow === "waiting" && (
            <div className="flex flex-col gap-3 p-2">
              <p className="text-(length:--t-meta-size) font-semibold text-(--text-1)">{copy.waitingPopover.who}</p>
              <div className="flex flex-wrap gap-1.5">
                {copy.waitingPopover.suggestions.map((who) => (
                  <button
                    key={who}
                    type="button"
                    onClick={() => setWaitingOn(who)}
                    aria-pressed={waitingOn === who}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-(length:--t-meta-size)",
                      waitingOn === who
                        ? "border-(--accent) bg-(--surface-2) text-(--text-1)"
                        : "border-(--line-1) text-(--text-2) hover:bg-(--surface-2)",
                    )}
                  >
                    {who}
                  </button>
                ))}
              </div>
              {waitingOn && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-(length:--t-meta-size) font-medium text-(--text-2)">{copy.waitingPopover.checkBack}</p>
                  <Button
                    variant="secondary"
                    onClick={() => finishWaiting(new Date(now.getTime() + 30 * 60000).toISOString())}
                  >
                    {copy.waitingPopover.in30}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => finishWaiting(new Date(now.getTime() + 60 * 60000).toISOString())}
                  >
                    {copy.waitingPopover.in1h}
                  </Button>
                  {nextCutoffAt && (
                    <Button variant="secondary" onClick={() => finishWaiting(nextCutoffAt)}>
                      {copy.waitingPopover.atCutoff.replace("{hhmm}", formatClock(new Date(nextCutoffAt)))}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {flow === "later" && tier !== "now" && (
            <div className="flex flex-col gap-1.5 p-2">
              <Button variant="secondary" onClick={() => finishLater(new Date(now.getTime() + 60 * 60000).toISOString())}>
                {copy.moveLaterOptions.in1h}
              </Button>
              <Button variant="secondary" onClick={() => finishLater(afterLunchIso(now))}>
                {copy.moveLaterOptions.afterLunch}
              </Button>
              <div className="flex items-center gap-2 rounded-(--r-4) border border-(--line-1) p-2">
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="h-(--h-sm) w-full rounded-(--r-4) border border-(--line-1) bg-(--surface-1) px-2 text-(length:--t-meta-size) text-(--text-1)"
                  aria-label={copy.moveLaterOptions.pick}
                />
                <IconButton
                  aria-label={copy.moveLaterOptions.pick}
                  size="sm"
                  onClick={() => finishLater(siteTimeIso(now, customTime))}
                >
                  <ChevronLeft className="icon-sm rotate-180" aria-hidden />
                </IconButton>
              </div>
            </div>
          )}

          <Popover.Arrow className="fill-(--surface-1)" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function MenuButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-(--r-4) px-3 py-2 text-left text-(length:--t-body-size) text-(--text-1) hover:bg-(--surface-2) disabled:opacity-50 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}
