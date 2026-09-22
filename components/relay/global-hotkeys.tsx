"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/state/store";
import { resolveHotkey } from "@/state/hotkeys";
import { useIsDesktopShell } from "./use-media-query";

/**
 * §8.5: the page-independent third of the one hotkey module — ⌘Z, ⌘K, and "?" don't
 * depend on which screen is mounted, unlike J/K/E/H which need a page's own hero and
 * row state (those stay local, e.g. app/(app)/work/page.tsx). Mounted once in the app
 * shell. ⌘K opens the palette at the desktop shell's breakpoint (§5's 1024 line, same
 * as the sidebar/dock split) and goes to the /lookup page below it, matching §6.5.
 */
export function GlobalHotkeys() {
  const undo = useStore((s) => s.undo);
  const togglePalette = useStore((s) => s.togglePalette);
  const openShortcuts = useStore((s) => s.openShortcuts);
  const isDesktopShell = useIsDesktopShell();
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const name = resolveHotkey(event, event.target as HTMLElement | null);
      if (!name) return;
      if (name === "undo") {
        event.preventDefault();
        undo();
      } else if (name === "palette") {
        event.preventDefault();
        if (isDesktopShell) togglePalette();
        else router.push("/lookup");
      } else if (name === "shortcutsHelp") {
        event.preventDefault();
        openShortcuts();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, togglePalette, openShortcuts, isDesktopShell, router]);

  return null;
}
