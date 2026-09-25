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

/**
 * v4 — the glyphs were redrawn, and the box was not.
 *
 * Every shape used to span 20 of its 24 viewBox units with hard mitred corners, which at
 * a 20px render is a 20px solid stamp in a 24px column, once per row, down the whole
 * queue. Beside 19px Inter at weight 500 it was the heaviest ink on the screen — the
 * single loudest reason the list read as brutalist rather than as ranked.
 *
 * So the drawing shrank to a 14-unit span and every join is rounded, which is roughly a
 * third less ink at the same optical size. **The SVG box is unchanged** (still
 * `--icon-lg` by default, still 24 viewBox units), so not one of the 30-odd call sites
 * reflows: this is a change to the mark, not to the layout.
 *
 * Rounding is done with a same-coloured stroke at `strokeLinejoin="round"` rather than a
 * hand-drawn path — the stroke grows the polygon by half its width on every edge, so the
 * geometry below is inset to compensate and the outer span lands back on 16.
 *
 * What did not change is the encoding: octagon, triangle, ring, square are still four
 * distinct silhouettes, and G5 still reads them with the hue removed.
 */
export function TierIcon({ tier, safety, className, ...props }: TierIconProps) {
  const sizeClass = cn("icon-lg shrink-0", className);

  if (tier === "now") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={sizeClass} {...props}>
        {/* A stop sign: a 14-unit square with its corners cut at 0.293 of the side. */}
        <polygon
          points="9.1,5 14.9,5 19,9.1 19,14.9 14.9,19 9.1,19 5,14.9 5,9.1"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {safety && (
          <g stroke="var(--bg)" strokeWidth={1.9} strokeLinecap="round" fill="none">
            <path d="M12 8.4v4.4" />
            <path d="M12 15.6v.01" />
          </g>
        )}
      </svg>
    );
  }

  if (tier === "next") {
    // Optically larger than the octagon it sits under: a triangle carries less mass than
    // a near-circle in the same bounding box, so matching the boxes would make Up next
    // look like a smaller thing rather than a quieter one.
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={sizeClass} {...props}>
        <polygon
          points="12,6.2 19,18.2 5,18.2"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (tier === "later") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={sizeClass} {...props}>
        <circle cx={12} cy={12} r={6.8} fill="none" stroke="currentColor" strokeWidth={2} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden className={sizeClass} {...props}>
      <rect x={5} y={5} width={14} height={14} rx={4.5} fill="currentColor" />
      <rect x={11.1} y={8.4} width={1.8} height={1.8} rx={0.9} fill="var(--bg)" />
      <rect x={11.1} y={11.6} width={1.8} height={4.6} rx={0.9} fill="var(--bg)" />
    </svg>
  );
}
