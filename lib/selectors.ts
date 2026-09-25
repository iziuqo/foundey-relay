import { rankItems, loadFor, mayNeedHelp, type Ranked, type LoadResult } from "./priority";
import type { Item, Person, DoneEntry, Tier, UpdateEntry } from "./types";
import { site } from "./seed";

function effectiveItem(item: Item, now: Date): Item {
  if (
    item.status === "waiting" &&
    item.checkBackAt &&
    new Date(item.checkBackAt) <= now
  ) {
    return { ...item, status: "open", cause: "Back from waiting" };
  }
  if (
    item.status === "snoozed" &&
    item.snoozeUntil &&
    new Date(item.snoozeUntil) <= now
  ) {
    return { ...item, status: "open" };
  }
  return item;
}

export function effectiveItems(items: Item[], now: Date): Item[] {
  return items.map((i) => effectiveItem(i, now));
}

export interface QueueGroups {
  hero: Ranked | null;
  now: Ranked[];
  next: Ranked[];
  later: Ranked[];
  waiting: Item[];
  snoozed: Item[];
  total: number;
}

/**
 * One person's queue: tiered, sorted, with the hero split out of its tier. §6.1, §4.2.
 *
 * `forcedHeroId`, when given, pins the hero to that item instead of the naturally top ranked one.
 * §8.4: while a higher ranked item's arrival band is showing (the user was active in the last 8s),
 * the hero does not change until they press "Show me" — the newly arrived item still ranks and
 * lists normally, it just doesn't unseat the current hero on its own.
 */
export function queueFor(
  items: Item[],
  personId: string,
  now: Date,
  forcedHeroId?: string | null,
): QueueGroups {
  const mine = effectiveItems(
    items.filter((i) => i.assigneeId === personId && i.source !== "fyi"),
    now,
  );
  const active = mine.filter(
    (i) => i.status === "open" || i.status === "in_progress",
  );
  const waiting = mine.filter((i) => i.status === "waiting");
  const snoozed = mine.filter((i) => i.status === "snoozed");
  const ranked = rankItems(active, now);

  const byTier = (tier: Tier) => ranked.filter((r) => r.result.tier === tier);
  const nowTier = byTier("now");
  const nextTier = byTier("next");
  const laterTier = byTier("later");
  const natural = nowTier[0] ?? nextTier[0] ?? laterTier[0] ?? null;
  const forced = forcedHeroId
    ? ranked.find((r) => r.item.id === forcedHeroId)
    : undefined;
  const hero = forced ?? natural;

  const withoutHero = (list: Ranked[]) =>
    hero ? list.filter((r) => r.item.id !== hero.item.id) : list;

  return {
    hero,
    now: withoutHero(nowTier),
    next: withoutHero(nextTier),
    later: withoutHero(laterTier),
    waiting,
    snoozed,
    total: ranked.length,
  };
}

/** §6.2: item detail's prev/next order — the hero first, then each tier in the order
 * the queue renders them. Not persisted anywhere; recomputed from a `QueueGroups`. */
export function flattenedQueue(queue: QueueGroups): Ranked[] {
  return [queue.hero, ...queue.now, ...queue.next, ...queue.later].filter(
    (r): r is Ranked => r !== null,
  );
}

export function totalTodayFor(
  items: Item[],
  doneLog: DoneEntry[],
  personId: string,
): { done: number; total: number } {
  const done = doneLog.filter((d) => d.assigneeId === personId).length;
  const open = items.filter(
    (i) =>
      i.assigneeId === personId && i.source !== "fyi" && i.status !== "done",
  ).length;
  return { done, total: done + open };
}

export function loadForPerson(
  items: Item[],
  personId: string,
  now: Date,
): LoadResult {
  const q = queueFor(items, personId, now);
  const doNowCount = q.now.length + (q.hero?.result.tier === "now" ? 1 : 0);
  const upNextCount = q.next.length + (q.hero?.result.tier === "next" ? 1 : 0);
  return loadFor(doNowCount, upNextCount);
}

export interface FlaggedItem {
  item: Item;
  assignee: Person | undefined;
}

export function flaggedItems(
  items: Item[],
  team: Person[],
  now: Date,
): FlaggedItem[] {
  return effectiveItems(items, now)
    .filter((item) => item.status !== "done")
    .map((item) => ({
      item,
      assignee: team.find((p) => p.id === item.assigneeId),
    }))
    .filter(({ item, assignee }) => mayNeedHelp(item, assignee, now));
}

export function nextCutoff(now: Date) {
  const upcoming = site.cutoffs
    .map((c) => ({ ...c, departsMs: new Date(c.departsAt).getTime() }))
    .filter((c) => c.departsMs >= now.getTime())
    .sort((a, b) => a.departsMs - b.departsMs);
  return upcoming[0] ?? null;
}

export interface TeamRisk {
  doNowCount: number;
  doNowDueBySub: number;
  flagged: FlaggedItem[];
  noOwnerItems: Item[];
  outToday: Person[];
}

export function teamRisk(items: Item[], team: Person[], now: Date): TeamRisk {
  const eff = effectiveItems(items, now).filter(
    (i) =>
      i.source !== "fyi" && i.status !== "done" && i.status !== "waiting" && i.status !== "snoozed",
  );
  const ranked = rankItems(eff, now);
  const doNow = ranked.filter((r) => r.result.tier === "now");
  const cutoff = nextCutoff(now);
  const doNowDueBySub = cutoff
    ? doNow.filter(
        (r) => r.item.dueAt && new Date(r.item.dueAt).getTime() <= cutoff.departsMs,
      ).length
    : 0;
  const noOwnerItems = eff.filter((i) => i.assigneeId === null);
  const outToday = team.filter((p) => p.status === "out");
  return {
    doNowCount: doNow.length,
    doNowDueBySub,
    flagged: flaggedItems(items, team, now),
    noOwnerItems,
    outToday,
  };
}

