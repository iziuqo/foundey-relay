"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/state/store";
import { useIsDesktopShell } from "./use-media-query";

/** Decides whether ⌘K (or the top bar search field) opens the palette in place, or —
 * below the desktop shell's breakpoint — goes to the /lookup full page instead (§6.5).
 *
 * Lives outside command-palette.tsx (which pulls in `cmdk`) so the top bar's always
 * visible search trigger doesn't drag the palette's own chunk into the initial /work
 * bundle — that chunk loads only when `CommandPalette` itself mounts (dynamic import
 * in (app)/layout.tsx). See §8's G8 gate. */
export function useOpenSearch(): () => void {
  const isDesktopShell = useIsDesktopShell();
  const openPalette = useStore((s) => s.openPalette);
  const router = useRouter();
  return () => {
    if (isDesktopShell) openPalette();
    else router.push("/lookup");
  };
}
