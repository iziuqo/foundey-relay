import { defineConfig, devices } from "@playwright/test";

// Tests get their own port and their own dev server. Two reasons, both learned the hard
// way: a dev server compiles the current source on demand, so a suite run costs seconds
// instead of a production build; and port 3000 belongs to whoever is working (npm run
// dev, the preview pane). `reuseExistingServer` will happily reuse a *stale* `next start`
// left on 3000 by an earlier session and report a confident green for code that is no
// longer on disk — which happened. Keeping the humans on 3000 and the tests on 3100
// removes that failure mode entirely.
//
// The test server also gets its own build directory (NEXT_DIST_DIR, see next.config.ts):
// two `next dev` processes cannot share one `.next/`, and the second one dies on the dev
// lock with an error that says nothing about locks.
//
// Run `npm run dev:test` first to keep a warm server between runs; otherwise Playwright
// starts and stops one per run.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);

// M15 needs the suite pointed at a deployed URL ("every gate re-run against the deploy",
// plan §10 M15). BASE_URL takes over `baseURL` and removes `webServer` entirely — not just
// `reuseExistingServer`, which would still try to start a local server and then grade a
// remote one. Unset, everything below behaves exactly as it did before.
//
//   BASE_URL=https://foundey-relay.vercel.app npm run test:e2e
//
// The visual project stays local-only: its baselines are Chromium-on-macOS pixels of a dev
// server, and a deploy differs in ways (fonts over the network, no dev overlay) that make a
// remote comparison meaningless rather than informative.
const REMOTE = process.env.BASE_URL?.replace(/\/$/, "");

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // "dot" locally: one character per test instead of one line, because this output goes
  // into an agent's context window. A passing run drops from ~15KB to a few hundred
  // bytes, and failures still print in full. CI keeps "list" for a readable log.
  reporter: process.env.CI ? "list" : "dot",
  use: {
    baseURL: REMOTE ?? `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  // Two projects, because they answer different questions and cost differently. `chromium`
  // is the behavioural suite (`npm run test:e2e`, about a minute). `visual` compares pixels
  // against committed baselines (`npm run test:visual`) and is Chromium-on-macOS only: font
  // rasterisation differs on Linux, so the platform is deliberately absent from
  // `snapshotPathTemplate` and CI does not run it.
  projects: [
    { name: "chromium", testDir: "./tests/e2e", use: { ...devices["Desktop Chrome"] } },
    {
      name: "visual",
      testDir: "./tests/visual",
      use: {
        ...devices["Desktop Chrome"],
        reducedMotion: "reduce",
        timezoneId: "America/Sao_Paulo",
        locale: "en-US",
      },
    },
  ],
  snapshotPathTemplate: "{testDir}/baselines/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      // Not "disabled": see `freeze()` in tests/visual/screens.spec.ts.
      animations: "allow",
      caret: "hide",
      stylePath: "./tests/visual/hide-dev-overlay.css",
      // Anti-aliasing noise, not layout: a 4px row change at 1920 is ~0.4% of the frame.
      maxDiffPixelRatio: 0.001,
    },
  },
  webServer: REMOTE
    ? undefined
    : {
        // CI still builds for real: the gates are graded against a production build.
        command: process.env.CI
          ? `npm run build && npx next start -p ${PORT}`
          : `NEXT_DIST_DIR=.next-test npx next dev -p ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
