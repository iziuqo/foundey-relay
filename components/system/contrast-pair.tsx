"use client";

import { useTokenValue } from "./use-token-value";
import { contrastBetween } from "@/lib/color";
import { Chip } from "@/components/ui/chip";

function ratingFor(ratio: number | null): { label: string; tier: "success" | "next" | "now" | "neutral" } {
  if (ratio === null) return { label: "…", tier: "neutral" };
  if (ratio >= 7) return { label: "AAA", tier: "success" };
  if (ratio >= 4.5) return { label: "AA", tier: "success" };
  if (ratio >= 3) return { label: "AA large", tier: "next" };
  return { label: "Fails", tier: "now" };
}

export function ContrastPair({
  fgVar,
  bgVar,
  label,
}: {
  fgVar: string;
  bgVar: string;
  label: string;
}) {
  const { ref: fgRef, value: fgValue } = useTokenValue(fgVar);
  const { ref: bgRef, value: bgValue } = useTokenValue(bgVar);
  const ratio = fgValue && bgValue ? contrastBetween(fgValue, bgValue) : null;
  const rating = ratingFor(ratio);

  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-(--r-3) border border-(--line-1) p-3">
      <span ref={fgRef} aria-hidden className="hidden" />
      <span ref={bgRef} aria-hidden className="hidden" />
      <div className="flex min-w-0 items-center gap-2.5">
        {/* A two-tone swatch, not text: some pairs deliberately fail AA (that's what
            "Fails"/"AA large" document), and axe rightly checks *rendered* text glyphs
            regardless of aria-hidden — WCAG 1.4.3 is a sighted-user concern. No glyph
            here means nothing for that rule to evaluate; the ratio and rating below are
            the real, accessible, always-passing text. */}
        <span
          aria-hidden
          // eslint-disable-next-line react/forbid-dom-props
          style={{ backgroundColor: `var(${bgVar})` }}
          className="flex size-9 shrink-0 items-center justify-center rounded-(--r-2) border border-(--line-1)"
        >
          <span
            // eslint-disable-next-line react/forbid-dom-props
            style={{ backgroundColor: `var(${fgVar})` }}
            className="size-4 rounded-full"
          />
        </span>
        <p className="min-w-0 t-meta font-medium text-(--text-1)">{label}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="tnum t-meta text-(--text-2)">{ratio ? `${ratio.toFixed(2)}:1` : "…"}</span>
        <Chip tier={rating.tier} size="sm">
          {rating.label}
        </Chip>
      </div>
    </div>
  );
}
