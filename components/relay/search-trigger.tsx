"use client";

import { Search } from "lucide-react";
import { copy } from "@/lib/copy";
import { useOpenSearch } from "./use-open-search";

/** §6.5: the top bar's own way into the palette, next to the global ⌘K. Below the
 * desktop shell's breakpoint `useOpenSearch` goes to /lookup instead of opening a
 * dialog, so this same button is correct at every width. */
export function SearchTrigger() {
  const openSearch = useOpenSearch();
  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label={copy.search}
      className="flex h-(--size-control-md) items-center gap-2 rounded-(--radius-control) border border-(--border-1) bg-(--surface-1) px-3 text-(--text-2) transition-colors hover:border-(--border-2) hover:text-(--text-1) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg) sm:w-56 sm:justify-between md:w-72"
    >
      <span className="flex items-center gap-2">
        <Search className="size-(--size-icon-sm) shrink-0" aria-hidden />
        <span className="hidden truncate text-(length:--text-meta) sm:inline">{copy.search}</span>
      </span>
      <kbd
        data-kbd
        className="tnum hidden shrink-0 rounded-(--radius-chip) border border-(--border-1) bg-(--surface-2) px-1.5 py-0.5 text-(length:--text-kbd) leading-(length:--leading-kbd) text-(--text-2) sm:inline-block"
      >
        ⌘K
      </kbd>
    </button>
  );
}
