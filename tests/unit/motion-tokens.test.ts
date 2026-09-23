import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { duration, ease, spring } from "../../lib/motion";

/**
 * Gate G6's first half, and the one rule the motion catalog leads with: **no component
 * may inline a curve.** v2 shipped three different curves — its own, Tailwind's default
 * `cubic-bezier(0.4, 0, 0.2, 1)`, and a stray 150ms — across 41 animated elements, and
 * that is what makes an interface read as several people's work rather than one.
 *
 * A rule nobody can check is a rule that decays, so this asserts it against the source
 * itself. It is the cheapest gate in the repo (no browser, no build) and it catches the
 * exact way the rule gets broken in practice: someone reaches for `duration-[240ms]` or
 * `ease-in-out` in the one component they are looking at, because the token for what
 * they want does not exist yet. The fix, when this fails, is to add the token.
 */

const ROOT = process.cwd();

/**
 * Comments out. Every rule below is about what the code *does*, and this file's subject
 * matter is one where the prose and the code say opposite things on purpose: globals.css
 * explains at length why there is no shimmer and which bezier the sheet stopped using,
 * and a grep that cannot tell those apart fails on the documentation of its own rule.
 */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const CSS = code(readFileSync(join(ROOT, "app/globals.css"), "utf8"));

/** Every .ts/.tsx under app/, components/ and lib/, as [path, source]. */
function sources(): [string, string][] {
  const out: [string, string][] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(join(ROOT, dir))) {
      const rel = `${dir}/${entry}`;
      if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
      else if (/\.tsx?$/.test(entry) && !entry.endsWith(".test.ts")) out.push([rel, code(readFileSync(join(ROOT, rel), "utf8"))]);
    }
  };
  for (const dir of ["app", "components", "lib"]) walk(dir);
  return out;
}

const SOURCES = sources();

/** The one animation in the app that is allowed to loop. */
const AURORA = /animation: aurora-hue-drift 24s linear infinite;/;

/**
 * The two animations allowed a `linear` timing function, and both for the same reason:
 * they are *clocks*. The aurora's hue drifts at a constant rate because an eased hue
 * rotation visibly speeds up and slows down; the undo ring depletes at a constant rate
 * because anything else makes it lie about how many of the eight seconds are left.
 */
const LINEAR_BY_DESIGN = [AURORA, /animation: undo-ring-countdown var\(--toast-duration\) linear forwards;/];

