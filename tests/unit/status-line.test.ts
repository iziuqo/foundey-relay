import { describe, it, expect } from "vitest";
import { truckClause } from "../../components/relay/status-sentence";
import { copy } from "../../lib/copy";
import type { Cutoff } from "../../lib/types";

const NOW = new Date("2026-09-22T10:40:00-07:00");

const cutoff = (departsAt: string): Cutoff =>
  ({ id: "c1", carrier: "USPS", door: "Door 6", departsAt, ordersPlanned: 0, ordersAtRisk: 0 }) as Cutoff;

/**
 * The status line is the page `h1`, and its three clauses are assembled, not written —
 * so each branch has to be exercised on its own. Both cases below were live defects the
 * screen only reaches through the demo's time jump, which is why neither showed up in a
 * screenshot.
 */
describe("the status line's truck clause (§5.1)", () => {
  it("counts down while the truck is still minutes away", () => {
    expect(truckClause(cutoff("2026-09-22T11:30:00-07:00"), NOW)).toBe("USPS in 50 min");
  });

  it("switches preposition once it is a clock time, not a countdown", () => {
    // "USPS in 15:30" is what routing a time through the "in {rel}" string reads like.
    const clause = truckClause(cutoff("2026-09-22T15:30:00-07:00"), NOW);
    expect(clause).toBe("USPS at 15:30");
    expect(clause).not.toMatch(/ in \d{2}:\d{2}/);
  });

  it("does the same for tomorrow's first truck", () => {
    expect(truckClause(cutoff("2026-09-23T09:00:00-07:00"), NOW)).not.toMatch(/ in \d{2}:\d{2}/);
  });

  it("says so plainly once it has gone", () => {
    expect(truckClause(cutoff("2026-09-22T09:00:00-07:00"), NOW)).toBe("USPS has left");
  });
});

describe("the status line's clauses are clauses, not sentences", () => {
  it("the all-clear clause carries no full stop either", () => {
    // It used to be `nothingUrgent` with its "Nothing urgent. " prefix stripped by a
    // regex, which left the full stop on the end and put it mid-line after a "·".
    expect(copy.status.clauseLeft.endsWith(".")).toBe(false);
    expect(copy.status.clauseLeft).toBe("{n} left before your shift ends");
  });
});