/** §6.3 board meter: the person's three tier counts, hero folded into its own tier
 * (mirrors `loadForPerson`'s fold, but keeps the three numbers separate instead of
 * collapsing them into load points). */
export interface PersonTierCounts {
  now: number;
  next: number;
  later: number;
}

export function tierCountsFor(items: Item[], personId: string, now: Date): PersonTierCounts {
  const q = queueFor(items, personId, now);
  const withHero = (tier: Tier, count: number) => count + (q.hero?.result.tier === tier ? 1 : 0);
  return {
    now: withHero("now", q.now.length),
    next: withHero("next", q.next.length),
    later: withHero("later", q.later.length),
  };
}

export type NeedsYouAction = "assign" | "checkIn" | "acknowledge";

export interface NeedsYouRow {
  item: Item;
  assignee: Person | undefined;
  action: NeedsYouAction;
  minutesStalled?: number;
}

/**
 * §6.3 "Needs you": one row per item, never a person, deduped with a fixed precedence
 * so an item that is both unowned and flagged (e.g. bounced twice with `notMine`)
 * appears once. Precedence: no owner (Assign) > flagged — help asked or stalled
 * (Check in) > unacknowledged safety (Acknowledge). Built on `teamRisk`'s already
 * tested `noOwnerItems`/`flagged` rather than re-deriving them.
 */
export function needsYouRows(
  risk: TeamRisk,
  items: Item[],
  team: Person[],
  now: Date,
  acknowledgedIds: string[],
): NeedsYouRow[] {
  const seen = new Set<string>();
  const rows: NeedsYouRow[] = [];

  for (const item of risk.noOwnerItems) {
    rows.push({ item, assignee: undefined, action: "assign" });
    seen.add(item.id);
  }

  for (const { item, assignee } of risk.flagged) {
    if (seen.has(item.id)) continue;
    const minutesStalled = assignee?.currentTaskStartedAt
      ? Math.round((now.getTime() - new Date(assignee.currentTaskStartedAt).getTime()) / 60000)
      : undefined;
    rows.push({ item, assignee, action: "checkIn", minutesStalled });
    seen.add(item.id);
  }

  for (const item of effectiveItems(items, now)) {
    if (seen.has(item.id)) continue;
    if (item.source === "fyi" || item.status === "done") continue;
    if (item.safety && !acknowledgedIds.includes(item.id)) {
      rows.push({ item, assignee: team.find((p) => p.id === item.assigneeId), action: "acknowledge" });
      seen.add(item.id);
    }
  }

  return rows;
}

export interface AssignCandidate {
  person: Person;
  counts: PersonTierCounts;
  load: LoadResult;
}

/** §6.3 Assign popover: teammates by load, lowest first. Excludes anyone `out` (they
 * show no load, §4.2) and the manager (assignment is worker-to-worker triage). */
export function assignCandidates(team: Person[], items: Item[], now: Date): AssignCandidate[] {
  return team
    .filter((p) => !p.isManager && p.status !== "out")
    .map((person) => ({
      person,
      counts: tierCountsFor(items, person.id, now),
      load: loadForPerson(items, person.id, now),
    }))
    .sort((a, b) => a.load.points - b.load.points || a.person.name.localeCompare(b.person.name));
}

// v4: named for the brief's own dashboard cards. "Notifications" is the brief's
// Notifications card, "team" is its "Team updates (Internal Comms)", and "activity"
// is its "Recent activity". Its fourth card, "Tasks (Orders)", is not here — that one
// became the ranked queue on /work, which is the whole answer.
export type UpdateTab = "notifications" | "team" | "activity";

export interface UpdateRow {
  id: string;
  at: string;
  tab: UpdateTab;
  /** The item's own title, when this row is about one (§6.4 / README P1 19 — a row
   * never shows only its reason line). Null for a plain team/system update, whose
   * `text` already reads as a complete sentence. */
  title: string | null;
  reason: string;
  authorId: string | null;
  itemId: string | null;
}

const updateTabByType: Record<UpdateEntry["type"], UpdateTab> = {
  activity: "activity",
  system: "activity",
  announcement: "team",
  handoff: "team",
};

/**
 * §6.4: Notifications (FYI items, each with its own title), Team comms (announcements
 * and handoffs), Activity (activity and system entries) — sorted newest first. The seed
 * array is not chronological (up-07 06:35 precedes up-08 06:45 in file order). Every
 * row stays listed regardless of read state; unread is a per-viewer dot the caller
 * derives from `readIds`, not a filter (a "mark read" row should not vanish).
 */
export function updatesFor(items: Item[], updates: UpdateEntry[]): UpdateRow[] {
  const fyiRows: UpdateRow[] = items
    .filter((i) => i.source === "fyi")
    .map((item) => ({
      id: item.id,
      at: item.createdAt,
      tab: "notifications",
      title: item.title,
      reason: item.whyText,
      authorId: null,
      itemId: item.id,
    }));

  const entryRows: UpdateRow[] = updates.map((u) => ({
    id: u.id,
    at: u.at,
    tab: updateTabByType[u.type],
    title: null,
    reason: u.text,
    authorId: u.authorId,
    itemId: null,
  }));

  return [...fyiRows, ...entryRows].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}
