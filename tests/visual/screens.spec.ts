import { test, expect, type Page } from "@playwright/test";
import { copy } from "../../lib/copy";

/**
 * G3 — the visual baselines: eight surfaces at six widths, light mode.
 *
 * The other G3 tests assert *properties* (no horizontal scroll, nothing clipped). This is
 * the one that catches what nobody thought to assert: a row that grew four pixels, a hero
 * that lost its shadow, a section band that slid under the dock. It answers "did anything
 * change?", and a human answers "was that meant?" by looking at the diff and, if it was,
 * running `npm run test:visual:update` and committing the new PNGs.
 *
 * What makes a pixel comparison trustworthy here, each of it learned from the tests
 * beside this one:
 *  - **The clock is frozen.** The demo clock is real elapsed time since load added to a
 *    seed instant (state/clock.ts), so a countdown moves between two runs of the same
 *    code. `setFixedTime` pins `Date` to the seed instant and leaves timers alone, so
 *    everything is exactly 10:40 and nothing ticks.
 *  - **Motion is off, twice.** `reducedMotion: "reduce"` for the CSS the app itself
 *    guards, and `freeze()` below for whatever it does not. The check draw is driven
 *    from JS and `pathLength` is invisible to Playwright's own `animations: "disabled"`,
 *    which is why the first is set on the project (LOG M9).
 *  - **Why not `animations: "disabled"`:** it fast-forwards every finite animation to
 *    its end, and the undo toast's countdown ring is one (12s). Every after-done
 *    baseline would then show a toast whose ring is already empty, which is a picture of
 *    a state the user never sees. `freeze()` holds the ring at full and settles the rest.
 *  - **Settled, not sampled.** Every scene waits for the content that proves it arrived,
 *    then for `freeze()`, before it looks.
 *  - **The dev indicator is hidden** (`hide-dev-overlay.css`): these run on `next dev`.
 *  - **Light only, viewport only.** Dark and wire have their own gates (G4, G5) that
 *    measure rather than compare, and a full-page 1920px `/system` would put megabytes of
 *    PNG in the repo for a page whose interesting part is at the top.
 *
 * The baselines are Chromium-on-macOS. Font rasterisation differs on Linux, so this suite
 * is a local gate, not a CI one; see `snapshotPathTemplate` in playwright.config.ts.
 */

const SEED_INSTANT = new Date("2026-09-22T10:40:00-07:00");
const WIDTHS = [390, 768, 1024, 1280, 1440, 1920];
const HEIGHT = 900;

type Persona = "u1" | "m1";

/**
 * Settles every animation that has an end, holds the undo ring at full, cancels the one
 * that has none (the all-clear aurora, the only loop by contract), and waits for the
 * layout to stop moving. Twice with a beat between, as `animationsSettled` does, because
 * "nothing is running" is also true before anything has begun.
 */
async function freeze(page: Page) {
  const quiet = () =>
    page.waitForFunction(
      () =>
        document.getAnimations().every((a) => {
          const timing = a.effect?.getComputedTiming();
          const name = (a as CSSAnimation).animationName;
          return name === "undo-ring-countdown" || timing?.iterations === Infinity || a.playState !== "running";
        }),
      null,
      { timeout: 5000 },
    );
  await quiet();
  await page.waitForTimeout(120);
  await quiet();
  await page.evaluate(() => {
    for (const a of document.getAnimations()) {
      if (a.effect?.getComputedTiming().iterations === Infinity) a.cancel();
      else if ((a as CSSAnimation).animationName === "undo-ring-countdown") {
        a.pause();
        a.currentTime = 0;
      }
    }
  });
}

async function open(page: Page, route: string, persona: Persona) {
  await page.addInitScript((p) => {
    window.localStorage.setItem("relay-demo-v2", JSON.stringify({ state: { persona: p }, version: 0 }));
  }, persona);
  await page.clock.setFixedTime(SEED_INSTANT);
  await page.goto(route);
}

/** The queue is the surface every scene below starts from. */
async function openWork(page: Page) {
  await open(page, "/work", "u1");
  await expect(page.getByTestId("hero")).toBeVisible();
}

interface Scene {
  name: string;
  /** Gets the page to the state being photographed and returns once it is *there*. */
  arrive: (page: Page) => Promise<void>;
}

const SCENES: Scene[] = [
  { name: "work", arrive: openWork },
  {
    name: "team",
    arrive: async (page) => {
      await open(page, "/team", "m1");
      await expect(page.getByTestId("risk-tiles")).toBeVisible();
      await expect(page.getByTestId("team-board")).toBeVisible();
    },
  },
  {
    name: "detail-open",
    arrive: async (page) => {
      await openWork(page);
      await page.locator("[data-row-nav]").first().click();
      await expect(page.getByRole("dialog").getByTestId("item-detail-title")).toBeVisible();
    },
  },
  {
    name: "after-done",
    arrive: async (page) => {
      await openWork(page);
      const before = await page.getByTestId("hero-title").textContent();
      await page.keyboard.press("e");
      await expect(page.getByTestId("hero-title")).not.toHaveText(before ?? "");
    },
  },
  {
    name: "all-clear",
    arrive: async (page) => {
      await openWork(page);
      // Mark done until the queue is empty and the hero gives way to the finish line
      // (work/page.tsx renders <AllClear> when there is no hero). Each press waits for
      // the hero to change, so a slow frame cannot swallow a keystroke. "Nothing urgent"
      // is the status line's word for an empty Act-now tier, not for this.
      const caughtUp = page.getByText(copy.allClear.title);
      for (let i = 0; i < 12 && !(await caughtUp.isVisible()); i += 1) {
        const title = page.getByTestId("hero-title");
        const before = await title.textContent();
        await page.keyboard.press("e");
        await expect(title.or(caughtUp)).not.toHaveText(before ?? "");
      }
      await expect(caughtUp).toBeVisible();
      // A toast is keyed by `Date.now()` and the bridge drops a repeat of the last key, so
      // under the frozen clock the first toast ("5 of 10 done") outlives all ten. The
      // toast is not part of the finish line, and a stale one is a picture of a state the
      // app never shows, so this scene photographs without it. (Ticking the clock per
      // press instead makes `doneAt` race the re-render, and the done log reorders.)
      await page.addStyleTag({ content: "[data-sonner-toaster] { display: none !important; }" });
    },
  },
  {
    name: "updates",
    arrive: async (page) => {
      await open(page, "/updates", "u1");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    },
  },
  {
    name: "system",
    arrive: async (page) => {
      await open(page, "/system", "u1");
      await expect(page.getByText("Foundations").first()).toBeVisible();
    },
  },
  {
    name: "deck",
    arrive: async (page) => {
      await open(page, "/deck", "u1");
      await expect(page.locator("main, [data-slide]").first()).toBeVisible();
    },
  },
];

for (const scene of SCENES) {
  test.describe(`G3 baseline · ${scene.name}`, () => {
    for (const width of WIDTHS) {
      test(`${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: HEIGHT });
        await scene.arrive(page);
        await page.evaluate(() => document.fonts.ready);
        await freeze(page);
        await expect(page).toHaveScreenshot(`${scene.name}-${width}.png`);
      });
    }
  });
}
