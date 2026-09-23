"use client";

import { useEffect, useRef } from "react";
import { toast as sonnerToast } from "sonner";
import { useStore } from "@/state/store";
import { prefersReducedMotion } from "@/lib/motion";
import { Toast } from "@/components/ui/toast";
import { UndoToast } from "./undo-toast";

/**
 * Bridges the store's toast state (set by every action in state/store.ts) onto Sonner.
 * The store owns *what* to say and whether it's undoable; Sonner owns the stacking,
 * swipe-to-dismiss, and auto-close timing. `undoSnapshot` in the store stays live until
 * the toast is consumed — this is what lets ⌘Z and the button agree on what "undo" means.
 *
 * Every toast goes through `toast.custom` and the same `Toast` shell. Undoable ones put
 * `UndoToast` in the shell's action slot; the rest are the shell with a message. Sonner's
 * own toast styling is off (`unstyled`, app/(app)/layout.tsx), so there is exactly one
 * toast design in the app rather than ours for undo and Sonner's for everything else.
 *
 * M6's reduced-motion variant is the one thing that changes behaviour rather than
 * appearance: **the toast holds for 12s instead of 8.** Someone who has asked for less
 * motion is quite likely reading rather than tracking a thing that slid into a corner,
 * and the entrance that would have caught their eye is the thing reduced motion removes.
 */
export function ToastBridge() {
  const toast = useStore((s) => s.toast);
  const undo = useStore((s) => s.undo);
  const clearToast = useStore((s) => s.clearToast);
  const lastKey = useRef<number | null>(null);

  useEffect(() => {
    if (!toast || toast.key === lastKey.current) return;
    lastKey.current = toast.key;
    const durationMs = prefersReducedMotion() ? Math.round(toast.durationMs * 1.5) : toast.durationMs;
    sonnerToast.custom(
      () => (
        <Toast
          message={toast.message}
          action={toast.undoable ? <UndoToast durationMs={durationMs} onUndo={() => undo()} /> : undefined}
        />
      ),
      { duration: durationMs, onDismiss: () => clearToast(), onAutoClose: () => clearToast() },
    );
  }, [toast, undo, clearToast]);

  return null;
}
