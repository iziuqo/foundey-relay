import { describe, it, expect } from "vitest";
import * as deck from "../../components/deck/deck-copy";
import { deckSlides } from "../../components/deck/deck-content";
import { moments } from "../../components/system/motion/moments";
import { FACTOR_MAX } from "../../components/relay/why-factors";
import { scoreItem } from "../../lib/priority";
import type { Item } from "../../lib/types";

/**
 * G9 — copy, applied to the deck (M10). The deck's prose lives in `deck-copy.ts` so this
 * can read it; before M10 it was inline JSX, and nothing asserted its reading level, its
 * labels, or that a claim still matched the product it described. A slide caption that
 * contradicts the screen above it (v3's first M10 draft had three) is the deck's version
 * of a broken button.
 */

/** Flesch–Kincaid grade of one string: 0.39 words/sentence + 11.8 syllables/word − 15.59.
 * Syllables are counted by vowel groups, which is crude and errs slightly high on words
 * like "axe" and "queue" — so a pass here is a real pass. */
function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 1);
}

function gradeLevel(text: string): number {
  const sentences = text.split(/(?<=[.!?”])\s+(?=[A-Z“])/).filter((s) => s.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w));
  if (words.length === 0 || sentences.length === 0) return 0;
  const syll = words.reduce((sum, w) => sum + syllables(w), 0);
  return 0.39 * (words.length / sentences.length) + 11.8 * (syll / words.length) - 15.59;
}

describe("G9 reading level (grade ≤ 8)", () => {
  const prose = deck.deckProse();

  it("reads the whole deck, not a sample", () => {
    expect(prose.length).toBeGreaterThan(60);
  });

  it.each(prose.map((p) => [p.where, p.text] as const))("%s", (_where, text) => {
    expect(gradeLevel(text), `"${text}"`).toBeLessThanOrEqual(8);
  });
});

describe("G9 labels and titles", () => {
  const sections = [
    deck.dividerA, deck.brief, deck.insight, deck.failures, deck.assumptions, deck.prioritized, deck.wireframe,
    deck.priorityRule, deck.cuts, deck.dividerB, deck.hifi, deck.motion, deck.manager, deck.accessibility, deck.next,
  ];

  it("no title ends in a full stop — a title is a name, not a sentence", () => {
    for (const s of sections) expect(s.title.endsWith("."), s.title).toBe(false);
  });

  it("every prose string that is a sentence ends in one", () => {
    const sentences = deck.deckProse().filter((p) => !/^(brief\.quote|insight\.missing|failures\.today|priorityRule\.stat)/.test(p.where));
    for (const { where, text } of sentences) expect(/[.”]$/.test(text), `${where}: "${text}"`).toBe(true);
  });

  it("no orphaned numerals: every stat says what it counts and in what unit", () => {
    for (const stat of deck.priorityRule.stats) {
      expect(stat.label.length).toBeGreaterThan(0);
      expect(stat.note, `${stat.label} has no unit`).toMatch(/points/);
    }
  });

  it("no more than three legend lines a slide, one per annotation", () => {
    for (const legend of [deck.wireframe.legend, deck.hifi.legend, deck.manager.legend]) {
      expect(legend).toHaveLength(3);
    }
  });

  it("each slide's columns come in threes", () => {
    for (const s of [deck.assumptions, deck.prioritized, deck.cuts, deck.accessibility, deck.next]) {
      expect(s.columns).toHaveLength(3);
    }
    expect(deck.accessibility.marks).toHaveLength(3);
  });
});

describe("G9 the deck's claims still match the product", () => {
  it("says sixteen slides, and there are sixteen", () => {
    expect(deckSlides).toHaveLength(16);
    expect(deck.plain(deck.cuts.lead)).toContain("to 16");
    expect(deckSlides.filter((s) => s.part === "A")).toHaveLength(10);
    expect(deckSlides.filter((s) => s.part === "B")).toHaveLength(6);
  });

  it("says eighteen moments, and the catalog has eighteen", () => {
    expect(moments).toHaveLength(18);
    expect(deck.plain(deck.motion.lead)).toContain("Eighteen");
  });

  it("states the score's caps from the code, not from memory", () => {
    const [time, blocked, impact] = deck.priorityRule.stats.map((s) => Number(/up to (\d+)/i.exec(s.note)?.[1]));
    expect([time, blocked, impact]).toEqual([FACTOR_MAX.T, FACTOR_MAX.B, FACTOR_MAX.I]);
  });

  it("states the tier thresholds from the code", () => {
    // "A score of 60 or more is Act now, and 30 or more is Up next. Safety is always Act now."
    const base: Item = {
      id: "t", title: "t", source: "wms", status: "open", dueAt: null, ordersBlocked: 0,
      customerImpact: "none", compliance: false, escalated: false, safety: false,
    } as unknown as Item;
    const at = (item: Partial<Item>) => scoreItem({ ...base, ...item } as Item, new Date("2026-09-22T10:40:00-07:00"));
    // Impact alone: compliance 15 + escalated 12 + high 10 = 37 → Up next; plus 30 blocked → 67.
    expect(at({ compliance: true, escalated: true, customerImpact: "high" }).tier).toBe("next");
    expect(at({ compliance: true, escalated: true, customerImpact: "high", ordersBlocked: 300 }).tier).toBe("now");
    expect(at({ safety: true }).tier).toBe("now");
    expect(deck.priorityRule.rule).toMatch(/60 or more is Act now/);
    expect(deck.priorityRule.rule).toMatch(/30 or more is Up next/);
  });
});
