import { describe, expect, it } from "vitest";
import { ringLabel } from "@/components/relay/ring-label";

/**
 * The hero countdown's label rules (M15). The geometry — does the rendered string fit
 * inside the ring — is asserted in `tests/e2e/craft.spec.ts`, which walks this same
 * function. This file asserts the arithmetic.
 */
describe("ringLabel", () => {
  it("is a bare numeral for the common case: under 100 minutes and not late", () => {
    for (const m of [0, 1, 5, 50, 99]) {
      expect(ringLabel(m)).toEqual({ bare: true, magnitude: m, magnitudeUnit: "", magnitudeStep: "t-hero-sm", unit: "" });
    }
  });

  it("splits past 100 minutes, and shows whole hours", () => {
    expect(ringLabel(100)).toEqual({ bare: false, magnitude: 1, magnitudeUnit: "", magnitudeStep: "t-hero-sm", unit: "h" });
    expect(ringLabel(1340)).toEqual({ bare: false, magnitude: 22, magnitudeUnit: "", magnitudeStep: "t-hero-sm", unit: "h" });
  });

  it("splits for any late value, keeping minutes below 100", () => {
    // The 60–99 band is the one that used to collapse to a flat "1 h".
    expect(ringLabel(-10)).toEqual({ bare: false, magnitude: 10, magnitudeUnit: "", magnitudeStep: "t-hero-sm", unit: "late" });
    expect(ringLabel(-95)).toEqual({ bare: false, magnitude: 95, magnitudeUnit: "", magnitudeStep: "t-hero-sm", unit: "late" });
  });

  it("says \"late\" on the small line, and names hours beside the magnitude", () => {
    // v4: an empty arc reads as a clock that has not started unless something names the
    // direction. Only a late label does this; a future one still puts the unit below.
    expect(ringLabel(-120)).toEqual({
      bare: false,
      magnitude: 2,
      magnitudeUnit: "h",
      magnitudeStep: "t-section",
      unit: "late",
    });
    // Under an hour the unit stays implicit, as it is for the bare countdown.
    expect(ringLabel(-45).magnitudeUnit).toBe("");
    expect(ringLabel(240).unit).toBe("h");
    expect(ringLabel(240).magnitudeUnit).toBe("");
  });

  it("rounds late magnitudes up and future ones down, so lateness is never under-reported", () => {
    // 115 minutes late is nearly two hours. Flooring it reported "1 h".
    expect(ringLabel(-115).magnitude).toBe(2);
    expect(ringLabel(-120).magnitude).toBe(2);
    expect(ringLabel(-121).magnitude).toBe(3);
    // A future value floors, so the ring never over-reports the time left either.
    expect(ringLabel(115).magnitude).toBe(1);
    expect(ringLabel(179).magnitude).toBe(2);
  });

  it("never puts more than one word on the small line", () => {
    // The line's space is the ring's chord at its height, about 46px: "min" fits at 28px,
    // "h" at 10px and "late" at 33px. "min late" did not, at 64px — which is why the
    // unit moves up beside the magnitude on a late label instead of sharing this line.
    const units = new Set<string>();
    for (let m = -1440; m <= 1440; m += 1) {
      const l = ringLabel(m);
      if (!l.bare) units.add(l.unit);
    }
    // "min" is no longer reachable here: a future label under 100 minutes is bare, and a
    // late one spends this line on "late" and glues its unit to the magnitude instead.
    expect([...units].sort()).toEqual(["h", "late"]);
    for (const u of units) expect(u.split(" ")).toHaveLength(1);
  });
});
