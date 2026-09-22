"use client";

import { useEffect, useRef } from "react";
import { toast as sonnerToast } from "sonner";
import { useStore } from "@/state/store";
import { copy } from "@/lib/copy";

/**
 * Bridges the store's toast state (set by every action in state/store.ts) onto Sonner.
 * The store owns *what* to say and whether it's undoable; Sonner owns the stacking,
 * swipe-to-dismiss, and auto-close timing (§8.1). `undoSnapshot` in the store stays
 * live until the toast is consumed — this is what lets ⌘Z (phase 4) and this button
 * agree on what "undo" means.
 */
export function ToastBridge() {
  const toast = useStore((s) => s.toast);
  const undo = useStore((s) => s.undo);
  const clearToast = useStore((s) => s.clearToast);
  const lastKey = useRef<number | null>(null);

  useEffect(() => {
    if (!toast || toast.key === lastKey.current) return;
    lastKey.current = toast.key;
    sonnerToast(toast.message, {
      duration: toast.durationMs,
      action: toast.undoable ? { label: copy.actions.undo, onClick: () => undo() } : undefined,
      onDismiss: () => clearToast(),
      onAutoClose: () => clearToast(),
    });
  }, [toast, undo, clearToast]);

  return null;
}
