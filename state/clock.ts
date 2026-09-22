import { simNowFrom } from "../lib/time";

/** The demo's frozen starting instant — 10:40 site time on the seed day. §10.5, README R5. */
export const SEED_NOW_ISO = "2026-09-22T10:40:00-07:00";

export interface Clock {
  loadedAtMs: number;
  jumpOffsetMs: number;
}

export function createClock(loadedAtMs: number = Date.now()): Clock {
  return { loadedAtMs, jumpOffsetMs: 0 };
}

/** simNow for a clock: real elapsed time since load, plus any demo jump offset. */
export function now(clock: Clock): Date {
  return simNowFrom(SEED_NOW_ISO, clock.loadedAtMs, clock.jumpOffsetMs);
}

export function jump(clock: Clock, byMs: number): Clock {
  return { ...clock, jumpOffsetMs: clock.jumpOffsetMs + byMs };
}

export function resetClock(clock: Clock, jumpOffsetMs = 0): Clock {
  return { ...clock, jumpOffsetMs };
}
