"use client";

import { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { copy, t } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { formatClock } from "@/lib/time";
import { SectionBand } from "@/components/ui/section-band";
import { FOCUS } from "@/components/ui/sizing";
import type { Ranked } from "@/lib/priority";
import type { Item, DoneEntry } from "@/lib/types";
import { TierIcon } from "./tier-icon";
import { QueueRow } from "./queue-row";
import { tierFgClass } from "./tier-tokens";

export interface QueueActions {
  onStart: (itemId: string) => void;
  onMarkDone: (itemId: string) => void;
  onWaiting: (itemId: string, waitingOn: string, checkBackAt: string) => void;
  onMoveLater: (itemId: string, snoozeUntil: string) => void;
  onNotMine: (itemId: string) => void;
}

export interface QueueProps extends QueueActions {
  className?: string;
  now: Date;
  nowGroup: Ranked[];
  nextGroup: Ranked[];
  laterGroup: Ranked[];
  waiting: Item[];
  snoozed: Item[];
  done: DoneEntry[];
  nextCutoffAt: string | null;
  /** The one row next in line for the hero slot (M1's shared-element source). */
  nextHeroId?: string | null;
  /** The row an external reorder just promoted into place (M5's tint wash). */
  justPromotedId?: string | null;
}

function TierGroup({
  tier,
  label,
  rows,
  now,
  nextCutoffAt,
  nextHeroId,
  justPromotedId,
  actions,
}: {
  tier: "now" | "next" | "later";
  label: string;
  rows: Ranked[];
  now: Date;
  nextCutoffAt: string | null;
  nextHeroId?: string | null;
  justPromotedId?: string | null;
  actions: QueueActions;
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      {/* The band is neutral and the hue lives in the icon and the label — `z01`'s
          structure with the colour moved off the band, so it never competes with the
          rows beneath it (advisor §7.2). */}
      <SectionBand
        data-tier={tier}
        icon={<TierIcon tier={tier} className="size-(--icon-sm) text-(--text-2)" />}
        label={
          <span data-tier-label className={tierFgClass[tier]}>
            {label}
          </span>
        }
        count={<NumberFlow value={rows.length} />}
      />
      <ul>
        <AnimatePresence initial={false}>
          {rows.map((ranked) => (
            <QueueRow
              key={ranked.item.id}
              ranked={ranked}
              now={now}
              nextCutoffAt={nextCutoffAt}
              willBecomeHero={ranked.item.id === nextHeroId}
              justPromoted={ranked.item.id === justPromotedId}
              onStart={() => actions.onStart(ranked.item.id)}
              onMarkDone={() => actions.onMarkDone(ranked.item.id)}
              onWaiting={(who, checkBackAt) => actions.onWaiting(ranked.item.id, who, checkBackAt)}
              onMoveLater={(snoozeUntil) => actions.onMoveLater(ranked.item.id, snoozeUntil)}
              onNotMine={() => actions.onNotMine(ranked.item.id)}
            />
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function CollapsibleSection({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger
        className={cn(
          "flex h-(--h-band) w-full items-center gap-2 bg-(--surface-2) px-3 text-left shadow-[inset_0_-1px_0_var(--line-1)] max-md:h-12",
          FOCUS,
        )}
      >
        <ChevronDown
          aria-hidden
          className={cn(
            "size-(--icon-sm) text-(--text-2) transition-transform duration-(--dur-quick) ease-(--ease-out)",
            open && "rotate-180",
          )}
        />
        <span className="t-meta font-semibold text-(--text-1)">{label}</span>
      </Collapsible.Trigger>
      <Collapsible.Content>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}

/** The settled groups at the foot of the queue share the row's geometry exactly, so
 *  opening one cannot introduce a second row height into the list. */
function QuietRow({ title, meta, struck }: { title: string; meta: string; struck?: boolean }) {
  return (
    <li data-craft-row className="queue-row">
      <span aria-hidden />
      <span className="flex min-w-0 flex-col justify-center gap-0.5">
        <span className={cn("t-row truncate", struck ? "text-(--text-2) line-through decoration-(--line-2)" : "text-(--text-1)")}>
          {title}
        </span>
        {/* Below 768 the meta track is gone, so the meta becomes the row's second line
            — the same shape the ranked rows take there. */}
        <span className="tnum t-body hidden truncate text-(--text-2) max-md:block">{meta}</span>
      </span>
      <span aria-hidden className="max-md:hidden" />
      <span className="tnum t-meta justify-self-end whitespace-nowrap text-(--text-2) max-md:hidden">{meta}</span>
    </li>
  );
}

/**
 * The queue: three tier groups, then the settled work.
 *
 * **Grouped rows, not a table and not cards** (advisor §7.2). A table implies
 * column-wise comparison and this worker never compares columns — they read down a
 * ranked list and stop at the first thing. Cards cost roughly twice the vertical space
 * and destroy the left alignment that makes a ranked list scannable in one pass.
 *
 * Exactly three groups render here. "For your info" is not one of them: it needs no
 * action, so it lives in Updates and, three lines of it, in the rail.
 */
export function Queue({
  className,
  now,
  nowGroup,
  nextGroup,
  laterGroup,
  waiting,
  snoozed,
  done,
  nextCutoffAt,
  nextHeroId,
  justPromotedId,
  onStart,
  onMarkDone,
  onWaiting,
  onMoveLater,
  onNotMine,
}: QueueProps) {
  const actions: QueueActions = { onStart, onMarkDone, onWaiting, onMoveLater, onNotMine };
  const groups = [
    { tier: "now", label: copy.tiers.now.label, rows: nowGroup },
    { tier: "next", label: copy.tiers.next.label, rows: nextGroup },
    { tier: "later", label: copy.tiers.later.label, rows: laterGroup },
  ] as const;

  return (
    <div
      data-craft-list
      data-testid="queue"
      className={cn("overflow-hidden rounded-(--r-4) border border-(--line-1) bg-(--surface-1)", className)}
    >
      {groups.map((group) => (
        <TierGroup
          key={group.tier}
          tier={group.tier}
          label={group.label}
          rows={group.rows}
          now={now}
          nextCutoffAt={nextCutoffAt}
          nextHeroId={nextHeroId}
          justPromotedId={justPromotedId}
          actions={actions}
        />
      ))}

      {waiting.length > 0 && (
        <CollapsibleSection label={t(copy.tiers.waitingGroup, { n: waiting.length })}>
          <ul>
            {waiting.map((item) => (
              <QuietRow
                key={item.id}
                title={item.title}
                meta={`${item.waitingOn}${item.checkBackAt ? ` · back ${formatClock(new Date(item.checkBackAt))}` : ""}`}
              />
            ))}
          </ul>
        </CollapsibleSection>
      )}
      {snoozed.length > 0 && (
        <CollapsibleSection label={t(copy.tiers.laterGroup, { n: snoozed.length })}>
          <ul>
            {snoozed.map((item) => (
              <QuietRow
                key={item.id}
                title={item.title}
                meta={item.snoozeUntil ? formatClock(new Date(item.snoozeUntil)) : ""}
              />
            ))}
          </ul>
        </CollapsibleSection>
      )}
      {done.length > 0 && (
        <CollapsibleSection label={t(copy.tiers.done.withCount, { n: done.length })}>
          <ul>
            {done.map((entry) => (
              <QuietRow key={entry.id} title={entry.title} meta={formatClock(new Date(entry.doneAt))} struck />
            ))}
          </ul>
        </CollapsibleSection>
      )}
    </div>
  );
}
