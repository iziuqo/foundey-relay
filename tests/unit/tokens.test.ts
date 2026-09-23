import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastBetween, parseOklch } from "../../lib/color";

/**
 * The token contract, asserted against app/globals.css itself rather than against
 * numbers retyped here — so the file cannot drift from the rules it claims to follow.
 *
 * These are craft checks 1, 6 and 7 from plan/redesign/v3/ADVISOR-craft.md §9, plus
 * gate G1 and the G4 contrast pairs, at the cheapest place they can possibly run: no
 * browser, no build, ~10ms. The remaining checks (row heights, radius-by-height, the
 * chroma budget, tabular figures, 390 targets) need a rendered page and live in
 * tests/e2e/craft.spec.ts from M2.
 *
 * Every value the tests read is resolved the way a browser resolves it: var() chains
 * are followed through the mode's own block and then :root, and `calc(<c> * var(--chroma))`
 * is evaluated — which is how wire fidelity works (--chroma: 0 zeroes every chroma
 * channel in the file while leaving lightness alone).
 */

const CSS = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

type Mode = "light" | "dark" | "wire";

/** Every `--name: value;` declaration inside the first block matching `selector`. */
function blockVars(selector: string): Map<string, string> {
  const start = CSS.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`no block for ${selector}`);
  const open = CSS.indexOf("{", start);
  let depth = 0;
  let end = open;
  for (let i = open; i < CSS.length; i += 1) {
    if (CSS[i] === "{") depth += 1;
    if (CSS[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const body = CSS.slice(open + 1, end);
  const vars = new Map<string, string>();
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    vars.set(name, value.trim());
  }
  return vars;
}

const root = blockVars(":root");
const dark = blockVars('[data-theme="dark"]');
const wire = blockVars('[data-fidelity="wire"]');

function layersFor(mode: Mode): Map<string, string>[] {
  if (mode === "dark") return [dark, root];
  if (mode === "wire") return [wire, root];
  return [root];
}

/** Resolves a token to a concrete color string, following var() and evaluating calc(). */
function resolve(name: string, mode: Mode, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`cycle at ${name}`);
  seen.add(name);
  const layers = layersFor(mode);
  const raw = layers.map((layer) => layer.get(name)).find((value) => value !== undefined);
  if (raw === undefined) throw new Error(`${name} is not defined in ${mode}`);
  const expanded = raw.replace(/var\((--[\w-]+)\)/g, (_, ref: string) => resolve(ref, mode, new Set(seen)));
  // calc(<number> * <number>) — the only arithmetic these tokens use.
  return expanded.replace(/calc\(\s*([\d.]+)\s*\*\s*([\d.]+)\s*\)/g, (_, a: string, b: string) =>
    String(Number(a) * Number(b)),
  );
}

function oklchOf(name: string, mode: Mode) {
  const value = resolve(name, mode);
  const parsed = parseOklch(value);
  if (!parsed) throw new Error(`${name} in ${mode} is not oklch: ${value}`);
  return parsed;
}

const ratio = (fg: string, bg: string, mode: Mode) => {
  const value = contrastBetween(resolve(fg, mode), resolve(bg, mode));
  if (value === null) throw new Error(`could not compare ${fg} / ${bg} in ${mode}`);
  return value;
};

const TIERS = ["act", "next", "when", "fyi"] as const;
/** The three tiers that share the queue. "fyi" lives in Updates, never beside these. */
const QUEUE_TIERS = ["act", "next", "when"] as const;

describe("G1 — the framework's own scale is never redefined", () => {
  it("leaves --spacing alone, so h-12 is always 48px", () => {
    expect(CSS).not.toMatch(/^\s*--spacing\s*:/m);
  });

  it("does not redefine Tailwind's theme namespaces", () => {
    // --color-*, --text-* as Tailwind theme keys, --radius-* etc. would silently
    // rewrite utilities. v1's remapped spacing scale is what made every size in the app
    // wrong at once (v1 README §5.1).
    expect(CSS).not.toMatch(/^\s*--color-[\w-]+\s*:/m);
    expect(CSS).not.toMatch(/^\s*--breakpoint-[\w-]+\s*:/m);
  });

  it("has no `filter` anywhere — wire is a token mode, not a grayscale filter", () => {
    expect(CSS).not.toMatch(/[^-]filter\s*:/);
  });
});