describe("G6 — one curve set", () => {
  it("defines every curve exactly once, in globals.css", () => {
    const declared = [...CSS.matchAll(/cubic-bezier\([^)]*\)/g)].map((m) => m[0]);
    // Three, and these are all of them: --ease-out, --ease-inout, --ease-in. Any fourth
    // is either a new curve nobody chose or a copy of one that already has a name.
    expect(declared).toEqual([
      `cubic-bezier(${ease.out.join(", ")})`,
      `cubic-bezier(${ease.inOut.join(", ")})`,
      `cubic-bezier(${ease.in.join(", ")})`,
    ]);
  });

  it("never inlines a curve in a component", () => {
    const offenders = SOURCES.filter(([path]) => path !== "lib/motion.ts" && path !== "lib/theme-transition.ts")
      .filter(([, src]) => /cubic-bezier\(|ease-\[|\bease:\s*\[/.test(src))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it("never inlines a duration in a Tailwind utility", () => {
    // `duration-[240ms]` and `delay-[120ms]` are the arbitrary-value escape hatch, and
    // every use of it is a duration that exists outside the ramp.
    const offenders = SOURCES.filter(([, src]) => /\b(?:duration|delay)-\[/.test(src)).map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it("never reaches for transition-all", () => {
    // It animates properties nobody chose, including layout ones, which is how a
    // transition turns into a layout shift the CLS gate then has to find.
    const offenders = SOURCES.filter(([, src]) => /\btransition-all\b/.test(src)).map(([path]) => path);
    expect(offenders).toEqual([]);
    expect(CSS).not.toMatch(/transition:\s*all\b/);
  });
});

describe("G6 — the duration ramp", () => {
  it("keeps lib/motion.ts and globals.css on the same numbers", () => {
    // The two are read by different systems (Motion's `transition` prop; Tailwind's
    // `duration-()` utilities) and are kept in step by hand, which is exactly the kind
    // of pairing that drifts silently. Seconds there, milliseconds here.
    const fromCss = new Map(
      [...CSS.matchAll(/--dur-([a-z-]+):\s*(\d+)ms;/g)].map((m) => [m[1], Number(m[2])]),
    );
    const fromTs = new Map(
      Object.entries(duration).map(([k, v]) => [k.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), Math.round(v * 1000)]),
    );
    expect(Object.fromEntries(fromTs)).toEqual(Object.fromEntries([...fromCss].filter(([k]) => fromTs.has(k))));
    // And nothing in the CSS ramp is missing from the TS one, so a component reaching
    // for `duration-(--dur-x)` always has a Motion equivalent to reach for too.
    expect([...fromCss.keys()].filter((k) => !fromTs.has(k) && k !== "spring-sheet")).toEqual([]);
  });

  it("never writes a literal duration into a CSS animation", () => {
    const offenders = [...CSS.matchAll(/animation:[^;]+;/g)]
      .map((m) => m[0])
      .filter((decl) => !AURORA.test(decl) && /\b\d+(?:\.\d+)?m?s\b/.test(decl));
    expect(offenders).toEqual([]);
  });

  it("never writes a keyword easing into a CSS animation", () => {
    const offenders = [...CSS.matchAll(/animation:[^;]+;/g)]
      .map((m) => m[0])
      .filter((decl) => !LINEAR_BY_DESIGN.some((ok) => ok.test(decl)))
      .filter((decl) => /(?<![-\w])(?:ease|ease-in|ease-out|ease-in-out|linear)(?![-\w])/.test(decl));
    expect(offenders).toEqual([]);
  });

  it("samples both springs into CSS from the same constants Motion uses", () => {
    // --spring-sheet is spring.sheet itself, resolved at 36 points — not a hand-tuned
    // bezier that looks a bit like it, which is what it replaced.
    expect(CSS).toMatch(/--spring-sheet:\s*linear\(/);
    expect(spring.sheet).toMatchObject({ stiffness: 340, damping: 34, mass: 1 });
    expect(spring.layout).toMatchObject({ stiffness: 480, damping: 42, mass: 1 });
  });
});

describe("G6 — nothing loops, and nothing pulses", () => {
  it("has exactly one infinite animation, and it is the all-clear aurora", () => {
    const loops = [...CSS.matchAll(/animation:[^;]*infinite[^;]*;/g)].map((m) => m[0]);
    expect(loops).toHaveLength(1);
    expect(loops[0]).toMatch(AURORA);
  });

  it("never pulses", () => {
    // A pulsing countdown across a nine-hour shift is torture, and a shimmer on a
    // skeleton that resolves in under 50ms is a lie about latency.
    const offenders = SOURCES.filter(([, src]) => /animate-pulse|animate-ping/.test(src)).map(([p]) => p);
    expect(offenders).toEqual([]);
    // In the cascade, as a keyframes name or a class — not as the word, which /system
    // prints on purpose under the skeleton that does not have one.
    expect(CSS).not.toMatch(/animate-pulse|[.@][\w-]*shimmer|shimmer\s*\{/);
  });

  it("keeps the one spinner off every product surface", () => {
    // The Button's loading spinner is the single looping thing in the component layer.
    // It is reachable only from /system's state matrix, where it is documenting a state
    // rather than claiming latency the demo store does not have (it resolves in <50ms).
    const spinners = SOURCES.filter(([, src]) => /animate-spin/.test(src)).map(([p]) => p);
    expect(spinners).toEqual(["components/ui/button.tsx"]);
    const usesLoading = SOURCES.filter(([path, src]) => /\bloading(?:=|\s*[,}])/.test(src) && path !== "components/ui/button.tsx")
      .map(([p]) => p);
    expect(usesLoading).toEqual(["components/system/components-page.tsx"]);
  });
});
