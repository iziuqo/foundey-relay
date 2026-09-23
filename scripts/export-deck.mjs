#!/usr/bin/env node
// Builds the app, serves it, and exports the deck to exports/relay-deck.pdf. §8.
//
// Composes the PDF from one full resolution PNG per slide (via pdf-lib) instead of
// `page.pdf()` pagination over `@media print` — v1's own export script
// (git show v1-vite:scripts/export-deck.mjs) tried CSS `break-after: page` first and
// found Chromium didn't honor it reliably at this page size (27 slides came out as 8
// PDF pages). Per-slide screenshots sidestep that entirely: one page in, one page out.
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
// Must match SLIDE_WIDTH/SLIDE_HEIGHT in components/deck/slide-frame.tsx — this is a
// plain Node script, so it can't import a .tsx module's constants directly.
const SLIDE_WIDTH = 1600;
const SLIDE_HEIGHT = 900;

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`))));
  });
}

function waitForServer(url, timeoutMs = 30000) {
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

async function main() {
  console.log("Building...");
  await run("npx", ["next", "build"]);

  console.log("Starting production server...");
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: root, stdio: "inherit" });

  try {
    await waitForServer(BASE);

    const slidesDir = join(root, "exports/slides");
    mkdirSync(slidesDir, { recursive: true });
    // Clear last run's PNGs first: v1 left slide-17..27 here after the deck shrank to 16,
    // and a directory that disagrees with the PDF is a stale export waiting to be trusted.
    for (const f of readdirSync(slidesDir)) if (/^slide-\d+\.png$/.test(f)) rmSync(join(slidesDir, f));

    const browser = await chromium.launch();
    // §8's reduced-motion global (app/globals.css + MotionConfig reducedMotion="user")
    // collapses every Motion entrance and NumberFlow roll to its settled end state, so
    // each screenshot is the slide at rest, not mid animation.
    const page = await browser.newPage({
      viewport: { width: SLIDE_WIDTH, height: SLIDE_HEIGHT },
      // 2×: the PDF page is still 1600×900pt, but each slide is drawn from a 3200×1800 PNG,
      // so the type stays sharp when the PDF is zoomed or printed.
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });
    await page.goto(`${BASE}/deck/print`, { waitUntil: "networkidle" });

    console.log("Exporting per slide PNGs...");
    const slides = await page.locator("[data-deck-print-slide]").all();
    const pngPaths = [];
    for (let i = 0; i < slides.length; i++) {
      const n = String(i + 1).padStart(2, "0");
      const p = join(slidesDir, `slide-${n}.png`);
      await slides[i].screenshot({ path: p });
      pngPaths.push(p);
    }
    await browser.close();

    console.log("Composing PDF from the slide PNGs...");
    const pdf = await PDFDocument.create();
    for (const p of pngPaths) {
      const png = await pdf.embedPng(readFileSync(p));
      const pdfPage = pdf.addPage([SLIDE_WIDTH, SLIDE_HEIGHT]);
      pdfPage.drawImage(png, { x: 0, y: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT });
    }
    const pdfBytes = await pdf.save();
    writeFileSync(join(root, "exports/relay-deck.pdf"), pdfBytes);

    console.log(`Done. ${pngPaths.length} slides exported to exports/slides/, and exports/relay-deck.pdf.`);
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
