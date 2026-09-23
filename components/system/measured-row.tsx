"use client";

import { useEffect, useRef, useState } from "react";

interface Reading {
  tag: string;
  height: number;
  radius: number;
  center: number;
}

/**
 * Renders a row of controls and reports what the browser measured for each one:
 * height, corner radius, and the y of its vertical centre.
 *
 * The readout is the contract made visible. Two things it catches that a screenshot
 * cannot: a control whose radius no longer matches its height (v2 computed r12 on
 * everything from h28 to h48), and two controls in one row sitting on different
 * centres. `tests/e2e/craft.spec.ts` asserts the same two facts; this is where a
 * designer sees them.
 */
export function MeasuredRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [readings, setReadings] = useState<Reading[]>([]);

  useEffect(() => {
    const measure = () => {
      const root = ref.current;
      if (!root) return;
      const controls = root.querySelectorAll<HTMLElement>("button, input, select");
      setReadings(
        Array.from(controls).map((node) => {
          const box = node.getBoundingClientRect();
          return {
            tag: node.tagName.toLowerCase(),
            height: Math.round(box.height),
            radius: Math.round(parseFloat(getComputedStyle(node).borderTopLeftRadius)),
            center: Math.round(box.top + box.height / 2),
          };
        }),
      );
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, [children]);

  const heights = new Set(readings.map((r) => r.height));
  const centers = new Set(readings.map((r) => r.center));
  const consistent = readings.length > 0 && heights.size === 1 && centers.size === 1;

  return (
    <div className="flex flex-col gap-2 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-4">
      <div ref={ref} className="flex flex-wrap items-center gap-3">
        {children}
      </div>
      <p className="t-mono text-(--text-2)">
        {readings.length === 0
          ? "…"
          : `${label} · h ${[...heights].join("/")} · r ${[...new Set(readings.map((r) => r.radius))].join("/")} · ${
              consistent ? "one height, one centre" : "MISMATCH"
            }`}
      </p>
    </div>
  );
}