describe("craft check 6 — rank descends in more than one channel", () => {
  it("light tier tints get lighter as rank falls, and act→next→when are clearly apart", () => {
    const l = TIERS.map((tier) => oklchOf(`--${tier}-bg`, "light").l);
    expect(l).toEqual([...l].sort((a, b) => a - b));

    // The three tiers that appear in the same list must be separated by more than the
    // just-noticeable difference for a large field. (act→next→when only: "when" and
    // "fyi" sit deliberately close in lightness and are told apart by chroma and icon
    // shape — they never share a list. ADVISOR-craft.md §9 check 6 asks for ≥0.012
    // across all four, which its own §4.2 table does not satisfy; see v3 LOG M1.)
    for (let i = 1; i < QUEUE_TIERS.length; i += 1) {
      expect(l[i] - l[i - 1]).toBeGreaterThanOrEqual(0.012);
    }

    // v2's four tints spanned 0.0097 in total, which is why its grayscale test could
    // not pass. Pin the span so that cannot come back.
    expect(l[l.length - 1] - l[0]).toBeGreaterThanOrEqual(0.035);
  });

  it("light tier foregrounds get lighter as rank falls", () => {
    const l = TIERS.map((tier) => oklchOf(`--${tier}-fg`, "light").l);
    expect(l).toEqual([...l].sort((a, b) => a - b));
    for (let i = 1; i < QUEUE_TIERS.length; i += 1) {
      expect(l[i] - l[i - 1]).toBeGreaterThanOrEqual(0.05);
    }
  });

  it("chroma falls with rank too, so the ranking is never carried by hue alone", () => {
    const c = QUEUE_TIERS.map((tier) => oklchOf(`--${tier}-fg`, "light").c);
    expect(c).toEqual([...c].sort((a, b) => b - a));
  });

  it("separates 'when you can' from 'for your info' by chroma, since lightness is shared", () => {
    const when = oklchOf("--when-fg", "light");
    const fyi = oklchOf("--fyi-fg", "light");
    expect(Math.abs(when.l - fyi.l)).toBeLessThan(0.02);
    expect(fyi.c - when.c).toBeGreaterThanOrEqual(0.02);
  });

  it("mirrors the ladder in dark: tints get darker, foregrounds get dimmer as rank falls", () => {
    const bg = TIERS.map((tier) => oklchOf(`--${tier}-bg`, "dark").l);
    expect(bg).toEqual([...bg].sort((a, b) => b - a));
    const fg = TIERS.map((tier) => oklchOf(`--${tier}-fg`, "dark").l);
    expect(fg).toEqual([...fg].sort((a, b) => b - a));
  });

  it("keeps the bottom two tiers from reading as raised surfaces in dark", () => {
    const surface = oklchOf("--surface-1", "dark").l;
    for (const tier of ["when", "fyi"] as const) {
      expect(Math.abs(oklchOf(`--${tier}-bg`, "dark").l - surface)).toBeLessThan(0.01);
    }
    expect(oklchOf("--act-bg", "dark").l - surface).toBeGreaterThan(0.02);
  });
});

describe("craft check 7 — wire is chroma-zero with lightness preserved", () => {
  it("zeroes every tier channel without moving a single lightness value", () => {
    for (const tier of TIERS) {
      for (const part of ["fg", "bg", "line"] as const) {
        const hi = oklchOf(`--${tier}-${part}`, "light");
        const wired = oklchOf(`--${tier}-${part}`, "wire");
        expect(wired.c).toBe(0);
        expect(Math.abs(wired.l - hi.l)).toBeLessThan(0.005);
      }
    }
  });

  it("keeps the tiers apart in wire on lightness and weight alone", () => {
    const l = QUEUE_TIERS.map((tier) => oklchOf(`--${tier}-fg`, "wire").l);
    expect(new Set(l).size).toBe(QUEUE_TIERS.length);
    // v2 mapped three of four foregrounds onto the same gray, leaving only icon shape.
    const weights = TIERS.map((tier) => resolve(`--${tier}-weight`, "wire"));
    expect(weights).toEqual(["600", "600", "500", "500"]);
  });

  it("turns off depth and the glow", () => {
    for (const token of ["--e1", "--e2", "--e3"]) {
      expect(resolve(token, "wire")).toBe("none");
    }
    for (const tier of TIERS) {
      expect(resolve(`--${tier}-glow`, "wire")).toBe("transparent");
    }
  });
});

