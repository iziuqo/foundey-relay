import type { Item, Person, DoneEntry, Status } from "../lib/types";
import { reassignedCause } from "../lib/priority";

/**
 * The demo's domain state: items, the team, and today's done log. Everything else
 * (toast text, undo snapshots, pending promotions, the sim clock) is UI/session state
 * that `state/store.ts` layers on top — kept out of here so these transitions stay pure
 * and unit-testable without a store, per the plan's §8.4 "ported as pure functions" rule.
 */
export interface Snapshot {
  items: Item[];
  team: Person[];
  doneLog: DoneEntry[];
}

export function cloneSnapshot(snapshot: Snapshot): Snapshot {
  return structuredClone(snapshot);
}

function firstName(person: Person | undefined): string {
  return person ? person.name.split(" ")[0] : "a teammate";
}

export interface StartResult {
  snapshot: Snapshot;
  /** Title of the item that got paused to make room, if any. */
  pausedTitle: string | null;
}

/** Starts `itemId` for `actorId`, pausing whatever that person was already working on. */
export function start(
  snapshot: Snapshot,
  itemId: string,
  actorId: string,
  nowIso: string,
): StartResult {
  const actor = snapshot.team.find((p) => p.id === actorId);
  const previousTaskId = actor?.currentTaskId ?? null;
  let items = snapshot.items;
  let pausedTitle: string | null = null;

  if (previousTaskId && previousTaskId !== itemId) {
    const paused = snapshot.items.find((i) => i.id === previousTaskId);
    if (paused && paused.status === "in_progress") pausedTitle = paused.title;
    items = items.map((i) =>
      i.id === previousTaskId ? { ...i, status: "open" as Status } : i,
    );
  }
  items = items.map((i) =>
    i.id === itemId ? { ...i, status: "in_progress" as Status } : i,
  );
  const team = snapshot.team.map((p) =>
    p.id === actorId
      ? { ...p, currentTaskId: itemId, currentTaskStartedAt: nowIso }
      : p,
  );

  return { snapshot: { ...snapshot, items, team }, pausedTitle };
}

/** Marks `itemId` done, frees up its assignee, and appends to the done log. */
export function markDone(
  snapshot: Snapshot,
  itemId: string,
  nowIso: string,
): Snapshot {
  const item = snapshot.items.find((i) => i.id === itemId);
  if (!item) return snapshot;
  const items = snapshot.items.map((i) =>
    i.id === itemId ? { ...i, status: "done" as Status } : i,
  );
  const team = snapshot.team.map((p) =>
    p.currentTaskId === itemId
      ? { ...p, currentTaskId: null, currentTaskStartedAt: null }
      : p,
  );
  const doneLog: DoneEntry[] = [
    ...snapshot.doneLog,
    {
      id: `dn-session-${itemId}`,
      assigneeId: item.assigneeId ?? "",
      title: item.title,
      doneAt: nowIso,
    },
  ];
  return { ...snapshot, items, team, doneLog };
}

/** §8.6: flags the item for the manager, whatever its age. */
export function askHelp(snapshot: Snapshot, itemId: string): Snapshot {
  const items = snapshot.items.map((i) =>
    i.id === itemId ? { ...i, helpAsked: true } : i,
  );
  return { ...snapshot, items };
}

export function waiting(
  snapshot: Snapshot,
  itemId: string,
  waitingOn: string,
  checkBackAt: string,
): Snapshot {
  const items = snapshot.items.map((i) =>
    i.id === itemId
      ? { ...i, status: "waiting" as Status, waitingOn, checkBackAt }
      : i,
  );
  return { ...snapshot, items };
}

export function notMine(snapshot: Snapshot, itemId: string): Snapshot {
  const items = snapshot.items.map((i) =>
    i.id === itemId
      ? {
          ...i,
          assigneeId: null,
          notMineCount: (i.notMineCount ?? 0) + 1,
          status: "open" as Status,
        }
      : i,
  );
  const team = snapshot.team.map((p) =>
    p.currentTaskId === itemId
      ? { ...p, currentTaskId: null, currentTaskStartedAt: null }
      : p,
  );
  return { ...snapshot, items, team };
}

export interface ReassignResult {
  snapshot: Snapshot;
  recipientFirstName: string;
}

export function reassign(
  snapshot: Snapshot,
  itemId: string,
  toPersonId: string,
  actorId: string,
): ReassignResult {
  const item = snapshot.items.find((i) => i.id === itemId);
  const actor = snapshot.team.find((p) => p.id === actorId);
  const recipient = snapshot.team.find((p) => p.id === toPersonId);
  if (!item) return { snapshot, recipientFirstName: firstName(recipient) };

  const items = snapshot.items.map((i) =>
    i.id === itemId
      ? {
          ...i,
          assigneeId: toPersonId,
          escalated: true,
          cause: reassignedCause(i.cause, firstName(actor)),
          status: i.status === "in_progress" ? ("open" as Status) : i.status,
        }
      : i,
  );
  const team = snapshot.team.map((p) =>
    p.currentTaskId === itemId
      ? { ...p, currentTaskId: null, currentTaskStartedAt: null }
      : p,
  );
  return {
    snapshot: { ...snapshot, items, team },
    recipientFirstName: firstName(recipient),
  };
}

export function moveLater(
  snapshot: Snapshot,
  itemId: string,
  snoozeUntil: string,
): Snapshot {
  const items = snapshot.items.map((i) =>
    i.id === itemId ? { ...i, status: "snoozed" as Status, snoozeUntil } : i,
  );
  return { ...snapshot, items };
}

/** Adds a newly arrived item, unless it's already present (idempotent for replays). */
export function inject(snapshot: Snapshot, item: Item): Snapshot {
  if (snapshot.items.some((i) => i.id === item.id)) return snapshot;
  return { ...snapshot, items: [...snapshot.items, item] };
}
