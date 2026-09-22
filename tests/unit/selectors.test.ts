import { describe, it, expect } from "vitest";
import { items, team, updates } from "../../lib/seed";
import {
  teamRisk,
  flaggedItems,
  needsYouRows,
  tierCountsFor,
  assignCandidates,
  updatesFor,
  queueFor,
} from "../../lib/selectors";

const NOW = new Date("2026-09-22T10:40:00-07:00");

describe("teamRisk / flaggedItems with helpAsked (§8.6)", () => {
  it("Priya asking for help on it-01 puts it in Needs you alongside it-07", () => {
    const withHelpAsked = items.map((i) =>
      i.id === "it-01" ? { ...i, helpAsked: true } : i,
    );

    const flagged = flaggedItems(withHelpAsked, team, NOW);
    expect(flagged.map((f) => f.item.id).sort()).toEqual(["it-01", "it-07"]);

    const risk = teamRisk(withHelpAsked, team, NOW);
    expect(risk.flagged).toHaveLength(2);
  });

  it("it-01 is not flagged before help is asked", () => {
    expect(flaggedItems(items, team, NOW).map((f) => f.item.id)).not.toContain("it-01");
  });
});

describe("needsYouRows (§6.3 Phase 5)", () => {
  it("lists the seed's no-owner, stalled, and unacknowledged-safety items, one row each", () => {
    const risk = teamRisk(items, team, NOW);
    const rows = needsYouRows(risk, items, team, NOW, []);
    expect(rows.map((r) => r.item.id).sort()).toEqual(["it-02", "it-07", "it-09", "it-10"]);
    expect(rows.find((r) => r.item.id === "it-09")?.action).toBe("assign");
    expect(rows.find((r) => r.item.id === "it-10")?.action).toBe("assign");
    expect(rows.find((r) => r.item.id === "it-07")?.action).toBe("checkIn");
    expect(rows.find((r) => r.item.id === "it-02")?.action).toBe("acknowledge");
  });

  it("acknowledging the safety item removes it from the list", () => {
    const risk = teamRisk(items, team, NOW);
    const rows = needsYouRows(risk, items, team, NOW, ["it-02"]);
    expect(rows.map((r) => r.item.id)).not.toContain("it-02");
  });

  it("an item that is both unowned and flagged appears once, as Assign (§8.6 double-list guard)", () => {
    const bothFlags = items.map((i) => (i.id === "it-09" ? { ...i, assigneeId: null, helpAsked: true } : i));
    const risk = teamRisk(bothFlags, team, NOW);
    const rows = needsYouRows(risk, bothFlags, team, NOW, []);
    const matches = rows.filter((r) => r.item.id === "it-09");
    expect(matches).toHaveLength(1);
    expect(matches[0].action).toBe("assign");
  });

  it("Priya asking for help on it-01 surfaces it in needsYouRows too (§8.6, extends the flaggedItems test above)", () => {
    const withHelpAsked = items.map((i) => (i.id === "it-01" ? { ...i, helpAsked: true } : i));
    const risk = teamRisk(withHelpAsked, team, NOW);
    const rows = needsYouRows(risk, withHelpAsked, team, NOW, []);
    expect(rows.map((r) => r.item.id)).toContain("it-01");
  });
});

describe("tierCountsFor", () => {
  it("sums to the same active item count as queueFor, hero included", () => {
    for (const person of team.filter((p) => !p.isManager)) {
      const counts = tierCountsFor(items, person.id, NOW);
      const queue = queueFor(items, person.id, NOW);
      const activeTotal = queue.now.length + queue.next.length + queue.later.length + (queue.hero ? 1 : 0);
      expect(counts.now + counts.next + counts.later).toBe(activeTotal);
    }
  });
});

describe("assignCandidates", () => {
  it("excludes the manager and anyone out, sorted by load ascending", () => {
    const candidates = assignCandidates(team, items, NOW);
    expect(candidates.some((c) => c.person.isManager)).toBe(false);
    expect(candidates.some((c) => c.person.status === "out")).toBe(false);
    const points = candidates.map((c) => c.load.points);
    expect(points).toEqual([...points].sort((a, b) => a - b));
  });
});

describe("updatesFor", () => {
  it("sorts newest first even though the seed file is not chronological (up-08 before up-07)", () => {
    const rows = updatesFor(items, updates);
    const i07 = rows.findIndex((r) => r.id === "up-07");
    const i08 = rows.findIndex((r) => r.id === "up-08");
    expect(i08).toBeLessThan(i07);
  });

  it("every For you row carries its item's own title (README P1 19)", () => {
    const rows = updatesFor(items, updates).filter((r) => r.tab === "forYou");
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row.title).toBeTruthy();
  });

  it("classifies announcement/handoff as team and activity/system as system", () => {
    const rows = updatesFor(items, updates);
    expect(rows.find((r) => r.id === "up-04")?.tab).toBe("team"); // announcement
    expect(rows.find((r) => r.id === "up-07")?.tab).toBe("team"); // handoff
    expect(rows.find((r) => r.id === "up-01")?.tab).toBe("system"); // activity
    expect(rows.find((r) => r.id === "up-03")?.tab).toBe("system"); // system
  });
});
