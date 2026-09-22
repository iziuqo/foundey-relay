"use client";

import { useState, type AnimationEvent } from "react";

/**
 * M8: closing one of the item/check-in/update sheets used to call the real close
 * handler (often `router.back()`) the instant the user dismissed it — which, for the
 * intercepting route, swaps the `@modal` slot to `default.tsx` and unmounts the sheet
 * mid-animation, truncating both Radix's and Vaul's own close transitions. This keeps
 * the sheet mounted (`open` stays true in the DOM) until that transition genuinely
 * finishes, then fires the real close.
 *
 * Radix's `Dialog.Content` already defers unmounting itself while a CSS animation
 * targeting `[data-state="closed"]` runs (Presence, no `forceMount` needed) — its
 * `onAnimationEnd` native DOM event is the signal here. Vaul's `Drawer.Root` exposes
 * the same moment directly via its own `onAnimationEnd(open)` prop.
 */
export function useDeferredClose(onClose: () => void) {
  const [open, setOpen] = useState(true);

  return {
    open,
    requestClose: () => setOpen(false),
    /** Vaul: pass directly as `onAnimationEnd`. Radix Dialog: wrap as `() => onDialogAnimationEnd()`. */
    onAnimationEnd: (isOpen: boolean) => {
      if (!isOpen) onClose();
    },
    onDialogAnimationEnd: (e: AnimationEvent) => {
      if (e.target !== e.currentTarget) return;
      if (!open) onClose();
    },
  };
}
