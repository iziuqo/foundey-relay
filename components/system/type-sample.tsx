"use client";

import { useComputedStyle } from "./use-computed-style";

export interface TypeRole {
  role: string;
  /** Full literal Tailwind classes for the sample text — Tailwind's scanner needs the
   *  complete class string in source, so this can't be composed from a var name at
   *  runtime (see the call sites in foundations-page.tsx). */
  className: string;
  varLabel: string;
  where: string;
  sample: string;
}

export function TypeSample({ role, className, varLabel, where, sample }: TypeRole) {
  const { ref, value } = useComputedStyle<HTMLParagraphElement>("fontSize");
  const px = value ? parseFloat(value) : null;
  return (
    <div className="grid grid-cols-[7rem_1fr_10rem] items-baseline gap-4 border-b border-(--border-1) py-4 last:border-0">
      <div>
        <p className="text-(length:--text-meta) font-semibold text-(--text-1)">{role}</p>
        <p className="text-(length:--text-kbd) text-(--text-2)">{where}</p>
        <p className="tnum text-(length:--text-kbd) text-(--text-2)">{varLabel}</p>
      </div>
      <p ref={ref} className={className + " truncate"}>
        {sample}
      </p>
      <p className="tnum text-right text-(length:--text-kbd) text-(--text-2)">
        {px ? `${px.toFixed(1)}px` : "…"} · min 14: {px === null ? "…" : px >= 14 ? "yes" : "NO"}
      </p>
    </div>
  );
}
