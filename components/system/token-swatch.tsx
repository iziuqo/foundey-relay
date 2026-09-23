"use client";

import { formatOklch, useTokenValue } from "./use-token-value";

// This is /system's own inspection tooling, not a domain component: the token name is
// a runtime string, so there is no static utility class that could show its color.
// That's the narrow, documented exception the inline-style lint rule carves out
// (eslint.config.mjs) — everything else keeps using token classes.

export function TokenSwatch({ varName, label }: { varName: string; label: string }) {
  const { ref, value } = useTokenValue(varName);
  return (
    <div className="flex items-center gap-3">
      <span
        ref={ref}
        aria-hidden
        // eslint-disable-next-line react/forbid-dom-props
        style={{ backgroundColor: `var(${varName})` }}
        className="size-9 shrink-0 rounded-(--r-2) border border-(--line-1)"
      />
      <div className="min-w-0">
        <p className="t-meta truncate text-(--text-1)">{label.replace(/^--/, "")}</p>
        <p className="t-mono truncate text-(--text-2)">{value ? formatOklch(value) : "…"}</p>
      </div>
    </div>
  );
}
