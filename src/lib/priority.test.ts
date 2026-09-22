import { describe, it, expect } from 'vitest'
import { items, demoInjections, team } from '../data/seed'
import { scoreItem, rankItems, loadFor, mayNeedHelp } from './priority'
import type { Item } from './types'

const NOW = new Date('2026-09-22T10:40:00-07:00')

describe('scoreItem', () => {
  const allItems: Item[] = [...items, ...demoInjections]
  for (const item of allItems) {
    it(`matches _expected for ${item.id}`, () => {
      const result = scoreItem(item, NOW)
      expect(result.score).toBe(item._expected?.score)
      expect(result.tier).toBe(item._expected?.tier)
    })
  }
})

describe('rankItems', () => {
  it("sorts Priya's queue as the plan's worked proof (§4.2)", () => {
    const priyaItems = items.filter((i) => i.assigneeId === 'u1')
    const ranked = rankItems(priyaItems, NOW)
    expect(ranked.map((r) => r.item.id)).toEqual(['it-01', 'it-03', 'it-04', 'it-05', 'it-13', 'it-11'])
  })
})

describe('loadFor', () => {
  function loadForPerson(personId: string) {
    const actionable = items.filter(
      (i) => i.assigneeId === personId && i.status !== 'waiting' && i.status !== 'snoozed' && i.status !== 'done',
    )
    const ranked = rankItems(actionable, NOW)
    const doNowCount = ranked.filter((r) => r.result.tier === 'now').length
    const upNextCount = ranked.filter((r) => r.result.tier === 'next').length
    return loadFor(doNowCount, upNextCount)
  }

  it('Priya is Busy', () => {
    expect(loadForPerson('u1').label).toBe('busy')
  })

  it('everyone else on shift is Light (Kwame is Out today, with no items)', () => {
    for (const person of team) {
      if (person.id === 'u1' || person.isManager) continue
      expect(loadForPerson(person.id).label).toBe('light')
    }
  })
})

describe('mayNeedHelp', () => {
  it('flags only it-07 at 10:40', () => {
    const flagged = items.filter((item) => {
      const assignee = team.find((p) => p.id === item.assigneeId)
      return mayNeedHelp(item, assignee, NOW)
    })
    expect(flagged.map((i) => i.id)).toEqual(['it-07'])
  })
})
