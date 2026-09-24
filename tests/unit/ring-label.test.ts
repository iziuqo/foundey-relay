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
      expect(ringLabel(m)).toEqual({ bare: true, magnitude: m, unit: "" });
    }
  });

  it("splits past 100 minutes, and shows whole hours", () => {
    expect(ringLabel(100)).toEqual({ bare: false, magnitude: 1, unit: "h" });
    expect(ringLabel(1340)).toEqual({ bare: false, magnitude: 22, unit: "h" });
  });

  it("splits for any late value, keeping minutes below 100", () => {
    // The 60–99 band is the one that used to collapse to a flat "1 h".
    expect(ringLabel(-10)).toEqual({ bare: false, magnitude: 10, unit: "min" });
    expect(ringLabel(-95)).toEqual({ bare: false, magnitude: 95, unit: "min" });
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

  it("never puts a word other than the unit on the small line", () => {
    // The line's space is the ring's chord at its height, about 46px: "min" fits at 28px
    // and "h" at 10px, "min late" did not at 64px.
    const units = new Set<string>();
    for (let m = -1440; m <= 1440; m += 1) {
      const l = ringLabel(m);
      if (!l.bare) units.add(l.unit);
    }
    expect([...units].sort()).toEqual(["h", "min"]);
  });
});
