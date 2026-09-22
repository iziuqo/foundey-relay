"use client";

import { useSyncExternalStore } from "react";

/** Client-only match, no SSR value to reconcile against (`getServerSnapshot` is never
 * read by anything that hydrates — every caller here only mounts after navigation). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** §5: the shell's own desktop/handheld line — collapsed sidebar and a right sheet at
 * 1024 and up (Sidebar's `lg:flex`, BottomDock's `lg:hidden`); a bottom dock and a
 * bottom sheet below it. Item detail and the command palette switch shells here too. */
export function useIsDesktopShell(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
