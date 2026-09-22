import { describe, it, expect } from "vitest";
import { greetingPeriod, isAfterLunch, siteHour } from "../../lib/time";

// These assertions must hold no matter which TZ the test process runs under —
// run via `npm run test:tz` under America/Sao_Paulo, Asia/Tokyo, and UTC (§9 G5).
// The site is always America/Los_Angeles, never the machine running the tests.

describe("siteHour / greetingPeriod / isAfterLunch (§8.6, README P0 6)", () => {
  it("reads the site's hour off a UTC instant, not the process TZ", () => {
    // 18:05 UTC on 2026-09-22 is 11:05 in America/Los_Angeles (PDT, UTC-7).
    expect(siteHour(new Date("2026-09-22T18:05:00Z"))).toBe(11);
  });

  it("greets 'morning' at the seed time, 10:40 site time", () => {
    const seedNow = new Date("2026-09-22T10:40:00-07:00");
    expect(greetingPeriod(seedNow)).toBe("morning");
  });

  it("greets 'afternoon' once site time passes noon", () => {
    const afternoon = new Date("2026-09-22T13:00:00-07:00");
    expect(greetingPeriod(afternoon)).toBe("afternoon");
  });

  it("flips at exactly noon site time", () => {
    expect(greetingPeriod(new Date("2026-09-22T11:59:00-07:00"))).toBe("morning");
    expect(greetingPeriod(new Date("2026-09-22T12:00:00-07:00"))).toBe("afternoon");
  });

  it("is after lunch only at or past 12:30 site time", () => {
    expect(isAfterLunch(new Date("2026-09-22T12:29:00-07:00"))).toBe(false);
    expect(isAfterLunch(new Date("2026-09-22T12:30:00-07:00"))).toBe(true);
    expect(isAfterLunch(new Date("2026-09-22T16:00:00-07:00"))).toBe(true);
  });
});
