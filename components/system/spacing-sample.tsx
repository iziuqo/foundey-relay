"use client";

import { useComputedStyle } from "./use-computed-style";

export function SpacingSample({ sizeClass, label }: { sizeClass: string; label: string }) {
  const { ref, value } = useComputedStyle<HTMLDivElement>("height");
  return (
    <div className="flex items-center gap-3">
      <div ref={ref} className={sizeClass + " rounded-(--radius-chip) bg-(--accent)"} />
      <p className="tnum text-(length:--text-meta) text-(--text-2)">
        {label} · {value || "…"}
      </p>
    </div>
  );
}
