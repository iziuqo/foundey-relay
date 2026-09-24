#!/usr/bin/env node
// `npm run check:gates` — G1–G7 and G9 in one command (plan §9.1, M14).
//
// Five steps, run in order, each one line when it passes and its own tail when it does
// not. The output of a green run is meant to be readable in a glance and cheap in a
// context window (CLAUDE.md, "Keeping output cheap"): dots and totals, never a listing.
//
//   step                       gates it carries
//   types      tsc             —  (a type error is a broken build, not a gate, but it is 3s)
//   source     lint + grep     G1 no literal colour · G5 no filter · G2/G3 no fixed-width flex child
//   unit       vitest × 3 TZ   G1 tokens · G4 contrast pairs · G6 motion tokens · G7 timezones · G9 copy
//   e2e        playwright      G2 size contract · G3 breakpoints · G4 axe, all modes · G5 wire · G6 reduced motion, CLS · G7
//   visual     playwright      G3 the baselines: eight surfaces × six widths
//
// Not here, on purpose: G8 (`npm run check:g8`, 60–90s of Lighthouse, pre-ship only),
// G10 (Figma parity, judged by screenshot in a session that has the Figma connector) and
// G11 (an independent review, M15).
//
// `--keep-going` runs every step even after one fails, for a full picture of a red tree;
// the default stops at the first failure, because the rest is noise until it is fixed.
import { spawnSync } from "node:child_process";

const STEPS = [
  { name: "types", gates: "—", cmd: "npx", args: ["tsc", "--noEmit"] },
  { name: "source", gates: "G1 G5", cmd: "npm", args: ["run", "--silent", "lint"] },
  { name: "unit", gates: "G1 G4 G6 G7 G9", cmd: "npm", args: ["run", "--silent", "test:tz"] },
  { name: "e2e", gates: "G2 G3 G4 G5 G6 G7", cmd: "npm", args: ["run", "--silent", "test:e2e"] },
  { name: "visual", gates: "G3", cmd: "npm", args: ["run", "--silent", "test:visual"] },
];

const keepGoing = process.argv.includes("--keep-going");
const results = [];

for (const step of STEPS) {
  const started = Date.now();
  const run = spawnSync(step.cmd, step.args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  const ok = run.status === 0;
  results.push({ ...step, ok, seconds });
  console.log(`${ok ? "PASS" : "FAIL"}  ${step.name.padEnd(7)} ${`${seconds}s`.padStart(7)}   ${step.gates}`);
  if (!ok) {
    // Failures print in full (they are the point), but only the last stretch: a red run's
    // first screen is progress dots and the useful part is the end.
    const out = `${run.stdout}${run.stderr}`.trim().split("\n");
    console.log(out.slice(-40).map((l) => `      ${l}`).join("\n"));
    if (!keepGoing) break;
  }
}

const skipped = STEPS.length - results.length;
const failed = results.filter((r) => !r.ok).length;
if (failed) {
  console.log(`\n${failed} step${failed === 1 ? "" : "s"} failed${skipped ? `, ${skipped} not run` : ""}.`);
  process.exit(1);
}
console.log("\nG1–G7 and G9 green. G8: npm run check:g8 · G10: Figma screenshots · G11: M15.");
