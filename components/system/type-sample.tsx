"use client";

import { useEffect, useRef, useState } from "react";
import type { TypeStep } from "./tokens-data";

interface Measured {
  size: string;
  line: string;
  tracking: string;
  weight: string;
  opsz: string;
}

/**
 * Renders one step of the scale at its real size and reports what the browser actually
 * computed for it — size, line height, tracking, weight, optical size.
 *
 * The readout is the point. v2's version printed the font size and "min 14: yes",
 * which could not have caught the thing that was actually wrong: 255 of 256 rendered
 * elements had `letter-spacing: normal`, and the page had no way to show that.
 */
export function TypeSample({ utility, role, where, sample }: TypeStep) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [measured, setMeasured] = useState<Measured | null>(null);

  useEffect(() => {
    const measure = () => {
      const node = ref.current;
      if (!node) return;
      const style = getComputedStyle(node);
      const variation = style.fontVariationSettings;
      setMeasured({
        size: `${parseFloat(style.fontSize).toFixed(0)}px`,
        line: `${parseFloat(style.lineHeight).toFixed(0)}`,
        tracking:
          style.letterSpacing === "normal"
            ? "none"
            : `${(parseFloat(style.letterSpacing) / parseFloat(style.fontSize)).toFixed(3)}em`,
        weight: style.fontWeight,
        opsz: variation && variation !== "normal" ? variation.replace(/"opsz"\s*/, "") : "—",
      });
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-(--line-1) py-5 last:border-0 md:grid-cols-[11rem_1fr_12rem] md:items-baseline md:gap-6">
      <div>
        <p className="t-meta text-(--text-1)">{role}</p>
        <p className="t-mono text-(--text-2)">.{utility}</p>
      </div>
      <div className="min-w-0">
        {/* Each sample carries its step's utility class literally — Tailwind's scanner
            needs the complete class string in source, which is also what makes these
            utilities exist in the build at all. */}
        <p ref={ref} className={`${utility} truncate text-(--text-1)`}>
          {sample}
        </p>
        <p className="t-meta mt-1 text-(--text-2)">{where}</p>
      </div>
      <p className="t-mono text-(--text-2) md:text-right">
        {measured
          ? `${measured.size}/${measured.line} · ${measured.tracking} · ${measured.weight} · opsz ${measured.opsz}`
          : "…"}
      </p>
    </div>
  );
}
