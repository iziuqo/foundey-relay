"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders a list and prints what the browser measured for each row. The rules page uses
 * it to make "one height per row" checkable by eye: the readout reads `64 · 64 · 64` for
 * the row that obeys the rule and something like `63 · 88 · 67` for the one that does
 * not — the numbers v2 actually shipped.
 */
export function HeightReadout({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    const measure = () => {
      const rows = ref.current?.querySelectorAll<HTMLElement>(":scope > li") ?? [];
      setHeights(Array.from(rows).map((row) => Math.round(row.getBoundingClientRect().height)));
    };
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);
    measure();
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <ul ref={ref} className={className}>
        {children}
      </ul>
      <p className="t-mono text-(--text-2)" data-testid="row-heights">
        {heights.length === 0 ? "…" : `${heights.join(" · ")} px`}
      </p>
    </>
  );
}
