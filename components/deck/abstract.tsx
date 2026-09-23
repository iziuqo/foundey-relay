"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * §8.3 — abstract the context, render the subject (`mk01`: Vercel draws the surrounding
 * UI as flat grey bars and renders only the comment card at full fidelity).
 *
 * Wrap a live screen in this and mark the subject `data-deck-focus`. Every element that
 * owns text outside the subject is tagged `data-ghost`, and globals.css turns that text
 * into a bar of the same box. The screen is still the real component tree, so the one
 * slide that needs it — the cover, a live hero over a ghosted queue — is the argument as
 * a picture, not a drawing of one.
 *
 * It tags with an attribute rather than rewriting text nodes: React owns those nodes, and
 * an attribute is the one thing it never diffs away. The embeds are frozen snapshots, so
 * one pass after mount is enough; the layout effect keeps the ghosts from ever painting
 * as text first.
 */
export function Abstract({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const owner = node.parentElement;
      if (!owner || !node.textContent?.trim()) continue;
      if (owner.closest("[data-deck-focus]")) continue;
      owner.setAttribute("data-ghost", "");
    }
  });

  return (
    <div ref={ref} data-deck-abstract className={cn("contents", className)}>
      {children}
    </div>
  );
}
