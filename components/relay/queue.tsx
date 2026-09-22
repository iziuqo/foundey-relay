"use client";

import { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { copy, t } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { formatClock } from "@/lib/time";
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
  now: Date;
  nowGroup: Ranked[];
  nextGroup: Ranked[];
  laterGroup: Ranked[];
  waiting: Item[];
  snoozed: Item[];
  done: DoneEntry[];
  nextCutoffAt: string | null;
}

function TierGroup({
  tier,
  label,
  rows,
  now,
  nextCutoffAt,
  actions,
}: {
  tier: "now" | "next" | "later";
  label: string;
  rows: Ranked[];
  now: Date;
  nextCutoffAt: string | null;
  actions: QueueActions;
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <div className="flex h-9 items-center gap-2 border-b border-(--border-1) bg-(--surface-2) px-3">
        <TierIcon tier={tier} className={cn("size-(--size-icon-sm)", tierFgClass[tier])} />
        <span className={cn("text-(length:--text-meta) font-semibold", tierFgClass[tier])}>{label}</span>
        <span className="tnum text-(length:--text-meta) text-(--text-2)">{rows.length}</span>
      </div>
      <ul>
        {rows.map((ranked) => (
          <QueueRow
            key={ranked.item.id}
            ranked={ranked}
            now={now}
            nextCutoffAt={nextCutoffAt}
            onStart={() => actions.onStart(ranked.item.id)}
            onMarkDone={() => actions.onMarkDone(ranked.item.id)}
            onWaiting={(who, checkBackAt) => actions.onWaiting(ranked.item.id, who, checkBackAt)}
            onMoveLater={(snoozeUntil) => actions.onMoveLater(ranked.item.id, snoozeUntil)}
            onNotMine={() => actions.onNotMine(ranked.item.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function CollapsibleSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger className="flex h-9 w-full items-center gap-2 border-b border-(--border-1) bg-(--surface-2) px-3 text-left">
        <ChevronDown
          aria-hidden
          className={cn("size-(--size-icon-sm) text-(--text-2) transition-transform duration-[160ms]", open && "rotate-180")}
        />
        <span className="text-(length:--text-meta) font-semibold text-(--text-1)">{label}</span>
      </Collapsible.Trigger>
      <Collapsible.Content>{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}

function WaitingRow({ item }: { item: Item }) {
  return (
    <li className="flex min-h-(--size-row-min-handheld) items-center gap-3 border-b border-(--border-1) px-3 last:border-0 lg:min-h-(--size-row-min)">
      <span className="min-w-0 flex-1 truncate text-(length:--text-row) text-(--text-1)">{item.title}</span>
      <span className="text-(length:--text-meta) whitespace-nowrap text-(--text-2)">
        {item.waitingOn}
        {item.checkBackAt ? ` · back ${formatClock(new Date(item.checkBackAt))}` : ""}
      </span>
    </li>
  );
}

function SnoozedRow({ item }: { item: Item }) {
  return (
    <li className="flex min-h-(--size-row-min-handheld) items-center gap-3 border-b border-(--border-1) px-3 last:border-0 lg:min-h-(--size-row-min)">
      <span className="min-w-0 flex-1 truncate text-(length:--text-row) text-(--text-1)">{item.title}</span>
      <span className="tnum text-(length:--text-meta) whitespace-nowrap text-(--text-2)">
        {item.snoozeUntil ? formatClock(new Date(item.snoozeUntil)) : ""}
      </span>
    </li>
  );
}

function DoneRow({ entry }: { entry: DoneEntry }) {
  return (
    <li className="flex min-h-(--size-row-min-handheld) items-center gap-3 border-b border-(--border-1) px-3 last:border-0 lg:min-h-(--size-row-min)">
      <span className="min-w-0 flex-1 truncate text-(length:--text-row) text-(--text-2) line-through decoration-(--border-2)">
        {entry.title}
      </span>
      <span className="tnum text-(length:--text-meta) whitespace-nowrap text-(--text-2)">{formatClock(new Date(entry.doneAt))}</span>
    </li>
  );
}

/** §6.1 queue: tier groups with a header band and count, then Waiting / Moved to later
 * / Done today as collapsible groups at the bottom (Radix Collapsible, not `<details>`). */
export function Queue({
  now,
  nowGroup,
  nextGroup,
  laterGroup,
  waiting,
  snoozed,
  done,
  nextCutoffAt,
  onStart,
  onMarkDone,
  onWaiting,
  onMoveLater,
  onNotMine,
}: QueueProps) {
  const actions: QueueActions = { onStart, onMarkDone, onWaiting, onMoveLater, onNotMine };
  return (
    <div className="overflow-hidden rounded-(--radius-control) border border-(--border-1)">
      <TierGroup tier="now" label={copy.tiers.now.label} rows={nowGroup} now={now} nextCutoffAt={nextCutoffAt} actions={actions} />
      <TierGroup tier="next" label={copy.tiers.next.label} rows={nextGroup} now={now} nextCutoffAt={nextCutoffAt} actions={actions} />
      <TierGroup tier="later" label={copy.tiers.later.label} rows={laterGroup} now={now} nextCutoffAt={nextCutoffAt} actions={actions} />

      {waiting.length > 0 && (
        <CollapsibleSection label={t(copy.tiers.waitingGroup, { n: waiting.length })}>
          <ul>
            {waiting.map((item) => (
              <WaitingRow key={item.id} item={item} />
            ))}
          </ul>
        </CollapsibleSection>
      )}
      {snoozed.length > 0 && (
        <CollapsibleSection label={t(copy.tiers.laterGroup, { n: snoozed.length })}>
          <ul>
            {snoozed.map((item) => (
              <SnoozedRow key={item.id} item={item} />
            ))}
          </ul>
        </CollapsibleSection>
      )}
      {done.length > 0 && (
        <CollapsibleSection label={t(copy.tiers.done.withCount, { n: done.length })}>
          <ul>
            {done.map((entry) => (
              <DoneRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </CollapsibleSection>
      )}
    </div>
  );
}
