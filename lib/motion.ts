import type { Transition } from "motion/react";

/**
 * Motion tokens — v3 M1. The catalog they serve is plan/redesign/v3/ADVISOR-craft.md
 * §6: eighteen named moments, each with its duration, curve, stagger and reduced
 * variant. M8 implements that catalog; this file is the vocabulary it uses.
 *
 * Two rules the tokens exist to enforce:
 *
 *   1. **No component may inline a curve.** v2 shipped three different curves — its
 *      own, Tailwind's default cubic-bezier(0.4, 0, 0.2, 1), and a stray 150ms — across
 *      41 animated elements, which is what makes an interface read as several people's
 *      work rather than one.
 *   2. **These values and the CSS custom properties in globals.css are the same
 *      numbers.** Tailwind utilities and Motion's `transition` prop read from different
 *      places, so the two are kept in sync by hand; durations are seconds here and ms
 *      there. If you change one, change the other in the same commit.
 *
 * Nothing here exceeds 700ms. Nothing loops except the all-clear aurora. Nothing moves
 * while the user is reading the hero unless the user caused it.
 */

/** Seconds. Mirrors --dur-* in globals.css, one entry per value the catalog names. */
export const duration = {
  pressIn: 0.08, // M3 press down
  pressOut: 0.12, // M3 release · M13 the palette's selection glide
  instant: 0.09, // M1 row tint
  quick: 0.14, // M1 action cluster · M4 hero exit · M5 hero crossfade
  scrim: 0.16, // M13 scrim · M6 toast exit
  fill: 0.18, // M10 popover panel · M16 skeleton crossfade
  base: 0.2, // M4 the check draw · M13 palette panel · M15 tab pill
  toast: 0.22, // M6 toast entrance
  bars: 0.24, // M10 the weight bars
  band: 0.26, // M9 the new-urgent band's slide
  roll: 0.32, // M7, M18 number roll
  move: 0.42, // M5 undo · M14 theme reveal · M17 headline
  flash: 0.5, // M18 the hairline flash, on increase only
  hue: 0.6, // M7 the countdown's one hue shift
  sweep: 0.7, // M9 the tier rail's sweep, once ever per arrival
  slow: 0.9, // M8 the moved-row wash · M17 the aurora fading in
} as const;

/**
 * Seconds between one staggered child and the next, and the cap on how many children
 * stagger at all. The cap is the point: a 24ms stagger down a twelve-row list is a
 * 288ms wave, which is the list visibly rippling rather than the gap closing. Past the
 * cap every remaining child moves with the last staggered one.
 */
export const stagger = {
  /** M4 ④ — the gap closing under the promoted row. */
  rows: { step: 0.024, max: 5 },
  /** M11 — the detail sheet's inner sections. */
  sections: { step: 0.028, max: 4 },
  /** M16 — skeleton blocks crossfading to content. */
  skeleton: { step: 0.03, max: 6 },
  /** M17 — the done-today list on the all-clear screen. */
  allClear: { step: 0.04, max: 8 },
  /** M10 — the four weight bars in the why-popover. */
  bars: { step: 0.05, max: 4 },
} as const;

/** The delay for the `index`-th child of a staggered group, in seconds. */
export function stepDelay(index: number, group: { step: number; max: number }): number {
  return Math.min(index, group.max) * group.step;
}

/** Mirrors --ease-* in globals.css. Three curves, and these are all of them. */
export const ease = {
  /** Entrances and reveals. */
  out: [0.22, 1, 0.36, 1] as const,
  /** Overlays, sheets, anything that glides between two states. */
  inOut: [0.32, 0.72, 0, 1] as const,
  /** Exits only. */
  in: [0.4, 0, 1, 1] as const,
};

/**
 * Two springs. `layout` is the one that moves rows and promotes an item into the hero
 * (≈380ms, no overshoot — an overshooting queue row reads as a bug, not as life).
 * `sheet` is for surfaces that slide in from an edge (≈520ms, ~3% overshoot).
 */
export const spring = {
  layout: { type: "spring", stiffness: 480, damping: 42, mass: 1 } satisfies Transition,
  sheet: { type: "spring", stiffness: 340, damping: 34, mass: 1 } satisfies Transition,
} as const;

/**
 * Named tweens. A component reaches for one of these; it never writes a `transition`
 * object of its own, which is the rule the `no inlined curve` unit test enforces.
 */
export const transition = {
  instant: { duration: duration.instant, ease: ease.out } satisfies Transition,
  quick: { duration: duration.quick, ease: ease.out } satisfies Transition,
  scrim: { duration: duration.scrim, ease: ease.inOut } satisfies Transition,
  fill: { duration: duration.fill, ease: ease.out } satisfies Transition,
  base: { duration: duration.base, ease: ease.out } satisfies Transition,
  /** M15's pill and M13's selection highlight: glides between two states, not entrances. */
  glide: { duration: duration.base, ease: ease.inOut } satisfies Transition,
  highlight: { duration: duration.pressOut, ease: ease.inOut } satisfies Transition,
  toast: { duration: duration.toast, ease: ease.out } satisfies Transition,
  bars: { duration: duration.bars, ease: ease.out } satisfies Transition,
  band: { duration: duration.band, ease: ease.out } satisfies Transition,
  roll: { duration: duration.roll, ease: ease.inOut } satisfies Transition,
  move: { duration: duration.move, ease: ease.inOut } satisfies Transition,
  /** Exits use the in-curve: leave quickly, arrive gently. */
  exit: { duration: duration.quick, ease: ease.in } satisfies Transition,
  toastExit: { duration: duration.scrim, ease: ease.in } satisfies Transition,
  slow: { duration: duration.slow, ease: ease.out } satisfies Transition,
} as const;

/**
 * The one place that asks the media query directly. Motion's own components are covered
 * by `<MotionConfig reducedMotion="user">` and plain CSS by the rule in globals.css —
 * this is for the handful of moments driven by hand (the theme reveal's View Transition,
 * M5's flight from the toast, the timers that hold an exiting node on screen while its
 * exit plays), none of which either of those can reach.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
