"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal, X } from "lucide-react";
import { motion } from "motion/react";
import { copy, t } from "@/lib/copy";
import { stagger, stepDelay, transition } from "@/lib/motion";
import { formatClock } from "@/lib/time";
import { site } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import type { AssignCandidate } from "@/lib/selectors";
import type { Ranked } from "@/lib/priority";
import type { Item, Person } from "@/lib/types";
import { TierIcon } from "./tier-icon";
import { timePillText } from "./time-pill";
import { WhyFactors } from "./why-factors";
import { HelpPopover } from "./help-popover";
import { ItemOverflowPopover } from "./item-overflow-popover";
import { AssignPopover } from "./assign-popover";
import { PersonAvatar } from "./person-avatar";
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
  /** §7.3 "People, reassign": a manager viewing a teammate's item can hand it to
   * someone else. A worker viewing their own item gets "Not mine" instead (in the
   * overflow), never this. */
  canReassign?: boolean;
  reassignCandidates?: AssignCandidate[];
  onReassign?: (toPersonId: string) => void;
  /** Only `/items/[id]`, the direct-navigation full page, sits inside `<main>` beside
   * the persistent `BottomDock` — the sheet and the Vaul drawer both already cover it
   * (z-50 over z-40), so their own "bottom-0" is correctly the panel's own edge, not
   * the dock's. The full page is the one case where the sticky footer needs to stop
   * short of the dock instead of stacking on top of it (craft check 10). */
  reserveDock?: boolean;
}

function PropertyRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    // o01 (Origin detail panel): the label is the smaller step, the value carries the
    // weight — a hairline-split stat pair, not a table row of matching text.
    <div className="flex items-baseline justify-between gap-3 border-b border-(--border-1) py-2 last:border-0">
      <span className="t-meta text-(--text-2)">{label}</span>
      <span className="tnum t-body font-semibold text-(--text-1)">{value}</span>
    </div>
  );
}

/**
 * §6.2 item detail: tier meta, title, why (inline factor bars, not a popover), the
 * next step as a checklist line, source & history, people & reassign, and the full
 * item copy un-truncated. Shared by the full page (`/items/[id]`) and the
 * intercepting-route sheet, which differ only in their chrome around this.
 */
/**
 * M11: the sheet's inner sections arrive 28ms apart, four at most — the sheet itself is
 * the move, and this is the beat that tells the eye the panel has *contents* rather than
 * being one slab that appeared. Capped at four because the fifth is past the fold at
 * every width this sheet renders at, so it would be staggering something nobody is
 * looking at while they read the title.
 *
 * Fade and 6px only, never height: the sections are stacked, so animating any of their
 * boxes would move every section under them for the whole stagger.
 */
