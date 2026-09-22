import { describe, it, expect } from "vitest";
import { greetingPeriod, isAfterLunch, siteHour, dueKind } from "../../lib/time";

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

describe("dueKind (plan §6.1 time pills, §3.2 truck capsules)", () => {
  const now = new Date("2026-09-22T10:40:00-07:00");

  it("reads late by minutes under an hour", () => {
    expect(dueKind("2026-09-22T10:10:00-07:00", now)).toEqual({ kind: "late-min", n: 30 });
  });

  it("reads late by hours at or beyond an hour", () => {
    expect(dueKind("2026-09-22T08:30:00-07:00", now)).toEqual({ kind: "late-hr", n: 2 });
  });

  it("reads due-in within the next 4 hours", () => {
    expect(dueKind("2026-09-22T11:30:00-07:00", now)).toEqual({ kind: "due-in", n: 50 });
  });

  it("reads a clock time once due-in exceeds 4 hours today", () => {
    expect(dueKind("2026-09-22T16:00:00-07:00", now)).toEqual({ kind: "due-at", hhmm: "16:00" });
  });

  it("reads tomorrow instead of a same-day clock time", () => {
    expect(dueKind("2026-09-23T09:00:00-07:00", now)).toEqual({ kind: "tomorrow", hhmm: "09:00" });
  });
});
