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

/** Seconds. Mirrors --dur-* in globals.css. */
export const duration = {
  instant: 0.09, // row tint, press
  quick: 0.14, // reveals, crossfades
  base: 0.2, // panels, the check draw
  roll: 0.32, // number roll
  move: 0.42, // undo, theme reveal
  slow: 0.9, // the moved-row wash, aurora fade-in
} as const;

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

export const transition = {
  instant: { duration: duration.instant, ease: ease.out } satisfies Transition,
  quick: { duration: duration.quick, ease: ease.out } satisfies Transition,
  base: { duration: duration.base, ease: ease.out } satisfies Transition,
  roll: { duration: duration.roll, ease: ease.inOut } satisfies Transition,
  move: { duration: duration.move, ease: ease.inOut } satisfies Transition,
  /** Exits use the in-curve: leave quickly, arrive gently. */
  exit: { duration: duration.quick, ease: ease.in } satisfies Transition,
  slow: { duration: duration.slow, ease: ease.out } satisfies Transition,
} as const;
