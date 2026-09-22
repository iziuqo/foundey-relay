import { useEffect, useState } from 'react'

export const TIME_ZONE = 'America/Los_Angeles'

const clockFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function formatClock(date: Date): string {
  return clockFormatter.format(date)
}

export function dayKey(date: Date): string {
  return dayKeyFormatter.format(date)
}

export function isTomorrow(target: Date, from: Date): boolean {
  const nextDay = new Date(from.getTime() + 24 * 60 * 60 * 1000)
  return dayKey(target) === dayKey(nextDay)
}

export function minutesBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 60000)
}

/** "38 min" under an hour, "2 h" or "2 h 10 min" at or beyond an hour. */
export function relativeDuration(minutes: number): string {
  const abs = Math.abs(minutes)
  if (abs < 60) return `${abs} min`
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

/** simNow = seedNow + real elapsed time since load + any demo jump offset. Time runs at 1x, per R5. */
export function simNowFrom(seedNowIso: string, loadedAtMs: number, jumpOffsetMs: number): Date {
  const seedMs = new Date(seedNowIso).getTime()
  return new Date(seedMs + (Date.now() - loadedAtMs) + jumpOffsetMs)
}

/** Re-renders on every simulated minute (and immediately when the jump offset changes). */
export function useNow(seedNowIso: string, loadedAtMs: number, jumpOffsetMs: number, intervalMs = 60000): Date {
  const [now, setNow] = useState(() => simNowFrom(seedNowIso, loadedAtMs, jumpOffsetMs))
  useEffect(() => {
    setNow(simNowFrom(seedNowIso, loadedAtMs, jumpOffsetMs))
    const id = setInterval(() => setNow(simNowFrom(seedNowIso, loadedAtMs, jumpOffsetMs)), intervalMs)
    return () => clearInterval(id)
  }, [seedNowIso, loadedAtMs, jumpOffsetMs, intervalMs])
  return now
}
