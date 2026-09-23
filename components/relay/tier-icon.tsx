import { cn } from "@/lib/cn";

// §4.6: shape carries the tier, not just color, so the ranking reads in grayscale at
// 16px (the grayscale test, §2.1). Safety items get a hazard glyph inside the octagon
// because safety bypasses the score entirely.
export type EncodedTier = "now" | "next" | "later" | "fyi";

export interface TierIconProps extends Omit<React.SVGAttributes<SVGSVGElement>, "fill"> {
  tier: EncodedTier;
  /** Draws the hazard glyph inside the Act now octagon. Ignored for other tiers. */
  safety?: boolean;
}

export function TierIcon({ tier, safety, className, ...props }: TierIconProps) {
  const sizeClass = cn("size-(--icon-lg) shrink-0", className);

  if (tier === "now") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={sizeClass} {...props}>
        <polygon points="8,2 16,2 22,8 22,16 16,22 8,22 2,16 2,8" fill="currentColor" />
        {safety && (
          <g stroke="var(--bg)" strokeWidth={2} strokeLinecap="round" fill="none">
            <path d="M12 7.5v5.5" />
            <path d="M12 16.5v.01" />
          </g>
        )}
      </svg>
    );
  }

  if (tier === "next") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={sizeClass} {...props}>
        <polygon points="12,3 22,20 2,20" fill="currentColor" />
      </svg>
    );
  }

  if (tier === "later") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={sizeClass} {...props}>
        <circle cx={12} cy={12} r={8.5} fill="none" stroke="currentColor" strokeWidth={2.25} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden className={sizeClass} {...props}>
      <rect x={3} y={3} width={18} height={18} rx={4} fill="currentColor" />
      <rect x={11} y={7} width={2} height={2} rx={0.5} fill="var(--bg)" />
      <rect x={11} y={11} width={2} height={6} rx={1} fill="var(--bg)" />
    </svg>
  );
}
