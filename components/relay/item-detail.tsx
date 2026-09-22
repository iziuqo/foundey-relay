"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal, X } from "lucide-react";
import { motion } from "motion/react";
import { copy, t } from "@/lib/copy";
import { transition } from "@/lib/motion";
import { formatClock } from "@/lib/time";
import { site } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import type { Ranked } from "@/lib/priority";
import type { Item, Person } from "@/lib/types";
import { TierIcon } from "./tier-icon";
import { timePillText } from "./time-pill";
import { WhyFactors } from "./why-factors";
import { HelpPopover } from "./help-popover";
import { ItemOverflowPopover } from "./item-overflow-popover";
import { tierFgClass } from "./tier-tokens";

export interface ItemDetailProps {
  item: Item;
  assignee: Person | undefined;
  now: Date;
  nextCutoffAt: string | null;
  /** Always computed via `scoreItem`, even for FYI items (its tier is "fyi" there) — this component never recomputes the score. */
  ranked: Ranked;
  nextRanked: Ranked | null;
  /** Only the assignee gets the action footer; a read-only view otherwise (§6.2 scope: reassigning from here is a Team/manager feature, phase 5). */
  canAct: boolean;
  onStart?: () => void;
  onMarkDone?: () => void;
  onAskHelp?: (reason: string, note: string) => void;
  onWaiting?: (waitingOn: string, checkBackAt: string) => void;
  onMoveLater?: (snoozeUntil: string) => void;
  onNotMine?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onClose?: () => void;
  backHref?: string;
}

function PropertyRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-(length:--text-meta) text-(--text-2)">{label}</span>
      <span className="text-(length:--text-meta) font-medium text-(--text-1)">{value}</span>
    </div>
  );
}

/**
 * §6.2 item detail: tier meta, title, why (inline factor bars, not a popover), the
 * next step as a checklist line, properties, and history — with the same footer
 * actions as the hero, pinned. Shared by the full page (`/items/[id]`) and the
 * intercepting-route sheet, which differ only in their chrome around this.
 */
