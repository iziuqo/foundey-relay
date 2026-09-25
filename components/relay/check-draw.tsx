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
      // No opacity ramp on the way in. v4 — the svg faded in over 90ms *while* the path
      // drew, so the first third of the only confirmation the user gets was rendered at
      // partial alpha over a card that was itself fading out. The draw is the entrance.
      //
      // It does have an exit now, which it could not have when it mounted *into* the
      // exiting card's subtree (a child that registers an exit there is one more thing
      // AnimatePresence waits on before removing the parent — a deadlock). It renders in
      // the slot instead, under an AnimatePresence of its own, and leaves on the beat the
      // promoted card arrives on: the two crossfade rather than one popping off the other.
      // It swells and lifts as it goes, rather than dissolving in place. The promoted
      // card rises into this same space while the check is still on its way out — that
      // overlap is unavoidable, because the draw cannot be cut short and the slot must
      // not sit empty — so the exit has to read as *departing*. Fading without moving
      // read, for about a tenth of a second, as a tick labelling the card underneath it.
      exit={{ opacity: 0, scale: 1.2, y: -10, transition: transition.exit }}
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
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={transition.base}
      />
    </motion.svg>
  );
}
