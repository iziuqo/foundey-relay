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

/* =====================================================================================
 * G9 — copy. Extended by v3 M4 for the worker screen's own strings.
 * =================================================================================== */

/** The generic labels a button falls back to when nobody decided what it does. The
 *  hero's primary may never be one of them: it carries the item's own action. */
const GENERIC = ["Start", "Open", "Go", "View", "Details", "Done", "Mark done", "Continue"];

describe("G9 buttons say the verb (§5.1, advisor §7.3)", () => {
  it("the completion action is the verb form, not the object", () => {
    // v1 shipped "Done" on a button, which names the state rather than the act. The
    // distinction matters most here, on the largest control on the most important
    // screen.
    expect(copy.actions.done).toBe("Mark done");
    expect(copy.actions.help).toBe("Ask for help");
    expect(copy.actions.later).toBe("Move to later");
    expect(copy.actions.handOff).toBe("Hand off to a teammate");
  });

  it("every item's own primary action is specific to that item, not a generic label", () => {
    // The hero's primary button carries `item.primaryAction` verbatim (hero.tsx), so
    // this is what the biggest control on /work actually says. §5.1: "The primary
    // button says the verb (\"Reprint hazmat labels\")" — a generic label there is the
    // defect, and a one-word one cannot be an instruction.
    const generic = [...items, ...demoInjections]
      .map((i) => i.primaryAction)
      .filter((a): a is string => Boolean(a))
      .filter((a) => GENERIC.includes(a) || a.trim().split(/\s+/).length < 2);
    expect(generic).toEqual([]);
  });

  it("no item's primary action opens with an article — a button is an imperative", () => {
    const articled = [...items, ...demoInjections]
      .map((i) => i.primaryAction)
      .filter((a): a is string => Boolean(a))
      .filter((a) => /^(the|a|an|your|this)\b/i.test(a.trim()));
    expect(articled).toEqual([]);
  });
});

describe("G9 the status line (§5.1)", () => {
  it("its clauses carry no full stop — they are joined by a separator, not sentences", () => {
    const clauses = Object.entries(copy.status).filter(([key]) => key.startsWith("clause"));
    expect(clauses.length).toBeGreaterThan(0);
    for (const [key, text] of clauses) {
      expect(text.endsWith("."), `${key} ends in a full stop`).toBe(false);
    }
  });

  it("the operative clause answers 'what needs me', not 'who am I'", () => {
    expect(t(copy.status.clauseNeedYou, { n: 2 })).toBe("2 need you now");
    expect(copy.status.clauseNeedYouOne).toBe("1 needs you now");
    // The greeting survives, but only in the top bar (M3's `Greeting`) — the status line
    // may not open with it. v2's did, at 56px.
    for (const [, text] of Object.entries(copy.status)) {
      expect(text.toLowerCase().includes("good morning")).toBe(false);
    }
  });
});

describe("G9 the rail says each thing once (§7.3)", () => {
  it("the departure line does not repeat the carrier or the door the card already shows", () => {
    for (const line of [copy.truckClock.railLeavesIn, copy.truckClock.railLeavesAt, copy.truckClock.railDeparted]) {
      expect(line.includes("{carrier}"), `"${line}" repeats the card's own title`).toBe(false);
      expect(line.includes("{door}"), `"${line}" repeats the card's own door chip`).toBe(false);
    }
  });
});
