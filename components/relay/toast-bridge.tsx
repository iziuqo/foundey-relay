"use client";

import { useEffect, useRef } from "react";
import { toast as sonnerToast } from "sonner";
import { useStore } from "@/state/store";
import { UndoToast } from "./undo-toast";

/**
 * Bridges the store's toast state (set by every action in state/store.ts) onto Sonner.
 * The store owns *what* to say and whether it's undoable; Sonner owns the stacking,
 * swipe-to-dismiss, and auto-close timing (§8.1). `undoSnapshot` in the store stays
 * live until the toast is consumed — this is what lets ⌘Z (phase 4) and this button
 * agree on what "undo" means. Undoable toasts render `UndoToast` (M1: the countdown
 * ring and `⌘Z` hint) via `toast.custom`; everything else stays a plain message.
 */
export function ToastBridge() {
  const toast = useStore((s) => s.toast);
  const undo = useStore((s) => s.undo);
  const clearToast = useStore((s) => s.clearToast);
  const lastKey = useRef<number | null>(null);

  useEffect(() => {
    if (!toast || toast.key === lastKey.current) return;
    lastKey.current = toast.key;
    const options = {
      duration: toast.durationMs,
      onDismiss: () => clearToast(),
      onAutoClose: () => clearToast(),
    };
    if (toast.undoable) {
      sonnerToast.custom(
        () => <UndoToast message={toast.message} durationMs={toast.durationMs} onUndo={() => undo()} />,
        options,
      );
    } else {
      sonnerToast(toast.message, options);
    }
  }, [toast, undo, clearToast]);

  return null;
}
