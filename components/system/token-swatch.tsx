"use client";

import { useTokenValue } from "./use-token-value";

// This is /system's own inspection tooling, not a domain component: the token name is
// a runtime string, so there is no static utility class that could show its color.
// That's the narrow, documented exception the inline-style lint rule carves out
// (eslint.config.mjs, plan §9.2 P1 9-11) — everything else keeps using token classes.

export function TokenSwatch({ varName, label }: { varName: string; label: string }) {
  const { ref, value } = useTokenValue(varName);
  return (
    <div className="flex items-center gap-3">
      <span
        ref={ref}
        aria-hidden
        // eslint-disable-next-line react/forbid-dom-props
        style={{ backgroundColor: `var(${varName})` }}
        className="size-10 shrink-0 rounded-(--radius-chip) border border-(--border-1)"
      />
      <div className="min-w-0">
        <p className="truncate text-(length:--text-meta) font-medium text-(--text-1)">{label}</p>
        <p className="tnum truncate text-(length:--text-kbd) text-(--text-2)">{value || "…"}</p>
      </div>
    </div>
  );
}
