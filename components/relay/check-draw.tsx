"use client";

import { motion, useReducedMotionConfig } from "motion/react";
import { transition } from "@/lib/motion";

/**
 * M4 ①: the check that draws itself across the hero card the moment an item is marked
 * done — the first beat of the signature sequence, and the only confirmation the user
 * gets before the card they were reading is replaced by a different one.
 *
 * It renders on the *outgoing* hero (hero.tsx, `!isPresent`), which `popLayout` has
 * already lifted out of the flow, so the incoming hero is free to arrive underneath it
 * at the same time. That parallelism is what fits ① through ⑥ into 700ms without any
 * step waiting on the one before it.
 *
 * Success is one of exactly two places hue is allowed to mean something other than
 * priority (plan §4.5), and this is the moment it means it. Reduced motion renders the
 * path already complete: the check is information, and the drawing is the decoration —
 * only the decoration goes.
 */
export function CheckDraw() {
  // `MotionConfig reducedMotion` switches off transform and layout animation and nothing
  // else, so a path drawing itself (`pathLength`) kept drawing under it — /system/motion's
  // Reduced stage showed the same curve as the Full one. The hook reads the same setting
  // the config does (`useReducedMotion()` would ignore an `"always"` on a stage).
  const reduced = useReducedMotionConfig();
  return (
    <motion.svg
      aria-hidden
      data-testid="check-draw"
      viewBox="0 0 48 48"
      // No `exit` of its own, deliberately. It mounts *into* an already-exiting subtree,
      // and a child that registers an exit animation there is a child AnimatePresence
      // then waits on — an exit that can only start once the parent is removed, which is
      // the removal it is blocking. The card fades out around it instead.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={transition.instant}
      // z-10 and last in the card, so it draws *over* the content it is confirming.
      // Painted underneath (its first position, before the content wrapper) it came out
      // as a faint tick tangled in the title and the why-sentence — the one beat of the
      // sequence that has to be unmistakable, rendered as the least legible thing on the
      // card.
      className="pointer-events-none absolute inset-0 z-10 m-auto size-16 text-(--success-fg)"
    >
      <motion.path
        d="M12 25.5 L20.5 34 L36 15"
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={transition.base}
      />
    </motion.svg>
  );
}