describe("G4 — every text pair clears AA in every mode", () => {
  const modes: Mode[] = ["light", "dark", "wire"];

  it("text-1 and text-2 clear 4.5:1 on the canvas and on a card", () => {
    for (const mode of modes) {
      for (const text of ["--text-1", "--text-2"]) {
        for (const surface of ["--bg", "--surface-1", "--surface-2"]) {
          expect(ratio(text, surface, mode), `${text} on ${surface} in ${mode}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it("text-3 clears 3:1 — it is a large/secondary step and may not be used for body copy", () => {
    for (const mode of modes) {
      expect(ratio("--text-3", "--bg", mode), `text-3 in ${mode}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("every tier foreground clears AA on a card and on its own tint", () => {
    for (const mode of modes) {
      for (const tier of TIERS) {
        expect(ratio(`--${tier}-fg`, "--surface-1", mode), `${tier} on surface in ${mode}`).toBeGreaterThanOrEqual(4.5);
        expect(ratio(`--${tier}-fg`, `--${tier}-bg`, mode), `${tier} on own tint in ${mode}`).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    }
  });

  it("the primary button is near-black on white (or the reverse), not an accent fill", () => {
    for (const mode of modes) {
      // 7:1 rather than 4.5 — the point of filling with --text-1 is that the button is
      // unmistakably *the* button at two metres. v2's indigo fill was the highest-chroma
      // object on /work, inside the highest tier, which broke loudness-follows-rank.
      expect(ratio("--primary-fg", "--primary-bg", mode), `primary in ${mode}`).toBeGreaterThanOrEqual(7);
      expect(resolve("--primary-bg", mode)).toBe(resolve("--text-1", mode));
    }
  });

  it("the accent survives only as a focus ring and a link, and is legible as both", () => {
    for (const mode of modes) {
      expect(ratio("--accent", "--bg", mode), `accent in ${mode}`).toBeGreaterThanOrEqual(3);
    }
  });

  it("the done check is the only other place a hue is spent, and it reads", () => {
    for (const mode of modes) {
      expect(ratio("--success-fg", "--surface-1", mode)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("the type scale is a scale", () => {
  const STEPS = [
    ["--t-mono-size", 12],
    ["--t-eyebrow-size", 12],
    ["--t-meta-size", 14],
    ["--t-body-size", 16],
    ["--t-row-size", 19],
    ["--t-section-size", 23],
    ["--t-hero-sm-size", 28],
    ["--t-hero-size", 33],
    ["--t-finish-size", 40],
  ] as const;

  it("defines exactly the eight steps of the scale, in rem, at the specified px", () => {
    for (const [token, px] of STEPS) {
      const rem = Number(resolve(token, "light").replace("rem", ""));
      expect(Math.round(rem * 16), token).toBe(px);
    }
  });

  it("gives every step above 16px real negative tracking", () => {
    // Craft check 1, at the source: v2 left 255 of 256 rendered elements at
    // letter-spacing: normal. The rendered-page half of this check lives in e2e.
    for (const step of ["t-row", "t-section", "t-hero-sm", "t-hero", "t-finish"]) {
      const block = CSS.slice(CSS.indexOf(`@utility ${step} {`));
      const tracking = block.slice(0, block.indexOf("}")).match(/letter-spacing:\s*(-?[\d.]+)em/);
      expect(tracking, `${step} has no letter-spacing`).not.toBeNull();
      expect(Number(tracking![1])).toBeLessThan(0);
    }
  });

  it("caps weight at 600 — 700 closes Inter's counters at hero sizes", () => {
    const utilities = CSS.matchAll(/@utility t-[\w-]+ \{([^}]+)\}/g);
    for (const [, body] of utilities) {
      const weight = body.match(/font-weight:\s*(\d+)/);
      if (weight) expect(Number(weight[1])).toBeLessThanOrEqual(600);
    }
  });
});
