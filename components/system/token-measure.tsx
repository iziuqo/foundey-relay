"use client";

import { useTokenValue } from "./use-token-value";

/**
 * Shows a non-colour token as the thing it is — a radius as a corner, a height as a
 * bar — with the value the cascade currently resolves it to. `kind="text"` is the
 * degenerate case: a duration or an easing curve has nothing to draw, so it prints.
 *
 * Inline styles again, for the same reason as TokenSwatch: the token name is a runtime
 * string, so no static utility could carry it.
 */
export function TokenMeasure({
  varName,
  kind,
}: {
  varName: string;
  kind: "radius" | "height" | "text";
}) {
  const { ref, value } = useTokenValue<HTMLSpanElement>(varName, "raw");
  const shown = value ? value.replace("rem", "rem").trim() : "…";

  if (kind === "text") {
    return (
      <span ref={ref} className="t-mono text-(--text-2)">
        {shown}
      </span>
    );
  }

  if (kind === "radius") {
    return (
      <span className="flex items-center gap-2">
        <span
          ref={ref}
          aria-hidden
          // eslint-disable-next-line react/forbid-dom-props
          style={{ borderRadius: `var(${varName})` }}
          className="size-9 shrink-0 border border-(--line-2) bg-(--surface-2)"
        />
        <span className="t-mono w-12 shrink-0 text-(--text-2)">{shown}</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className="flex h-12 w-9 shrink-0 items-end justify-center rounded-(--r-1) bg-(--surface-2)"
      >
        <span
          ref={ref}
          // eslint-disable-next-line react/forbid-dom-props
          style={{ height: `var(${varName})` }}
          className="w-5 rounded-t-(--r-1) bg-(--text-3)"
        />
      </span>
      <span className="t-mono w-12 shrink-0 text-(--text-2)">{shown}</span>
    </span>
  );
}