export function ItemDetail({
  item,
  assignee,
  now,
  nextCutoffAt,
  ranked,
  nextRanked,
  canAct,
  onStart,
  onMarkDone,
  onAskHelp,
  onWaiting,
  onMoveLater,
  onNotMine,
  onPrev,
  onNext,
  onClose,
  backHref,
}: ItemDetailProps) {
  const tier = ranked.result.tier as "now" | "next" | "later" | "fyi";
  const inProgress = item.status === "in_progress";
  const done = item.status === "done";
  const cutoff = item.cutoffId ? site.cutoffs.find((c) => c.id === item.cutoffId) : undefined;
  const startedAt =
    assignee?.currentTaskId === item.id && assignee.currentTaskStartedAt ? assignee.currentTaskStartedAt : null;

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-(--border-1) bg-(--surface-1) p-4">
        <div className="flex min-w-0 items-center gap-2">
          {backHref && (
            <Link
              href={backHref}
              className="flex items-center gap-1 rounded-(--radius-control) py-1 pr-2 text-(length:--text-meta) text-(--text-2) hover:text-(--text-1) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus)"
            >
              <ChevronLeft className="size-(--size-icon-sm)" aria-hidden />
              {copy.itemDetail.backToWork}
            </Link>
          )}
          <TierIcon tier={tier} safety={item.safety} className={cn("shrink-0", tierFgClass[tier])} />
          <span className={cn("truncate text-(length:--text-meta) font-semibold", tierFgClass[tier])}>
            {copy.tiers[tier].label}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <IconButton aria-label={copy.itemDetail.prev} size="sm" disabled={!onPrev} onClick={onPrev}>
            <ChevronLeft aria-hidden />
          </IconButton>
          <IconButton aria-label={copy.itemDetail.next} size="sm" disabled={!onNext} onClick={onNext}>
            <ChevronRight aria-hidden />
          </IconButton>
          {onClose && (
            <IconButton aria-label={copy.itemDetail.close} size="sm" onClick={onClose} className="ml-1">
              <X aria-hidden />
            </IconButton>
          )}
        </div>
      </div>

      <div className="p-4 xl:flex xl:flex-row xl:items-start xl:gap-8">
        <div className="min-w-0 flex-1">
          <h1
            data-testid="item-detail-title"
            className="text-(length:--text-hero) leading-(length:--leading-hero) font-semibold text-(--text-1)"
          >
            {item.title}
          </h1>
          <p className="mt-2 text-(length:--text-body) text-(--text-2)">{item.cause}</p>

          {item.source !== "fyi" && (
            <div className="mt-5 rounded-(--radius-control) border border-(--border-1) bg-(--surface-2) p-4">
              <WhyFactors ranked={ranked} nextRanked={nextRanked} now={now} />
            </div>
          )}

          <div className="mt-5 flex items-center gap-3 rounded-(--radius-control) border border-(--border-1) p-3">
            <button
              type="button"
              disabled={!canAct || done}
              onClick={onMarkDone}
              aria-label={done ? undefined : copy.actions.done}
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                done ? "border-(--success-fg) bg-(--success-fg) text-(--success-bg)" : "border-(--border-2)",
                canAct && !done && "hover:border-(--accent)",
                (!canAct || done) && "pointer-events-none",
              )}
            >
              {done && (
                // M1 "check path draws (180ms)" — its natural home is here, the one
                // place a completed item's checkmark actually stays on screen (the
                // hero's own item disappears the moment it's done).
                <motion.svg
                  viewBox="0 0 16 16"
                  className="size-(--size-icon-sm)"
                  aria-hidden
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M3.5 8.5 L6.5 11.5 L12.5 4.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.18, ease: transition.base.ease }}
                  />
                </motion.svg>
              )}
            </button>
            <span className={cn("text-(length:--text-body) text-(--text-1)", done && "text-(--text-2) line-through")}>
              {t(copy.hero.nextStep, { action: item.primaryAction })}
            </span>
          </div>

          <div className="mt-5">
            <p className="text-(length:--text-meta) font-semibold tracking-wide text-(--text-2) uppercase">
              {copy.itemDetail.activity}
            </p>
            <ul className="mt-2 flex flex-col gap-1.5">
              <li className="text-(length:--text-meta) text-(--text-2)">
                {t(copy.drawer.activityCreated, {
                  hhmm: formatClock(new Date(item.createdAt)),
                  source: copy.sourcePhrases[item.source],
                })}
              </li>
              {startedAt && assignee && (
                <li className="text-(length:--text-meta) text-(--text-2)">
                  {t(copy.drawer.activityStarted, { name: assignee.name.split(" ")[0], hhmm: formatClock(new Date(startedAt)) })}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-6 w-full shrink-0 xl:mt-0 xl:w-64">
          <div className="rounded-(--radius-control) border border-(--border-1) p-3">
            <PropertyRow label={copy.drawer.source} value={copy.sourceLabels[item.source]} />
            <PropertyRow label={copy.drawer.status} value={copy.statusLabels[item.status]} />
            {item.dueAt && <PropertyRow label={copy.drawer.due} value={timePillText(item.dueAt, now)} />}
            {cutoff && (
              <PropertyRow
                label={copy.drawer.truck}
                value={t(copy.truckClock.leavesAt, { carrier: cutoff.carrier, door: cutoff.door, hhmm: formatClock(new Date(cutoff.departsAt)) })}
              />
            )}
            <PropertyRow label={copy.drawer.ordersWaiting} value={item.ordersBlocked} />
            <PropertyRow label={copy.drawer.unitsAffected} value={item.unitsAffected} />
            <PropertyRow label={copy.drawer.assignedTo} value={assignee?.name ?? copy.drawer.noOwner} />
          </div>
        </div>
      </div>

      {canAct && !done && (
        <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 border-t border-(--border-1) bg-(--surface-1) p-4">
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
              onSend={(reason, note) => onAskHelp?.(reason, note)}
            />
          )}
          <ItemOverflowPopover
            tier={tier === "fyi" ? "later" : tier}
            now={now}
            nextCutoffAt={nextCutoffAt}
            onWaiting={(who, checkBackAt) => onWaiting?.(who, checkBackAt)}
            onMoveLater={(snoozeUntil) => onMoveLater?.(snoozeUntil)}
            onNotMine={() => onNotMine?.()}
            trigger={
              <IconButton size="lg" aria-label={copy.actions.more}>
                <MoreHorizontal aria-hidden />
              </IconButton>
            }
          />
        </div>
      )}
    </div>
  );
}
