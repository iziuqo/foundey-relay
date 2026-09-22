import type { Transition } from "motion/react";

/**
 * §7.1 motion tokens. Durations are seconds (Motion's unit); the CSS custom properties
 * in globals.css (--dur-instant etc.) carry the same values for Tailwind-only
 * transitions, so the two systems never drift apart. Motion has one job (§7): show
 * where things went. Nothing loops except the aurora, and nothing moves while the user
 * is reading unless the user caused it.
 */
export const duration = {
  instant: 0.09,
  quick: 0.16,
  base: 0.24,
  slow: 0.6,
} as const;

export const ease = {
  out: [0.2, 0.8, 0.2, 1] as const,
};

export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 38 } satisfies Transition,
  sheet: { type: "spring", stiffness: 380, damping: 36 } satisfies Transition,
} as const;

export const transition = {
  instant: { duration: duration.instant, ease: "easeOut" } satisfies Transition,
  quick: { duration: duration.quick, ease: "easeOut" } satisfies Transition,
  base: { duration: duration.base, ease: ease.out } satisfies Transition,
  slow: { duration: duration.slow } satisfies Transition,
} as const;
