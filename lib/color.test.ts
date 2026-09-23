import { describe, expect, it } from "vitest";
import {
  contrastBetween,
  cssColorToOklch,
  labToLinearSrgb,
  parseLab,
  parseOklch,
  relativeLuminance,
} from "./color";

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

  // The token-by-token contrast pins that used to live here moved to
  // tests/unit/tokens.test.ts in v3 M1. They asserted v2's literal values (--indigo-9
  // as a button fill, wire's hand-written gray table), which no longer exist: the
  // primary button is now --text-1 filled and wire is a chroma multiplier rather than a
  // second palette. The new tests read app/globals.css and resolve it, so they cannot
  // go stale the way retyped literals did. What stays here is the color math itself.
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

describe("cssColorToOklch (craft check 8: the chroma budget)", () => {
  it("round-trips an oklch token without losing chroma to a gamut clamp", () => {
    // Read directly, not round-tripped: --act-fg is oklch(0.4 0.155 27), and clipping
    // it through sRGB and back is exactly how a saturated colour would get quietly
    // under-counted by the budget it is supposed to blow.
    const parsed = cssColorToOklch("oklch(0.4 0.155 27)");
    expect(parsed!.c).toBeCloseTo(0.155, 6);
  });

  it("agrees with the source oklch after the engine flattens it to lab()", () => {
    const viaLab = cssColorToOklch("lab(40.9% 52.5 30.6)");
    expect(viaLab).not.toBeNull();
    expect(viaLab!.c).toBeGreaterThan(0.12);
    expect(viaLab!.c).toBeLessThan(0.2);
  });

  it("reads a plain rgb() string", () => {
    const white = cssColorToOklch("rgb(255, 255, 255)");
    expect(white!.l).toBeCloseTo(1, 2);
    expect(white!.c).toBeLessThan(0.001);
  });

  it("returns null for colours that paint nothing, so they spend no budget", () => {
    expect(cssColorToOklch("rgba(0, 0, 0, 0)")).toBeNull();
    expect(cssColorToOklch("transparent")).toBeNull();
  });

  it("puts the neutral ramp under the 0.06 budget threshold and the tier hues over it", () => {
    expect(cssColorToOklch("oklch(0.44 0.006 250)")!.c).toBeLessThan(0.06);
    expect(cssColorToOklch("oklch(0.46 0.115 68)")!.c).toBeGreaterThan(0.06);
  });
});
