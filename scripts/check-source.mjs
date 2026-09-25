#!/usr/bin/env node
// G1 and G5's source gate, run by `npm run lint` (plan §9.1).
//
// Three rules that a stylesheet test cannot see, because the offender is in a component:
//
//  1. No literal colour outside app/globals.css — no hex, oklch(), rgb(), hsl(), lab(),
//     color-mix(). Every colour resolves to a token, so a token change reaches every
//     surface and wire mode can zero the chroma in one place.
//  2. No `filter`. Wire is a token mode, not a grayscale filter (v1 README P0 4).
//     `backdrop-filter` is not a filter in that sense and is left alone.
//  3. No arbitrary-value fixed width: `w-[…]`, `min-w-[…]` or `basis-[…]` in a className is
//     how a row stops fitting at 390. Scale widths (`w-72`) are NOT checked, because they
//     are how popovers, the toast and the rail's carrier strip are sized on purpose (each was
//     read by eye in M14: all are portalled, fixed-position or in a scroll strip, and fit
//     390). Whether a fixed box is a *flex child that should squeeze* is a judgement the
//     craft suite's row-height and 390-overlap checks make on the rendered page.
//
// Each rule has a short allow-list with the reason beside every entry. An allow-list line
// is a decision; add one only with the sentence that justifies it.
//
// Comments are stripped before scanning, so prose that names a token does not trip it.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dirname, "..");
const SCAN = ["app", "components", "lib", "state"];

/** file → why it may hold a literal colour. */
const COLOR_OK = {
  "app/globals.css": "the token file: this is where colours are defined",
  "app/opengraph-image.tsx": "Satori cannot read CSS variables; parity with the tokens is asserted in tests/unit/tokens.test.ts",
  "lib/color.ts": "a colour parser: its source names the notations it parses",
  "lib/color.test.ts": "the parser's own tests",
};

/** file → why it may size a box in fixed units. */
const WIDTH_OK = {
  "components/system/states-matrix.tsx": "table inside an overflow-x-auto wrapper: it scrolls, it does not squeeze",
  "components/system/components-extra.tsx": "table inside an overflow-x-auto wrapper: it scrolls, it does not squeeze",
  "components/ui/section-band.tsx": "min-w-[2ch]: the count, so one digit and two do not move the label",
  "components/system/motion/demos.tsx": "min-w-[2ch] on a counter; the rest of the demos' widths are stage miniatures",
  "components/relay/status-sentence.tsx": "min-w-[2ch]: the count, so one digit and two do not move the sentence",
  "components/relay/check-in-sheet.tsx": "a fixed side panel, rendered only at 1024 and up",
  "components/relay/command-palette.tsx": "w-[calc(100vw-2rem)] capped by max-w-xl: a viewport-relative width, not a fixed one",
  "components/relay/shortcuts-sheet.tsx": "w-[calc(100vw-2rem)]: a viewport-relative width, not a fixed one",
};

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(tsx?|css)$/.test(name) ? [path] : [];
  });
}

/** Removes comments while keeping line numbers, so a report can point at the line. */
function stripComments(source, css) {
  const blank = (m) => m.replace(/[^\n]/g, " ");
  let out = source.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (!css) out = out.replace(/(^|[^:"'`])\/\/.*$/gm, (m, lead) => lead + " ".repeat(m.length - lead.length));
  return out;
}

// Hex is matched at exactly 3 or 6 digits, the two forms anyone actually writes. The
// 4- and 8-digit RGBA forms are deliberately not checked: nothing in this repo uses
// them, and `{3,8}` made the rule read every order number in the seed as a colour the
// moment the brief's own "#4821" arrived in the copy (v4). A real 6-digit literal is
// still caught, which is what G1 is for.
const COLOR = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b|\b(?:oklch|oklab|lab|lch|rgba?|hsla?|hwb)\(|color-mix\(/;
// The property in a stylesheet or an inline style, and the Tailwind utilities that emit one.
// Deliberately not "contrast" or "invert" as bare words: those are English, and the copy
// and the /system prose use them.
const FILTER_PROP = /(?:^|[\s;{])filter\s*:\s*[^\s]/;
const FILTER_UTILITY = /(?:^|[\s"'`:])(?:grayscale|sepia|hue-rotate-\d+|blur-(?:xs|sm|md|lg|xl|2xl|3xl|\[[^\]]+\])|drop-shadow-\S+)(?=[\s"'`]|$)/;
const WIDTH = /(?:^|[\s"'`:])(?:min-w|w|basis)-\[[^\]]*\]/;

const problems = [];
for (const dir of SCAN) {
  for (const path of files(join(root, dir))) {
    const rel = relative(root, path);
    const css = path.endsWith(".css");
    stripComments(readFileSync(path, "utf8"), css)
      .split("\n")
      .forEach((line, i) => {
        const at = `${rel}:${i + 1}`;
        if (!COLOR_OK[rel] && COLOR.test(line)) problems.push(`${at}  literal colour — use a token: ${line.trim().slice(0, 90)}`);
        if ((css ? FILTER_PROP.test(line) : (FILTER_UTILITY.test(line) && /class|cn\(|clsx\(/.test(line)) || /\bfilter:\s*["'`]/.test(line)) && !/backdrop-filter/.test(line)) problems.push(`${at}  a filter — wire is a token mode: ${line.trim().slice(0, 90)}`);
        if (!css && !WIDTH_OK[rel] && WIDTH.test(line)) problems.push(`${at}  arbitrary fixed width — let it flex, or allow-list it with a reason: ${line.trim().slice(0, 90)}`);
      });
  }
}

if (problems.length) {
  console.error(`check-source: ${problems.length} problem${problems.length === 1 ? "" : "s"}\n` + problems.map((p) => `  ${p}`).join("\n"));
  process.exit(1);
}
console.log("check-source: no literal colours, no filters, no arbitrary fixed widths");
