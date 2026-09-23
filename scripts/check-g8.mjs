#!/usr/bin/env node
// G8 (plan §9.1): Lighthouse performance and accessibility at least 95 on /work, and
// cumulative layout shift under 0.02 through hydration.
//
// With no argument it builds, serves, and audits locally — a fast loop while working.
// The gate of record is the Vercel preview URL, which this takes as an argument:
//
//   npm run check:g8                                  # local production build
//   npm run check:g8 -- https://<preview>.vercel.app  # the real gate
//   npm run check:g8 -- --mobile                      # the 390 handheld profile (§5)
//
// Localhost has no network latency, so a local pass is necessary but not sufficient —
// the script says so in its own output rather than letting a green local run stand in
// for the preview.
//
// Runs the audit three times and grades the median run. Lighthouse's performance score
// moves by several points between identical runs on a busy machine, and a gate that
// fails at random is a gate people learn to re-run until it's green (the same reasoning
// behind the G4 axe flakiness fix in a617ca5).
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import * as chromeLauncher from "chrome-launcher";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// Not 3000 (someone's dev server, and this tree is shared) and not export-deck.mjs's
// 4173, so the two scripts can run at the same time.
const PORT = 4174;
const MIN_SCORE = 95;
const MAX_CLS = 0.02;
const RUNS = 3;

const args = process.argv.slice(2);
const mobile = args.includes("--mobile");
const targetBase = args.find((a) => !a.startsWith("--"))?.replace(/\/$/, "");

function run(cmd, cmdArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${cmdArgs.join(" ")} exited ${code}`))));
  });
}

function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        // not up yet
      }
      if (Date.now() - start > timeoutMs) return reject(new Error(`Timed out waiting for ${url}`));
      setTimeout(tick, 300);
    };
    tick();
  });
}

async function audit(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new"] });
  try {
    const result = await lighthouse(
      url,
      {
        port: chrome.port,
        output: "html",
        logLevel: "error",
        onlyCategories: ["performance", "accessibility"],
      },
      // Lighthouse defaults to a throttled phone. /work's own surface is a warehouse
      // display, so desktop is the default here and --mobile opts into the handheld run.
      mobile ? undefined : desktopConfig,
    );
    if (!result) throw new Error("Lighthouse returned no result");
    return result;
  } finally {
    await chrome.kill();
  }
}

function scoreOf(lhr, category) {
  return Math.round((lhr.categories[category]?.score ?? 0) * 100);
}

async function main() {
  let server;
  let base = targetBase;

  if (!base) {
    console.log("Building...");
    await run("npx", ["next", "build"]);
    console.log("Starting production server...");
    server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: root, stdio: "inherit" });
    base = `http://localhost:${PORT}`;
    await waitForServer(base);
  }

  const url = `${base}/work`;
  const profile = mobile ? "mobile" : "desktop";

  try {
    console.log(`\nAuditing ${url} (${profile}, best of ${RUNS} by median performance)...\n`);
    const results = [];
    for (let i = 1; i <= RUNS; i++) {
      const result = await audit(url);
      const perf = scoreOf(result.lhr, "performance");
      console.log(`  run ${i}: performance ${perf}`);
      results.push(result);
    }

    results.sort((a, b) => scoreOf(a.lhr, "performance") - scoreOf(b.lhr, "performance"));
    const median = results[Math.floor(results.length / 2)];
    const lhr = median.lhr;

    const performance = scoreOf(lhr, "performance");
    const accessibility = scoreOf(lhr, "accessibility");
    const cls = lhr.audits["cumulative-layout-shift"].numericValue;
    const lcp = lhr.audits["largest-contentful-paint"].displayValue;
    const tbt = lhr.audits["total-blocking-time"].displayValue;

    const reportDir = join(root, "exports/lighthouse");
    mkdirSync(reportDir, { recursive: true });
    // Host in the name so a local run and a preview run sit side by side instead of
    // overwriting each other — the two are not interchangeable evidence.
    const host = new URL(base).host.replace(/[^a-z0-9.-]/gi, "-");
    const reportPath = join(reportDir, `work-${profile}-${host}.html`);
    writeFileSync(reportPath, median.report);

    const checks = [
      [`performance >= ${MIN_SCORE}`, performance >= MIN_SCORE, performance],
      [`accessibility >= ${MIN_SCORE}`, accessibility >= MIN_SCORE, accessibility],
      [`CLS < ${MAX_CLS}`, cls < MAX_CLS, cls.toFixed(4)],
    ];

    console.log(`\n  LCP ${lcp} · TBT ${tbt}\n`);
    for (const [label, ok, value] of checks) {
      console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}  (${value})`);
    }
    console.log(`\n  Report: ${reportPath.replace(`${root}/`, "")}`);

    if (!targetBase) {
      console.log("\n  Note: localhost has no network latency. G8 is graded on the preview URL —");
      console.log("  npm run check:g8 -- https://<preview>.vercel.app");
    }

    if (checks.some(([, ok]) => !ok)) {
      console.error("\nG8 failed.\n");
      process.exitCode = 1;
    } else {
      console.log("\nG8 passed.\n");
    }
  } finally {
    server?.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
