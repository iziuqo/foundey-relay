import { rankItems, loadFor, mayNeedHelp, type Ranked, type LoadResult } from './priority'
import type { Item, Person, DoneEntry, Tier } from './types'
import { site } from '../data/seed'

function effectiveItem(item: Item, now: Date): Item {
  if (item.status === 'waiting' && item.checkBackAt && new Date(item.checkBackAt) <= now) {
    return { ...item, status: 'open', cause: 'Back from waiting' }
  }
  if (item.status === 'snoozed' && item.snoozeUntil && new Date(item.snoozeUntil) <= now) {
    return { ...item, status: 'open' }
  }
  return item
}

export function effectiveItems(items: Item[], now: Date): Item[] {
  return items.map((i) => effectiveItem(i, now))
}

export interface QueueGroups {
  hero: Ranked | null
  now: Ranked[]
  next: Ranked[]
  later: Ranked[]
  waiting: Item[]
  snoozed: Item[]
  total: number
}

/**
 * One person's queue: tiered, sorted, with the hero split out of its tier. §6.2, §4.2.
 *
 * `forcedHeroId`, when given, pins the hero to that item instead of the naturally top ranked one.
 * §7.6: while a higher ranked item's arrival band is showing (the user was active in the last 8s),
 * "the hero does not change" until they press Show me — the newly arrived item still ranks and
 * lists normally, it just doesn't unseat the current hero on its own.
 */
export function queueFor(items: Item[], personId: string, now: Date, forcedHeroId?: string | null): QueueGroups {
  const mine = effectiveItems(
    items.filter((i) => i.assigneeId === personId && i.source !== 'fyi'),
    now,
  )
  const active = mine.filter((i) => i.status === 'open' || i.status === 'in_progress')
  const waiting = mine.filter((i) => i.status === 'waiting')
  const snoozed = mine.filter((i) => i.status === 'snoozed')
  const ranked = rankItems(active, now)

  const byTier = (tier: Tier) => ranked.filter((r) => r.result.tier === tier)
  const nowTier = byTier('now')
  const nextTier = byTier('next')
  const laterTier = byTier('later')
  const natural = nowTier[0] ?? nextTier[0] ?? laterTier[0] ?? null
  const forced = forcedHeroId ? ranked.find((r) => r.item.id === forcedHeroId) : undefined
  const hero = forced ?? natural

  const withoutHero = (list: Ranked[]) => (hero ? list.filter((r) => r.item.id !== hero.item.id) : list)

  return {
    hero,
    now: withoutHero(nowTier),
    next: withoutHero(nextTier),
    later: withoutHero(laterTier),
    waiting,
    snoozed,
    total: ranked.length,
  }
}

export function totalTodayFor(items: Item[], doneLog: DoneEntry[], personId: string): { done: number; total: number } {
  const done = doneLog.filter((d) => d.assigneeId === personId).length
  const open = items.filter((i) => i.assigneeId === personId && i.source !== 'fyi' && i.status !== 'done').length
  return { done, total: done + open }
}

export function loadForPerson(items: Item[], personId: string, now: Date): LoadResult {
  const q = queueFor(items, personId, now)
  const doNowCount = q.now.length + (q.hero?.result.tier === 'now' ? 1 : 0)
  const upNextCount = q.next.length + (q.hero?.result.tier === 'next' ? 1 : 0)
  return loadFor(doNowCount, upNextCount)
}

export interface FlaggedItem {
  item: Item
  assignee: Person | undefined
}

export function flaggedItems(items: Item[], team: Person[], now: Date): FlaggedItem[] {
  return effectiveItems(items, now)
    .filter((item) => item.status !== 'done')
    .map((item) => ({ item, assignee: team.find((p) => p.id === item.assigneeId) }))
    .filter(({ item, assignee }) => mayNeedHelp(item, assignee, now))
}

export function nextCutoff(now: Date) {
  const upcoming = site.cutoffs
    .map((c) => ({ ...c, departsMs: new Date(c.departsAt).getTime() }))
    .filter((c) => c.departsMs >= now.getTime())
    .sort((a, b) => a.departsMs - b.departsMs)
  return upcoming[0] ?? null
}

export interface TeamRisk {
  doNowCount: number
  doNowDueBySub: number
  flagged: FlaggedItem[]
  noOwnerItems: Item[]
  outToday: Person[]
}

export function teamRisk(items: Item[], team: Person[], now: Date): TeamRisk {
  const eff = effectiveItems(items, now).filter((i) => i.source !== 'fyi' && i.status !== 'done' && i.status !== 'waiting' && i.status !== 'snoozed')
  const ranked = rankItems(eff, now)
  const doNow = ranked.filter((r) => r.result.tier === 'now')
  const cutoff = nextCutoff(now)
  const doNowDueBySub = cutoff ? doNow.filter((r) => r.item.dueAt && new Date(r.item.dueAt).getTime() <= cutoff.departsMs).length : 0
  const noOwnerItems = eff.filter((i) => i.assigneeId === null)
  const outToday = team.filter((p) => p.status === 'out')
  return {
    doNowCount: doNow.length,
    doNowDueBySub,
    flagged: flaggedItems(items, team, now),
    noOwnerItems,
    outToday,
  }
}
