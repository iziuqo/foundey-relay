import { test, expect, type Page } from "@playwright/test";

// Gates G3 (text) and G7 (layout) for the "My work" screen (plan §9.1, Phase 3 exit
// gate). G2's screenshot baselines need a human to approve them, so they aren't here.

const breakpoints = [390, 768, 1024, 1280, 1440, 1920];

async function resetDemo(page: Page) {
  await page.addInitScript(() => window.localStorage.removeItem("relay-demo-v2"));
}

test.describe("G7 layout (/work)", () => {
  for (const width of breakpoints) {
    test(`no horizontal scroll at ${width}px`, async ({ page }) => {
      await resetDemo(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work");
      await expect(page.getByTestId("hero")).toBeVisible();
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }

  test("main column is at least 36rem at 1280 and up", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/work");
    const box = await page.getByTestId("work-main").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(576 - 1); // 36rem
  });

  test("the rail never overlaps the main column at 1440", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work");
    const main = await page.getByTestId("work-main").boundingBox();
    const rail = await page.getByTestId("work-rail").boundingBox();
    expect(main).not.toBeNull();
    expect(rail).not.toBeNull();
    expect(main!.x + main!.width).toBeLessThanOrEqual(rail!.x + 1);
  });

  test("the rail is hidden below 1200 (v3 M3: it does not disappear at 1279 and reappear at 1280)", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto("/work");
    await expect(page.getByTestId("work-rail")).toBeHidden();
  });

  test("the rail is visible at exactly 1200, and the main column caps at 720px centered just below it", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");

    await page.setViewportSize({ width: 1199, height: 900 });
    await expect(page.getByTestId("work-rail")).toBeHidden();
    const capped = await page.getByTestId("work-main").boundingBox();
    expect(capped!.width).toBeLessThanOrEqual(720 + 1);

    await page.setViewportSize({ width: 1200, height: 900 });
    await expect(page.getByTestId("work-rail")).toBeVisible();
  });
});

test.describe("G3 text (/work)", () => {
  for (const width of [390, 1440]) {
    test(`no computed font under 14px outside kbd at ${width}px`, async ({ page }) => {
      await resetDemo(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work");
      await expect(page.getByTestId("hero")).toBeVisible();
      const tooSmall = await page.evaluate(() => {
        const offenders: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("body *")) {
          if (el.closest("[data-kbd]")) continue;
          if (!el.textContent?.trim()) continue;
          const hasDirectText = Array.from(el.childNodes).some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
          );
          if (!hasDirectText) continue;
          const size = parseFloat(getComputedStyle(el).fontSize);
          if (size < 14) offenders.push(`${el.tagName}.${el.className}: ${size}px "${el.textContent?.slice(0, 30)}"`);
        }
        return offenders;
      });
      expect(tooSmall).toEqual([]);
    });
  }

  test("the hero title never clips (scrollWidth <= clientWidth)", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/work");
    const title = page.getByTestId("hero-title");
    await expect(title).toBeVisible();
    const overflow = await title.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("the hero why line never clips", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/work");
    const why = page.getByTestId("hero-why");
    await expect(why).toBeVisible();
    const overflow = await why.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
