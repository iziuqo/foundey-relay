"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { copy } from "@/lib/copy";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import type { Ranked } from "@/lib/priority";
import { TierIcon } from "./tier-icon";
import { TimePill } from "./time-pill";
import { ItemOverflowPopover } from "./item-overflow-popover";
import { tierFgClass } from "./tier-tokens";

export interface QueueRowProps {
  ranked: Ranked;
  now: Date;
  nextCutoffAt: string | null;
  onStart: () => void;
  onMarkDone: () => void;
  onWaiting: (waitingOn: string, checkBackAt: string) => void;
  onMoveLater: (snoozeUntil: string) => void;
  onNotMine: () => void;
}

/**
 * §6.1: no buttons at rest. Start and the overflow menu slide in on hover/focus (M7,
 * 160ms/quick). The row's main target is a link to /items/[id] inside the li; row
 * actions are sibling buttons, never nested inside that link (README P1 14).
 */
export function QueueRow({ ranked, now, nextCutoffAt, onStart, onMarkDone, onWaiting, onMoveLater, onNotMine }: QueueRowProps) {
  const { item, result } = ranked;
  const tier = result.tier as "now" | "next" | "later";
  const inProgress = item.status === "in_progress";

  return (
    <li className="group relative flex min-h-(--size-row-min-handheld) items-center gap-3 border-b border-(--border-1) px-3 last:border-0 lg:min-h-(--size-row-min)">
      <TierIcon tier={tier} safety={item.safety} className={cn("shrink-0", tierFgClass[tier])} />
      <Link
        href={`/items/${item.id}`}
        data-row-nav
        className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 rounded-(--radius-control) py-2 outline-none focus-visible:ring-2 focus-visible:ring-(--focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg)"
      >
        <span className="truncate text-(length:--text-row) leading-(length:--leading-row) font-medium text-(--text-1)">
          {item.title}
        </span>
        <span className="truncate text-(length:--text-meta) text-(--text-2)">{item.cause}</span>
      </Link>
      <div className="relative flex h-8 shrink-0 items-center">
        <div className="transition-[opacity,transform] duration-[160ms] ease-out group-hover:-translate-x-1 group-hover:opacity-0 group-focus-within:-translate-x-1 group-focus-within:opacity-0">
          <TimePill dueAt={item.dueAt} now={now} tier={tier} />
        </div>
        <div className="absolute right-0 flex translate-x-2 items-center gap-1 opacity-0 transition-[opacity,transform] duration-[160ms] ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100">
          <Button size="sm" variant="secondary" onClick={inProgress ? onMarkDone : onStart}>
            {inProgress ? copy.actions.done : copy.actions.start}
          </Button>
          <ItemOverflowPopover
            tier={tier}
            now={now}
            nextCutoffAt={nextCutoffAt}
            onWaiting={onWaiting}
            onMoveLater={onMoveLater}
            onNotMine={onNotMine}
            trigger={
              <IconButton size="sm" aria-label={copy.actions.more}>
                <MoreHorizontal aria-hidden />
              </IconButton>
            }
          />
        </div>
      </div>
    </li>
  );
}
