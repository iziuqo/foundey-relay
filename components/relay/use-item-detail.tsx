"use client";

import { useStore } from "@/state/store";
import { SEED_NOW_ISO } from "@/state/clock";
import { useNow } from "@/lib/time";
import { effectiveItems, flattenedQueue, nextCutoff, queueFor } from "@/lib/selectors";
import { scoreItem } from "@/lib/priority";
import type { Item, Person } from "@/lib/types";
import type { Ranked } from "@/lib/priority";

export interface ItemDetailData {
  item: Item | null;
  assignee: Person | undefined;
  now: Date;
  nextCutoffAt: string | null;
  ranked: Ranked | null;
  nextRanked: Ranked | null;
  canAct: boolean;
  prevId: string | null;
  nextId: string | null;
  start: () => void;
  markDone: () => void;
  askHelp: (reason: string, note: string) => void;
  waiting: (waitingOn: string, checkBackAt: string) => void;
  moveLater: (snoozeUntil: string) => void;
  notMine: () => void;
}

/**
 * Everything `/items/[id]` (the full page) and its intercepting-route sheet need,
 * factored out so the two shells share one source of truth instead of drifting. Both
 * are thin chrome around `ItemDetail` (components/relay/item-detail.tsx).
 */
export function useItemDetail(id: string): ItemDetailData {
  const persona = useStore((s) => s.persona);
  const items = useStore((s) => s.items);
  const team = useStore((s) => s.team);
  const jumpOffsetMs = useStore((s) => s.jumpOffsetMs);
  const storeStart = useStore((s) => s.start);
  const storeMarkDone = useStore((s) => s.markDone);
  const storeAskHelp = useStore((s) => s.askHelp);
  const storeWaiting = useStore((s) => s.waiting);
  const storeMoveLater = useStore((s) => s.moveLater);
  const storeNotMine = useStore((s) => s.notMine);

  const now = useNow(SEED_NOW_ISO, jumpOffsetMs);
  const person = team.find((p) => p.id === persona) ?? team[0];
  const raw = items.find((i) => i.id === id) ?? null;
  const item = raw ? effectiveItems([raw], now)[0] : null;
  const assignee = item ? team.find((p) => p.id === item.assigneeId) : undefined;

  const queue = queueFor(items, person.id, now);
  const flat = flattenedQueue(queue);
  const nextCutoffAt = nextCutoff(now)?.departsAt ?? null;

  const index = item ? flat.findIndex((r) => r.item.id === item.id) : -1;
  const nextRanked = index >= 0 ? (flat[index + 1] ?? null) : null;
  const prevId = index > 0 ? flat[index - 1].item.id : null;
  const nextId = index >= 0 && index < flat.length - 1 ? flat[index + 1].item.id : null;

  const ranked: Ranked | null = item ? { item, result: scoreItem(item, now) } : null;
  const canAct = item !== null && item.assigneeId === person.id;

  return {
    item,
    assignee,
    now,
    nextCutoffAt,
    ranked,
    nextRanked,
    canAct,
    prevId,
    nextId,
    start: () => item && storeStart(item.id, person.id, now.toISOString()),
    markDone: () => item && storeMarkDone(item.id, now.toISOString()),
    askHelp: () => item && storeAskHelp(item.id),
    waiting: (waitingOn, checkBackAt) => item && storeWaiting(item.id, waitingOn, checkBackAt),
    moveLater: (snoozeUntil) => item && storeMoveLater(item.id, snoozeUntil),
    notMine: () => item && storeNotMine(item.id),
  };
}
