import { describe, it, expect } from "vitest";
import { copy, t } from "../../lib/copy";
import seedRaw from "../../plan/seed.json";
import { items, demoInjections } from "../../lib/seed";

describe("copy tier labels (§8.6, §4.6)", () => {
  it("third tier reads 'When you can', ids stay now/next/later", () => {
    expect(copy.tiers.now.label).toBe("Act now");
    expect(copy.tiers.next.label).toBe("Up next");
    expect(copy.tiers.later.label).toBe("When you can");
  });

  it("no fixture still carries the retired 'Later today' label", () => {
    const allRaw = [...seedRaw.items, ...seedRaw.demoInjections];
    for (const item of allRaw) {
      if (item._expected) expect(item._expected.tier).not.toBe("Later today");
    }
  });

  it("seed fixtures normalize to the 'later' tier id, matching the renamed label", () => {
    const laterItems = [...items, ...demoInjections].filter((i) => i._expected?.tier === "later");
    expect(laterItems.length).toBeGreaterThan(0);
  });
});

describe("t()", () => {
  it("substitutes named placeholders and leaves unknown ones untouched", () => {
    expect(t(copy.status.progress, { done: 4, total: 10 })).toBe("4 of 10 done today.");
    expect(t("{missing} stays")).toBe("{missing} stays");
  });
});
