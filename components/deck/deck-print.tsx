"use client";

import { deckSlides } from "./deck-content";

/** §6.8 / §8.2: every slide, full size, stacked — one PDF page each under
 * `@media print` (globals.css). `scripts/export-deck.mjs` drives this route with
 * Playwright; nothing here is interactive (no DeckShell, no scaling transform). A
 * Client Component (not just the page) because the slides it composes reach Motion,
 * NumberFlow, and lib/time.ts — all client-only. */
export function DeckPrint() {
  return (
    <main className="flex flex-col items-center bg-(--surface-2) py-8 print:bg-(--bg) print:py-0">
      {deckSlides.map(({ Component, label }, i) => (
        <div
          key={label}
          data-deck-print-slide
          className="mb-8 shrink-0 shadow-(--e2) print:mb-0 print:shadow-none"
        >
          <Component n={i + 1} total={deckSlides.length} />
        </div>
      ))}
    </main>
  );
}
