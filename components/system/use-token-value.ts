"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/state/store";

/**
 * Reads a token's value from the DOM, from the probe node's own position in the tree —
 * so it picks up whichever theme/fidelity panel it is nested in (the global <html>
 * attributes, or a local data-theme="dark" preview box on this page), not just :root.
 * Re-reads on the next frame after every theme/fidelity change.
 *
 * `as: "color"` paints the probe with the token and reads the *used* value back, which
 * is the only way to get a resolvable color out of these tokens: the declared value of,
 * say, --act-bg is `oklch(.945 calc(.03 * var(--chroma)) 27)`, and printing that string
 * is neither readable by a person nor parseable by the contrast math. Painting lets the
 * engine resolve the var() chain and the calc() first, so what comes back is a plain
 * `oklch(0.945 0.03 27)` — the number that is actually on screen.
 *
 * (v2 printed the raw declared value here, which is why every swatch on this page was
 * captioned with an unreadable `lab(…)` string.)
 */
export function useTokenValue<T extends HTMLElement = HTMLSpanElement>(
  varName: string,
  as: "color" | "raw" = "color",
) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState("");
  const theme = useStore((s) => s.theme);
  const wireframe = useStore((s) => s.wireframe);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const node = ref.current;
      if (!node) return;
      if (as === "raw") {
        setValue(getComputedStyle(node).getPropertyValue(varName).trim());
        return;
      }
      const previous = node.style.backgroundColor;
      node.style.backgroundColor = `var(${varName})`;
      const used = getComputedStyle(node).backgroundColor;
      node.style.backgroundColor = previous;
      setValue(used);
    });
    return () => cancelAnimationFrame(id);
  }, [varName, as, theme, wireframe]);

  return { ref, value };
}

/** `oklch(0.945 0.03 27)` → `L .945 · C .030 · H 27`, which a person can compare at a glance. */
export function formatOklch(value: string): string {
  const match = value.match(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/);
  if (!match) return value;
  const [, l, c, h] = match;
  const lightness = l.endsWith("%") ? (Number(l.slice(0, -1)) / 100).toFixed(3) : Number(l).toFixed(3);
  return `L ${lightness} · C ${Number(c).toFixed(3)} · H ${Math.round(Number(h))}`;
}
