"use client";

import { useEffect, useReducer } from "react";

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

/**
 * Re-renders on every simulated minute (and immediately when the jump offset changes,
 * since `now` is derived fresh every render rather than cached in state — the effect
 * below only subscribes to the interval "external system" to force those re-renders).
 */
export function useNow(
  seedNowIso: string,
  loadedAtMs: number,
  jumpOffsetMs: number,
  intervalMs = 60000,
): Date {
  const [, forceTick] = useReducer((c: number) => c + 1, 0);
  useEffect(() => {
    const id = setInterval(forceTick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return simNowFrom(seedNowIso, loadedAtMs, jumpOffsetMs);
}
