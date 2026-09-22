import type { Item, Person, Tier } from "./types";

export interface ScoreResult {
  score: number | null;
  tier: Tier;
  T: number;
  B: number;
  I: number;
  minutesLeft: number | null;
}

export function minutesLeft(dueAt: string | null, now: Date): number | null {
  if (!dueAt) return null;
  return Math.round((new Date(dueAt).getTime() - now.getTime()) / 60000);
}

function timeScore(ml: number | null): number {
  if (ml === null) return 0;
  if (ml < 0) return 40;
  if (ml <= 30) return 36;
  if (ml <= 60) return 30;
  if (ml <= 120) return 22;
  if (ml <= 240) return 14;
  return 8;
}

function blockedScore(n: number): number {
  if (n <= 0) return 0;
  if (n < 10) return 6;
  if (n < 50) return 14;
  if (n < 200) return 22;
  return 30;
}

function impactScore(item: Item): number {
  let i = 0;
  if (item.customerImpact === "high") i += 10;
  else if (item.customerImpact === "low") i += 4;
  if (item.compliance) i += 15;
  if (item.escalated) i += 12;
  if (item.safety) i += 50;
  return i;
}

/** The single source of truth for score and tier. §4.2. */
export function scoreItem(item: Item, now: Date): ScoreResult {
  if (item.source === "fyi") {
    return { score: null, tier: "fyi", T: 0, B: 0, I: 0, minutesLeft: null };
  }
  const ml = minutesLeft(item.dueAt, now);
  const T = timeScore(ml);
  const B = blockedScore(item.ordersBlocked);
  const I = impactScore(item);
  const score = Math.min(100, T + B + I);
  const tier: Tier =
    item.safety || score >= 60 ? "now" : score >= 30 ? "next" : "later";
  return { score, tier, T, B, I, minutesLeft: ml };
}

export interface Ranked {
  item: Item;
  result: ScoreResult;
}

/** score desc, dueAt asc, ordersBlocked desc, createdAt asc, id asc. */
export function compareRanked(a: Ranked, b: Ranked): number {
  const sa = a.result.score ?? -Infinity;
  const sb = b.result.score ?? -Infinity;
  if (sa !== sb) return sb - sa;

  const da = a.item.dueAt ? new Date(a.item.dueAt).getTime() : Infinity;
  const db = b.item.dueAt ? new Date(b.item.dueAt).getTime() : Infinity;
  if (da !== db) return da - db;

  if (a.item.ordersBlocked !== b.item.ordersBlocked)
    return b.item.ordersBlocked - a.item.ordersBlocked;

  const ca = new Date(a.item.createdAt).getTime();
  const cb = new Date(b.item.createdAt).getTime();
  if (ca !== cb) return ca - cb;

  return a.item.id.localeCompare(b.item.id);
}

export function rankItems(items: Item[], now: Date): Ranked[] {
  return items
    .filter((item) => item.source !== "fyi")
    .map((item) => ({ item, result: scoreItem(item, now) }))
    .sort(compareRanked);
}

export interface LoadResult {
  points: number;
  label: "light" | "busy" | "full";
}

/** §4.4. */
export function loadFor(doNowCount: number, upNextCount: number): LoadResult {
  const points = 3 * doNowCount + 1 * upNextCount;
  const label: LoadResult["label"] =
    points >= 12 || doNowCount >= 4 ? "full" : points >= 6 ? "busy" : "light";
  return { points, label };
}

/**
 * §4.5 / §8.6. Item based, never person based. `helpAsked` flags the item for the
 * manager regardless of its age — asking for help is itself the signal, so it does not
 * wait on the 45 minute idle clause below.
 */
export function mayNeedHelp(
  item: Item,
  assignee: Person | undefined,
  now: Date,
): boolean {
  if (item.helpAsked) return true;
  if ((item.notMineCount ?? 0) >= 2) return true;
  if (
    item.status === "in_progress" &&
    assignee?.currentTaskId === item.id &&
    assignee.currentTaskStartedAt
  ) {
    const started = new Date(assignee.currentTaskStartedAt).getTime();
    return (now.getTime() - started) / 60000 >= 45;
  }
  return false;
}

/** §6.6. "From Danielle: {first 3 words of the original}", 6 words or fewer. */
export function reassignedCause(
  originalCause: string,
  managerFirstName: string,
): string {
  const words = originalCause.trim().split(/\s+/).slice(0, 3).join(" ");
  return `From ${managerFirstName}: ${words}`;
}
