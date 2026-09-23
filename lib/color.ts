// oklch()/lab() -> linear sRGB -> WCAG relative luminance / contrast, so /system's
// Foundations page can print a live contrast ratio for every fg/bg pair straight from
// the tokens that are actually active (theme, fidelity), not a value typed by hand that
// drifts. Both parsers exist because `getComputedStyle` doesn't preserve the author's
// oklch() syntax: this engine serializes resolved custom-property colors as lab().
// oklch conversion: Björn Ottosson, "A perceptual color space for image processing".
// lab conversion: CSS Color 4 §xyz, via Bradford D50->D65 adaptation (Lindbloom).

export interface Oklch {
  l: number;
  c: number;
  h: number;
  alpha: number;
}

const OKLCH_RE =
  /^oklch\(\s*([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%)?)?\s*\)$/i;

export function parseOklch(input: string): Oklch | null {
  const match = OKLCH_RE.exec(input.trim());
  if (!match) return null;
  const [, lRaw, lPct, cRaw, hRaw, aRaw, aPct] = match;
  const l = lPct ? Number(lRaw) / 100 : Number(lRaw);
  const alpha = aRaw !== undefined ? (aPct ? Number(aRaw) / 100 : Number(aRaw)) : 1;
  return { l, c: Number(cRaw), h: Number(hRaw), alpha };
}

/** Linear sRGB, each channel in [0, 1] (may clip slightly out of gamut colors). */
export function oklchToLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const lCubed = l_ ** 3;
  const mCubed = m_ ** 3;
  const sCubed = s_ ** 3;

  const r = 4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed;
  const g = -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed;
  const bl = -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed;

  return [clamp01(r), clamp01(g), clamp01(bl)];
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export interface Lab {
  l: number;
  a: number;
  b: number;
  alpha: number;
}

const LAB_RE =
  /^lab\(\s*([\d.+-]+)%?\s+([\d.+-]+)\s+([\d.+-]+)(?:\s*\/\s*([\d.]+)(%)?)?\s*\)$/i;

export function parseLab(input: string): Lab | null {
  const match = LAB_RE.exec(input.trim());
  if (!match) return null;
  const [, lRaw, aRaw, bRaw, alphaRaw, alphaPct] = match;
  const alpha = alphaRaw !== undefined ? (alphaPct ? Number(alphaRaw) / 100 : Number(alphaRaw)) : 1;
  return { l: Number(lRaw), a: Number(aRaw), b: Number(bRaw), alpha };
}

// D50 white point, CSS Color 4 §predefined-lab.
const D50 = [0.3457 / 0.3585, 1.0, (1.0 - 0.3457 - 0.3585) / 0.3585];
const KAPPA = 24389 / 27;
const EPSILON = 216 / 24389;

// Bradford D50 -> D65 chromatic adaptation (Lindbloom).
const BRADFORD_D50_TO_D65 = [
  [0.9555766, -0.0230393, 0.0631636],
  [-0.0282895, 1.0099416, 0.0210077],
  [0.0122982, -0.020483, 1.3299098],
];

// XYZ (D65) -> linear sRGB, IEC 61966-2-1.
const XYZ_D65_TO_LIN_SRGB = [
  [3.2404542, -1.5371385, -0.4985314],
  [-0.969266, 1.8760108, 0.041556],
  [0.0556434, -0.2040259, 1.0572252],
];

function multiply(m: number[][], v: number[]): [number, number, number] {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ];
}

/** Linear sRGB, each channel in [0, 1] (may clip slightly out of gamut colors). */
export function labToLinearSrgb({ l, a, b }: Lab): [number, number, number] {
  const f1 = (l + 16) / 116;
  const f0 = a / 500 + f1;
  const f2 = f1 - b / 200;

  const x = f0 ** 3 > EPSILON ? f0 ** 3 : (116 * f0 - 16) / KAPPA;
  const y = l > KAPPA * EPSILON ? ((l + 16) / 116) ** 3 : l / KAPPA;
  const z = f2 ** 3 > EPSILON ? f2 ** 3 : (116 * f2 - 16) / KAPPA;

  const xyzD50: [number, number, number] = [x * D50[0], y * D50[1], z * D50[2]];
  const xyzD65 = multiply(BRADFORD_D50_TO_D65, xyzD50);
  const [r, g, bl] = multiply(XYZ_D65_TO_LIN_SRGB, xyzD65);

  return [clamp01(r), clamp01(g), clamp01(bl)];
}

