"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/state/store";

/**
 * Reads a custom property's *resolved* value from the DOM, from the probe node's own
 * position in the tree — so it picks up whichever theme/fidelity panel it's nested in
 * (global <html> attrs, or a local data-theme="dark" preview box on /system), not just
 * :root. Re-reads on the next frame after every store theme/fidelity change, since
 * that's what flips the attributes Providers.tsx applies (app/providers.tsx).
 */
export function useTokenValue<T extends HTMLElement = HTMLSpanElement>(varName: string) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState("");
  const theme = useStore((s) => s.theme);
  const wireframe = useStore((s) => s.wireframe);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!ref.current) return;
      setValue(getComputedStyle(ref.current).getPropertyValue(varName).trim());
    });
    return () => cancelAnimationFrame(id);
  }, [varName, theme, wireframe]);

  return { ref, value };
}
