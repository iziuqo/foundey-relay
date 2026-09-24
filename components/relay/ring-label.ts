import { copy } from "@/lib/copy";

export interface RingLabel {
  /** A bare numeral at `t-hero`, the common case: the ring itself is the unit. */
  bare: boolean;
  /** The number shown large. For `bare`, minutes; otherwise minutes or whole hours. */
  magnitude: number;
  /** The small line under a split label. Empty when `bare`. */
  unit: string;
}

/**
 * What the hero countdown puts inside its ring, as a pure function of minutes remaining
 * (negative when late).
 *
 * It lives here, apart from the component, so the tests can enumerate **what the component
 * actually produces** rather than a list of strings someone typed into a spec. That
 * distinction is the whole reason this file exists: M15's first attempt at a regression
 * test measured the strings the *fixed* component made, so it passed against the broken
 * one and proved nothing. `tests/e2e/craft.spec.ts` now walks this function over the whole
 * range, collects every distinct unit it can return, and measures each one on the real
 * element — so a unit that stops fitting fails, whoever adds it.
 *
 * Rules:
 *  - Under 100 minutes and not late: a bare numeral. This is nearly every hero.
 *  - Otherwise the label splits, and the unit line carries the **unit only**. Its space is
 *    the ring's chord at that line's height — about 46px, not the 72px box — where "MIN"
 *    is 28px and "H" is 10px, but "MIN LATE" is 64px and collided with the stroke.
 *  - Late magnitudes round **up**, future ones down, so the ring never under-reports how
 *    late something is: 115 minutes late is "2 H", not "1 H".
 */
export function ringLabel(minutes: number): RingLabel {
  const late = minutes < 0;
  const abs = Math.abs(minutes);
  if (!late && abs < 100) return { bare: true, magnitude: abs, unit: "" };
  const overAnHour = abs >= 100;
  return {
    bare: false,
    magnitude: overAnHour ? (late ? Math.ceil(abs / 60) : Math.floor(abs / 60)) : abs,
    unit: overAnHour ? copy.time.unitHour : copy.time.unitMinute,
  };
}