/** Parses whichever CSS color function the browser handed back (oklch or lab today) and
 *  returns linear sRGB, or null if it's a notation we don't handle. */
export function cssColorToLinearSrgb(input: string): [number, number, number] | null {
  const trimmed = input.trim();
  if (/^oklch\(/i.test(trimmed)) {
    const parsed = parseOklch(trimmed);
    return parsed ? oklchToLinearSrgb(parsed) : null;
  }
  if (/^lab\(/i.test(trimmed)) {
    const parsed = parseLab(trimmed);
    return parsed ? labToLinearSrgb(parsed) : null;
  }
  return null;
}

/** WCAG relative luminance, computed from the same linear-light values (no re-gamma-encoding needed). */
export function relativeLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1 (identical) to 21 (black on white). */
export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Convenience: contrast ratio between two computed color strings (oklch() or lab()), or null if either fails to parse. */
export function contrastBetween(colorA: string, colorB: string): number | null {
  const a = cssColorToLinearSrgb(colorA);
  const b = cssColorToLinearSrgb(colorB);
  if (!a || !b) return null;
  return contrastRatio(relativeLuminance(a), relativeLuminance(b));
}

/* ---------------------------------------------------------------------------------
 * The reverse trip: a computed colour string -> OKLCH, so craft check 8 (the chroma
 * budget, ADVISOR-craft.md §9) can ask "how saturated is this element, really" about a
 * value the engine has already flattened. `getComputedStyle` never hands back the
 * author's oklch() for a var-resolved colour — it serializes lab() or rgb() — and Lab
 * chroma is not OKLCh chroma, so measuring the budget needs an actual conversion.
 * ------------------------------------------------------------------------------- */

const RGB_RE =
  /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+)(%)?)?\s*\)$/i;

/** sRGB gamma decode, one channel in [0, 1]. */
function toLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function parseRgb(input: string): { rgb: [number, number, number]; alpha: number } | null {
  const match = RGB_RE.exec(input.trim());
  if (!match) return null;
  const [, r, g, b, aRaw, aPct] = match;
  const alpha = aRaw !== undefined ? (aPct ? Number(aRaw) / 100 : Number(aRaw)) : 1;
  return { rgb: [Number(r) / 255, Number(g) / 255, Number(b) / 255], alpha };
}

/** Linear sRGB -> OKLCH. The exact inverse of `oklchToLinearSrgb` above. */
export function linearSrgbToOklch([r, g, b]: [number, number, number]): Omit<Oklch, "alpha"> {
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const l = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const c = Math.hypot(a, bb);
  const h = c < 1e-6 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return { l, c, h };
}

/**
 * Whatever the engine handed back -> OKLCH. An `oklch()` string is read directly rather
 * than round-tripped, because clamping to the sRGB gamut on the way out and back in
 * would quietly shave chroma off exactly the saturated colours the budget is counting.
 * Returns null for a notation we don't handle, and for fully transparent colours, which
 * paint nothing and therefore spend no budget.
 */
export function cssColorToOklch(input: string): Oklch | null {
  const trimmed = input.trim();
  if (trimmed === "transparent" || trimmed === "none") return null;

  if (/^oklch\(/i.test(trimmed)) {
    const parsed = parseOklch(trimmed);
    return parsed && parsed.alpha > 0 ? parsed : null;
  }

  const rgb = parseRgb(trimmed);
  if (rgb) {
    if (rgb.alpha === 0) return null;
    const linear = rgb.rgb.map(toLinear) as [number, number, number];
    return { ...linearSrgbToOklch(linear), alpha: rgb.alpha };
  }

  const linear = cssColorToLinearSrgb(trimmed);
  if (!linear) return null;
  const parsedLab = parseLab(trimmed);
  const alpha = parsedLab?.alpha ?? 1;
  if (alpha === 0) return null;
  return { ...linearSrgbToOklch(linear), alpha };
}
