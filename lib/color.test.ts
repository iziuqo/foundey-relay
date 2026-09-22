import { describe, expect, it } from "vitest";
import { contrastBetween, labToLinearSrgb, parseLab, parseOklch, relativeLuminance } from "./color";

describe("parseOklch", () => {
  it("parses fractional lightness with no percent sign", () => {
    expect(parseOklch("oklch(0.605 0.22 29)")).toEqual({ l: 0.605, c: 0.22, h: 29, alpha: 1 });
  });

  it("normalizes a percent alpha", () => {
    expect(parseOklch("oklch(0.605 0.22 29 / 12%)")).toEqual({ l: 0.605, c: 0.22, h: 29, alpha: 0.12 });
  });

  it("returns null for a non-oklch string", () => {
    expect(parseOklch("rgb(0 0 0)")).toBeNull();
  });
});

describe("contrastBetween", () => {
  it("puts near-white vs near-black close to the 21:1 ceiling", () => {
    const ratio = contrastBetween("oklch(0.99 0 0)", "oklch(0.2 0.004 264)");
    expect(ratio).not.toBeNull();
    expect(ratio!).toBeGreaterThan(14);
  });

  it("is 1 for a color against itself", () => {
    expect(contrastBetween("oklch(0.6 0.1 30)", "oklch(0.6 0.1 30)")).toBeCloseTo(1, 5);
  });

  it("meets AA body text contrast for light theme --text-1 on --bg", () => {
    // app/globals.css: --text-1: var(--gray-12); --bg: var(--gray-1).
    const ratio = contrastBetween("oklch(0.2 0.004 264)", "oklch(0.99 0 0)");
    expect(ratio).not.toBeNull();
    expect(ratio!).toBeGreaterThanOrEqual(4.5);
  });

  // Regression coverage for a real bug the G4 axe gate caught: the primary Button used
  // to be bg-(--accent) text-white. --accent is tuned for thin uses (rings/text/links),
  // not a solid fill's contrast — it fails white text in dark (2.03:1) and wire (3.79:1).
  // --accent-solid/--accent-solid-fg (app/globals.css) is the fix; these pin it at 4.5:1.
  it("--accent-solid-fg on --accent-solid meets AA in every theme/fidelity combination", () => {
    const white = "oklch(1 0 0)";
    const lightAndDarkAccentSolid = "oklch(0.535 0.19 275)"; // --indigo-9, both themes
    const wireAccentSolid = "oklch(0.44 0.006 264)"; // --gray-11

    expect(contrastBetween(white, lightAndDarkAccentSolid)!).toBeGreaterThanOrEqual(4.5);
    expect(contrastBetween(white, wireAccentSolid)!).toBeGreaterThanOrEqual(4.5);

    // The bug, pinned so it can't silently come back: --accent itself is NOT safe as a
    // solid fill in dark or wire, which is exactly why it needs its own --accent-solid.
    const darkAccent = "oklch(0.78 0.1 275)"; // --indigo-6
    const wireAccent = "oklch(0.61 0.006 264)"; // --gray-9
    expect(contrastBetween(white, darkAccent)!).toBeLessThan(4.5);
    expect(contrastBetween(white, wireAccent)!).toBeLessThan(4.5);
  });

  // Another real bug the G4 axe gate caught: wire's --when-fg/--fyi-fg were gray-10 on
  // gray-2, 4.43:1 — a hair under AA. Bumped to gray-11 (app/globals.css); pinned here.
  it("wire --when-fg/--fyi-fg (gray-11 on gray-2) meets AA", () => {
    const grayFg = "oklch(0.44 0.006 264)"; // --gray-11
    const grayBg = "oklch(0.977 0.001 264)"; // --gray-2
    expect(contrastBetween(grayFg, grayBg)!).toBeGreaterThanOrEqual(4.5);

    const oldGrayFg = "oklch(0.556 0.006 264)"; // --gray-10, the bug
    expect(contrastBetween(oldGrayFg, grayBg)!).toBeLessThan(4.5);
  });
});

describe("parseLab / labToLinearSrgb", () => {
  it("parses a percent lightness and plain a/b", () => {
    expect(parseLab("lab(98.84% .0000298023 -.0000119209)")).toEqual({
      l: 98.84,
      a: 0.0000298023,
      b: -0.0000119209,
      alpha: 1,
    });
  });

  it("maps D50 white close to linear-sRGB white", () => {
    const [r, g, b] = labToLinearSrgb({ l: 100, a: 0, b: 0, alpha: 1 });
    expect(r).toBeGreaterThan(0.98);
    expect(g).toBeGreaterThan(0.98);
    expect(b).toBeGreaterThan(0.98);
  });

  it("maps lab black to linear-sRGB black", () => {
    const [r, g, b] = labToLinearSrgb({ l: 0, a: 0, b: 0, alpha: 1 });
    expect(relativeLuminance([r, g, b])).toBeCloseTo(0, 2);
  });

  it("agrees with the oklch path within 0.5:1 for the same real token (light --text-1 on --bg)", () => {
    // Real computed strings, captured live from getComputedStyle for --text-1/--bg
    // (app/globals.css: --text-1: var(--gray-12); --bg: var(--gray-1)) in the browser
    // this engine renders with — confirms both parse paths agree, not just in theory.
    const viaLab = contrastBetween("lab(7.21033% -.0953451 -1.45417)", "lab(98.84% .0000298023 -.0000119209)");
    const viaOklch = contrastBetween("oklch(0.2 0.004 264)", "oklch(0.99 0 0)");
    expect(viaLab).not.toBeNull();
    expect(viaOklch).not.toBeNull();
    expect(Math.abs(viaLab! - viaOklch!)).toBeLessThan(0.5);
  });
});
