import { copy } from "@/lib/copy";

export interface RingLabel {
  /** A bare numeral at `t-hero`, the common case: the ring itself is the unit. */
  bare: boolean;
  /** The number shown large. For `bare`, minutes; otherwise minutes or whole hours. */
  magnitude: number;
  /** Glued to the magnitude, not set on its own line. Only a late label uses it, which
   * is what frees the line below to carry the word "late". Empty otherwise — including
   * for a late value under an hour, where minutes is the ring's own implicit unit. */
  magnitudeUnit: string;
  /** The type step the magnitude is set in. It lives here rather than in the component
   * because `craft.spec.ts` measures each candidate against the ring's chord *at that
   * step's line height*, and a size the test did not know about is a size it would
   * measure in the wrong place. */
  magnitudeStep: "t-hero-sm" | "t-section";
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
 *    late something is: 115 minutes late is "2h", not "1h".
 *  - A late label spends its second line on the word "late" rather than on the unit, and
 *    carries the unit up beside the magnitude instead. v4 — the hero became a late item
 *    for the first time (the brief's own Order #4821) and the ring read "2" over "H"
 *    inside an empty grey circle, which is indistinguishable from a clock that has not
 *    started. The arc being empty is a signal only once you know which direction it ran.
 */
export function ringLabel(minutes: number): RingLabel {
  const late = minutes < 0;
  const abs = Math.abs(minutes);
  if (!late && abs < 100)
    return { bare: true, magnitude: abs, magnitudeUnit: "", magnitudeStep: "t-hero-sm", unit: "" };
  const overAnHour = abs >= 100;
  const magnitude = overAnHour ? (late ? Math.ceil(abs / 60) : Math.floor(abs / 60)) : abs;
  const unit = overAnHour ? copy.time.unitHour : copy.time.unitMinute;
  // Late: "2h" or "88" over "late". Future: "22" over "h", unchanged — a ring that is
  // still filling does not need a word, because the arc already says which way it runs.
  if (late) {
    // Minutes are left implicit — "88" over "late" is 88 minutes late, the same reading
    // the bare countdown already asks for, and the only one that fits: "88m" measures
    // 59px into a 42px chord at `t-hero-sm` and 49 into 45 a step down. Hours are
    // explicit, because "2" over "late" beside a 50-minute truck clock is not a
    // number anyone should have to guess the unit of.
    return {
      bare: false,
      magnitude,
      magnitudeUnit: overAnHour ? copy.time.unitHour : "",
      magnitudeStep: overAnHour ? "t-section" : "t-hero-sm",
      unit: copy.time.unitLate,
    };
  }
  return { bare: false, magnitude, magnitudeUnit: "", magnitudeStep: "t-hero-sm", unit };
}
