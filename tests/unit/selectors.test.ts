import { describe, it, expect } from "vitest";
import { items, team } from "../../lib/seed";
import { teamRisk, flaggedItems } from "../../lib/selectors";

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