function SheetSection({ index, className, children }: { index: number; className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition.base, delay: stepDelay(index, stagger.sections) }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
  canReassign = false,
  reassignCandidates = [],
  onReassign,
  reserveDock = false,
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
              className="flex items-center gap-1 rounded-(--radius-control) py-1 pr-2 t-meta text-(--text-2) hover:text-(--text-1) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus)"
            >
              <ChevronLeft className="size-(--size-icon-sm)" aria-hidden />
              {copy.itemDetail.backToWork}
            </Link>
          )}
          {/* Shape carries the tier, the label carries the hue (§4.5 / LOG M4): the
              icon stays neutral so it never becomes a second, redundant saturated
              object beside the label right next to it. */}
          <TierIcon tier={tier} safety={item.safety} className="shrink-0 text-(--text-2)" />
          <span className={cn("truncate t-meta font-semibold", tierFgClass[tier])}>{copy.tiers[tier].label}</span>
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

      <div className="p-4">
        <SheetSection index={0}>
          <h1 data-testid="item-detail-title" className="t-hero text-(--text-1)">
            {item.title}
          </h1>
          <p className="mt-2 t-body text-(--text-2)">{item.cause}</p>
        </SheetSection>

        {item.source !== "fyi" && (
          <SheetSection index={1} className="mt-5 rounded-(--radius-control) border border-(--border-1) bg-(--surface-2) p-4">
            <WhyFactors ranked={ranked} nextRanked={nextRanked} now={now} />
          </SheetSection>
        )}

        <div className="mt-5 flex items-center gap-3 rounded-(--radius-control) border border-(--border-1) p-3">
          <button
            type="button"
            disabled={!canAct || done}
            onClick={onMarkDone}
            aria-label={done ? undefined : copy.actions.done}
            className={cn(
              "tap-48 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
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
                  transition={transition.base}
                />
              </motion.svg>
            )}
          </button>
          <span className={cn("t-body text-(--text-1)", done && "text-(--text-2) line-through")}>
            {t(copy.hero.nextStep, { action: item.primaryAction })}
          </span>
        </div>

        <SheetSection index={2} className="mt-6">
          <p className="t-eyebrow text-(--text-2)">{copy.itemDetail.sourceHistory}</p>
          {/* At the sheet's widest step (34rem / 1440) there's room for the properties
              and the activity log side by side (§5.7's "2 cols"); every narrower step
              stacks them, which is also what the full page does below 1440. */}
          <div className="mt-2 grid grid-cols-1 gap-x-8 min-[90rem]:grid-cols-2">
            <div className="rounded-(--radius-control) border border-(--border-1) px-3">
              <PropertyRow label={copy.drawer.source} value={copy.sourceLabels[item.source]} />
              <PropertyRow label={copy.drawer.status} value={copy.statusLabels[item.status]} />
              {item.dueAt && <PropertyRow label={copy.drawer.due} value={timePillText(item.dueAt, now)} />}
              {cutoff && (
                <PropertyRow
                  label={copy.drawer.truck}
                  value={t(copy.truckClock.leavesAt, {
                    carrier: cutoff.carrier,
                    door: cutoff.door,
                    hhmm: formatClock(new Date(cutoff.departsAt)),
                  })}
                />
              )}
              <PropertyRow label={copy.drawer.ordersWaiting} value={item.ordersBlocked} />
              <PropertyRow label={copy.drawer.unitsAffected} value={item.unitsAffected} />
            </div>
            <ul className="mt-3 flex flex-col gap-1.5 min-[90rem]:mt-0">
              <li className="t-meta text-(--text-2)">
                {t(copy.drawer.activityCreated, {
                  hhmm: formatClock(new Date(item.createdAt)),
                  source: copy.sourcePhrases[item.source],
                })}
              </li>
              {startedAt && assignee && (
                <li className="t-meta text-(--text-2)">
                  {t(copy.drawer.activityStarted, { name: assignee.name.split(" ")[0], hhmm: formatClock(new Date(startedAt)) })}
                </li>
              )}
              {item.helpAsked && (
                <li className="t-meta text-(--text-2)">
                  {copy.help.chip}
                  {item.helpReason ? ` · ${item.helpReason}` : ""}
                </li>
              )}
            </ul>
          </div>
        </SheetSection>

        <SheetSection index={3} className="mt-6">
          <p className="t-eyebrow text-(--text-2)">{copy.itemDetail.people}</p>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-(--radius-control) border border-(--border-1) p-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <PersonAvatar initials={assignee?.initials ?? "—"} />
              <span className="min-w-0">
                <span className="block truncate t-body font-medium text-(--text-1)">
                  {assignee?.name ?? copy.itemDetail.unassigned}
                </span>
                {assignee && <span className="block truncate t-meta text-(--text-2)">{assignee.role}</span>}
              </span>
            </div>
            {canReassign && (
              <AssignPopover
                candidates={reassignCandidates}
                onAssign={(toPersonId) => onReassign?.(toPersonId)}
                trigger={
                  <Button size="sm" variant="secondary" className="shrink-0">
                    {copy.actions.reassign}
                  </Button>
                }
              />
            )}
          </div>
        </SheetSection>
      </div>

      {canAct && !done && (
        <div
          className={cn(
            "sticky z-10 flex flex-wrap items-center gap-2 border-t border-(--border-1) bg-(--surface-1) p-4",
            reserveDock ? "bottom-(--h-dock) lg:bottom-0" : "bottom-0",
          )}
        >
          <Button size="lg" onClick={inProgress ? onMarkDone : onStart}>
            {inProgress ? copy.actions.done : item.primaryAction}
          </Button>
          {item.helpAsked ? (
            <span className="inline-flex h-(--size-control-lg) items-center rounded-(--radius-control) border border-(--border-1) px-4 t-meta text-(--text-2)">
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
