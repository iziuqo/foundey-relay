import { expect, test } from "@playwright/test";
import { axeViolations } from "./axe";
import { animationsSettled } from "./settle";

/**
 * `/` — the case study a reviewer opens first.
 *
 * It is a marketing page, which is exactly why it is in this suite rather than trusted:
 * a page whose argument is that colour is decoration, that every target clears 44px and
 * that nothing is graded by eye does not get to be the one route nobody measures.
 *
 * The sections are revealed with an IntersectionObserver, so every check below walks the
 * page to the bottom first. Reading a page that has not been scrolled would grade the
 * hero and call it the site.
 */
const WIDTHS = [390, 768, 1024, 1280, 1440, 1920];

async function openSite(page: import("@playwright/test").Page, width = 1440) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Fire every Reveal, then come back to the top, so nothing is measured mid-fade.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 20));
    }
    window.scrollTo(0, 0);
  });
  await animationsSettled(page);
}

test.describe("site: /", () => {
  for (const width of [390, 768, 1440]) {
    test(`G4 · zero axe violations at ${width}`, async ({ page }) => {
      await openSite(page, width);
      expect(await axeViolations(page)).toEqual([]);
    });
  }

  test("G3 · no horizontal scroll at any width", async ({ page }) => {
    await openSite(page, WIDTHS.at(-1));
    const overflowing: string[] = [];
    for (const width of WIDTHS) {
      // Resized rather than reloaded: the page's layout is CSS all the way down, and six
      // navigations against a dev server is a test that times out rather than a test that
      // measures more.
      await page.setViewportSize({ width, height: 900 });
      await page.waitForTimeout(120);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      if (overflow > 0) overflowing.push(`${width}: ${overflow}px`);
    }
    expect(overflowing, "widths that scroll sideways").toEqual([]);
  });

  test("one h1, and no heading level is skipped", async ({ page }) => {
    await openSite(page);
    const levels = await page.evaluate(() =>
      [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => Number(h.tagName[1])),
    );
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
    const skips = levels.filter((level, i) => i > 0 && level - levels[i - 1] > 1);
    expect(skips, `heading sequence: ${levels.join(", ")}`).toEqual([]);
  });

  test("every in-page jump lands on something", async ({ page }) => {
    await openSite(page);
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute("href")!),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    const missing = await page.evaluate(
      (list) => list.filter((href) => !document.querySelector(href)),
      hrefs,
    );
    expect(missing, "anchors with no target").toEqual([]);
  });

  test("every outbound link is safe to open", async ({ page }) => {
    await openSite(page);
    const unsafe = await page.evaluate(() =>
      [...document.querySelectorAll('a[target="_blank"]')]
        .filter((a) => !(a.getAttribute("rel") ?? "").includes("noopener"))
        .map((a) => a.getAttribute("href")!),
    );
    expect(unsafe, "target=_blank without rel=noopener").toEqual([]);
  });

  test("G5 · the fidelity switch is a real radiogroup, and it swaps the picture", async ({
    page,
  }) => {
    await openSite(page);
    const group = page.getByRole("radiogroup", { name: "Screenshot fidelity" });
    const colour = group.getByRole("radio", { name: "Colour" });
    const wire = group.getByRole("radio", { name: "Wire" });

    await expect(colour).toHaveAttribute("aria-checked", "true");
    const wireShot = page.locator('[data-shot="wire"]');
    await expect(wireShot).toHaveCSS("opacity", "0");

    await wire.click();
    await expect(wire).toHaveAttribute("aria-checked", "true");
    await expect(colour).toHaveAttribute("aria-checked", "false");
    await expect(wireShot).toHaveCSS("opacity", "1");

    // Arrow keys move the selection, which is what makes it a radiogroup rather than two
    // buttons that look like one.
    await wire.press("ArrowLeft");
    await expect(colour).toHaveAttribute("aria-checked", "true");
    await expect(colour).toBeFocused();
  });

  test("G2 · every target clears 44px at 390", async ({ page }) => {
    await openSite(page, 390);
    const small = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll("a, button")) {
        const box = el.getBoundingClientRect();
        if (box.width === 0 && box.height === 0) continue;
        // The tap-48 pseudo-element grows the target without growing the box, so the
        // measurement has to include it — same rule the app's own size contract uses.
        const before = getComputedStyle(el, "::before");
        const grown = before.content !== "none" && before.position === "absolute";
        const height = grown ? Math.max(box.height, parseFloat(before.height) || 0) : box.height;
        if (height < 44 && el.closest("a, button") === el) {
          out.push(`${el.tagName.toLowerCase()} "${el.textContent?.trim().slice(0, 28)}" ${Math.round(height)}px`);
        }
      }
      return out;
    });
    expect(small, "targets under 44px at 390").toEqual([]);
  });
});
