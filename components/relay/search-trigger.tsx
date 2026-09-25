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
      className="tap-48 flex h-(--h-md) items-center gap-2 rounded-(--r-3) border border-(--line-1) bg-(--surface-1) px-3 text-(--text-2) transition-colors hover:border-(--line-2) hover:text-(--text-1) focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus) sm:w-56 sm:justify-between md:w-72"
    >
      <span className="flex items-center gap-2">
        <Search className="icon-sm shrink-0" aria-hidden />
        <span className="t-meta hidden truncate sm:inline">{copy.search}</span>
      </span>
      <kbd data-kbd className="tnum t-mono hidden shrink-0 rounded-(--r-2) border border-(--line-1) bg-(--surface-2) px-1.5 py-0.5 sm:inline-block">
        ⌘K
      </kbd>
    </button>
  );
}
