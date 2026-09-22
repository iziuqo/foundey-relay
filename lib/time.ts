"use client";

import { useEffect, useReducer, useState, useSyncExternalStore } from "react";

export const TIME_ZONE = "America/Los_Angeles";

const clockFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const hourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  hour12: false,
});

const minuteFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  minute: "numeric",
});

export function formatClock(date: Date): string {
  return clockFormatter.format(date);
}

export function dayKey(date: Date): string {
  return dayKeyFormatter.format(date);
}

export function isTomorrow(target: Date, from: Date): boolean {
  const nextDay = new Date(from.getTime() + 24 * 60 * 60 * 1000);
  return dayKey(target) === dayKey(nextDay);
}

export function minutesBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 60000);
}

/** "38 min" under an hour, "2 h" or "2 h 10 min" at or beyond an hour. */
export function relativeDuration(minutes: number): string {
  const abs = Math.abs(minutes);
  if (abs < 60) return `${abs} min`;
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** ISO instant at 12:30 site time on `now`'s site-local day. §8.6 "after lunch" snooze option; the demo's one fixed day runs PDT, matching SEED_NOW_ISO's -07:00 (state/clock.ts). */
export function afterLunchIso(now: Date): string {
  return `${dayKey(now)}T12:30:00-07:00`;
}

/** ISO instant at `hhmm` (24h, "HH:MM") site time on `now`'s site-local day. */
export function siteTimeIso(now: Date, hhmm: string): string {
  return `${dayKey(now)}T${hhmm}:00-07:00`;
}

export type DueKind =
  | { kind: "late-min"; n: number }
  | { kind: "late-hr"; n: number }
  | { kind: "tomorrow"; hhmm: string }
  | { kind: "due-in"; n: number }
  | { kind: "due-at"; hhmm: string };

/**
 * Classifies a due instant relative to `now` into the shape the time pill and truck
 * clock read off (plan §6.1 time pills, §3.2 truck capsules). Pure and testable —
 * callers map the `kind` onto copy.ts strings; this file stays copy-free.
 */
export function dueKind(dueAt: string, now: Date): DueKind {
  const target = new Date(dueAt);
  const ml = minutesBetween(now, target);
  if (ml < 0) {
    const abs = Math.abs(ml);
    return abs < 60 ? { kind: "late-min", n: abs } : { kind: "late-hr", n: Math.round(abs / 60) };
  }
  if (isTomorrow(target, now)) return { kind: "tomorrow", hhmm: formatClock(target) };
  if (ml <= 240) return { kind: "due-in", n: ml };
  return { kind: "due-at", hhmm: formatClock(target) };
}

/**
 * The hour of `date` in site time (0-23). Some ICU builds format midnight as "24" for
 * `hour12: false`, so that's normalized back to 0. This is the only correct way to ask
 * "what hour is it at the site" — never `date.getHours()` (README P0 6, banned by the
 * `no-restricted-syntax` ESLint rule outside this file).
 */
export function siteHour(date: Date): number {
  const h = Number(hourFormatter.format(date));
  return h === 24 ? 0 : h;
}

/** Drives the greeting ("Good morning" / "Good afternoon"). Site time, not the browser's. */
export function greetingPeriod(date: Date): "morning" | "afternoon" {
  return siteHour(date) < 12 ? "morning" : "afternoon";
}

/** Whether it is past the 12:30 site-time lunch mark, e.g. for the "After lunch" snooze option. */
export function isAfterLunch(date: Date): boolean {
  const h = siteHour(date);
  const m = Number(minuteFormatter.format(date));
  return h > 12 || (h === 12 && m >= 30);
}

/** simNow = seedNow + real elapsed time since load + any demo jump offset. Time runs at 1x, per R5. */
export function simNowFrom(
  seedNowIso: string,
  loadedAtMs: number,
  jumpOffsetMs: number,
): Date {
  const seedMs = new Date(seedNowIso).getTime();
  return new Date(seedMs + (Date.now() - loadedAtMs) + jumpOffsetMs);
}

const noSubscription = () => () => {};

/**
 * §8.3: the server render and the first client render must produce the exact same
 * `now` (the seed instant, elapsed = 0) or React flags a hydration mismatch — which is
 * exactly what happens if `now` is derived from `Date.now()` during render, since the
 * server's and the client's render passes happen at genuinely different wall-clock
 * instants (network latency between them). `useSyncExternalStore`'s server/client
 * snapshot split is the React-documented way to read a client-only value without that
 * mismatch: `getServerSnapshot` (and the client's matching first paint) says
 * `hasMounted = false`, so both render the seed instant exactly; only the following,
 * strictly client-side re-render — after hydration has already committed, which is
 * also where the clock is meant to start (Providers.tsx) — flips it to `true`.
 */
function useHasMounted(): boolean {
  return useSyncExternalStore(noSubscription, () => true, () => false);
}

/**
 * Re-renders on every simulated minute (and immediately when the jump offset changes,
 * since `now` is derived fresh every render rather than cached in state — the effect
 * below only subscribes to the interval "external system" to force those re-renders).
 */
export function useNow(seedNowIso: string, jumpOffsetMs: number, intervalMs = 60000): Date {
  const hasMounted = useHasMounted();
  const [loadedAtMs] = useState(() => Date.now());
  const [, forceTick] = useReducer((c: number) => c + 1, 0);
  useEffect(() => {
    const id = setInterval(forceTick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  if (!hasMounted) return new Date(seedNowIso);
  return simNowFrom(seedNowIso, loadedAtMs, jumpOffsetMs);
}
