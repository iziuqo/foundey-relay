import { defineConfig, devices } from "@playwright/test";

// Tests get their own port and their own dev server. Two reasons, both learned the hard
// way: a dev server compiles the current source on demand, so a suite run costs seconds
// instead of a production build; and port 3000 belongs to whoever is working (npm run
// dev, the preview pane). `reuseExistingServer` will happily reuse a *stale* `next start`
// left on 3000 by an earlier session and report a confident green for code that is no
// longer on disk — which happened. Keeping the humans on 3000 and the tests on 3100
// removes that failure mode entirely.
//
// Run `npm run dev:test` first to keep a warm server between runs; otherwise Playwright
// starts and stops one per run.
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // "dot" locally: one character per test instead of one line, because this output goes
  // into an agent's context window. A passing run drops from ~15KB to a few hundred
  // bytes, and failures still print in full. CI keeps "list" for a readable log.
  reporter: process.env.CI ? "list" : "dot",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // CI still builds for real: the gates are graded against a production build.
    command: process.env.CI
      ? `npm run build && npx next start -p ${PORT}`
      : `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
