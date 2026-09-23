import { test, expect } from "@playwright/test";
import { axeViolations } from "./axe";

// Phase 7 exit: /deck and /deck/print (plan §6.8, §10). G2's screenshot baselines
// need a human to approve them, so they aren't here.

test.describe("/deck", () => {
  test("has zero axe violations on the cover slide", async ({ page }) => {
    await page.goto("/deck");
    await expect(page.getByTestId("slide")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("arrow keys move between slides, and the rail reflects the current one", async ({ page }) => {
    await page.goto("/deck");
    await expect(page.getByRole("button", { name: /^1\s*Cover$/ })).toHaveAttribute("aria-current", "true");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: /^2\s/ })).toHaveAttribute("aria-current", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("button", { name: /^1\s*Cover$/ })).toHaveAttribute("aria-current", "true");
  });

  test("clicking a rail entry jumps straight to that slide", async ({ page }) => {
    await page.goto("/deck");
    await page.getByRole("button", { name: /The wireframe/ }).click();
    await expect(page.getByText("The wireframe — deliverable 2")).toBeVisible();
  });

  test("no horizontal scroll at 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/deck");
    await expect(page.getByTestId("slide")).toBeVisible();
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

test.describe("/deck/print", () => {
  test("renders every slide, Part A then Part B, one per PDF page (§6.8)", async ({ page }) => {
    await page.goto("/deck/print");
    const slides = page.locator("[data-deck-print-slide]");
    await expect(slides).toHaveCount(16);
    await expect(slides.nth(0)).toContainText("Relay");
    await expect(slides.nth(9)).toContainText("What we cut");
    await expect(slides.nth(10)).toContainText("Optional");
  });

  test("has zero axe violations", async ({ page }) => {
    await page.goto("/deck/print");
    await expect(page.locator("[data-deck-print-slide]").first()).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });
});
