#!/usr/bin/env node
// Captures public/shots/*.png — the screenshots the landing page at `/` shows.
//
// Same discipline as tests/visual/screens.spec.ts, because a marketing shot of a live
// countdown is a different picture every run: the clock is pinned to the seed instant,
// motion is reduced, and every finite animation is settled before the shutter. The route
// is asserted before it is captured — never navigate twice and trust the second one.
//
// Theme and fidelity are set by *clicking the app's own radios*, not by seeding
// localStorage: `Providers` applies the stored theme once on mount, and a seeded value
// races that effect (it lands on /team and not on /work). Clicking is also the honest
// path — it is what a visitor does.
//
//   npm run dev        # :3000, in another terminal
//   node scripts/capture-shots.mjs
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = join(process.cwd(), "public", "shots");
mkdirSync(OUT, { recursive: true });

const SEED_INSTANT = new Date("2026-09-22T10:40:00-07:00");
const browser = await chromium.launch();

async function shot(name, { route, persona = "u1", mode, w, h, expect }) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
    timezoneId: "America/Sao_Paulo",
    locale: "en-US",
  });
  await ctx.addInitScript((p) => {
    try {
      localStorage.setItem("relay-demo-v2", JSON.stringify({ state: { persona: p }, version: 0 }));
    } catch {}
  }, persona);
  const page = await ctx.newPage();
  await page.clock.setFixedTime(SEED_INSTANT);
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.getByText(expect, { exact: false }).first().waitFor({ timeout: 20000 });
  if (mode) {
    // Clicked through the DOM, not through a locator: `page.clock.setFixedTime` stops
    // Date advancing, and Playwright's own actionability polling never resolves against
    // a clock that does not move. The element is the app's real radio either way.
    for (let tries = 0; tries < 20; tries++) {
      const hit = await page.evaluate((m) => {
        const el = document.querySelector(`[role="radio"][aria-label="${m}"]`);
        el?.click();
        return !!el;
      }, mode);
      if (hit) break;
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(900);
  // Settle: cancel the one animation that loops by contract, end the rest.
  await page.evaluate(() => {
    for (const a of document.getAnimations()) {
      if (a.effect?.getComputedTiming().iterations === Infinity) a.cancel();
      else a.finish?.();
    }
  });
  await page.waitForTimeout(150);
  // These run against the dev server (the whole point — a dev server compiles what is on
  // disk right now), and Next.js paints its own dev indicator over the bottom-left of
  // every page. It is not part of the product, so it is not part of a picture of the
  // product. v4 — it had been sitting in the landing page's screenshots.
  await page.addStyleTag({ content: "nextjs-portal, [data-nextjs-toast], #__next-build-watcher { display: none !important; }" });
  await page.waitForTimeout(80);
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  console.log(`${name.padEnd(22)} ${String(w).padStart(4)}×${h}  ${mode ?? "light"}  ${page.url().replace(BASE, "")}`);
  await ctx.close();
}

const HERO = "Order #4821 — payment mismatch";

await shot("work-light", { route: "/work", w: 1440, h: 900, expect: HERO });
await shot("work-dark", { route: "/work", mode: "Dark", w: 1440, h: 900, expect: HERO });
await shot("work-wire", { route: "/work", mode: "Wire", w: 1440, h: 900, expect: HERO });
await shot("team-dark", { route: "/team", persona: "m1", mode: "Dark", w: 1440, h: 900, expect: "Needs you" });
await shot("updates-light", { route: "/updates", w: 1440, h: 900, expect: "Notifications" });
// /system carries its own light/dark control, not the app top bar's radios, so this
// one stays in the mode it opens in — which is also the mode its specimens were drawn for.
await shot("system-light", { route: "/system", w: 1440, h: 900, expect: "Foundations" });
await shot("deck-light", { route: "/deck", w: 1440, h: 900, expect: "PART A" });
await shot("work-390-light", { route: "/work", w: 390, h: 844, expect: HERO });

await browser.close();
