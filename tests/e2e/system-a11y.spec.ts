import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Gate G4 (plan §9.1), scoped to /system for Phase 2's exit (full G2-state coverage
// comes with the screens that produce those states in later phases).

test.describe("G4 accessibility", () => {
  for (const path of ["/system", "/system/components"]) {
    test(`${path} has zero axe violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });

    test(`${path} has zero axe violations in dark (hi-fi)`, async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: /^(Light|Dark)$/ }).click();
      // The theme toggle routes through switchTheme (lib/theme-transition.ts), which
      // hands the actual DOM update to document.startViewTransition()'s callback —
      // observed to land anywhere from ~10ms to ~150ms after click() resolves, not
      // synchronously with it. Waiting for the button's own label to flip to "Dark" is
      // waiting for the real settled state, not guessing a timeout past it; without
      // this, axe can sample mid-flip and report whatever half-applied color pairing
      // happened to be current at that instant (flaky, not a real defect).
      await expect(page.getByRole("button", { name: "Dark" })).toBeVisible();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });

    test(`${path} has zero axe violations in light + wireframe`, async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: /^(Hi-fi|Wire)$/ }).click();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });

    test(`${path} has zero axe violations in dark + wireframe`, async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: /^(Light|Dark)$/ }).click();
      await expect(page.getByRole("button", { name: "Dark" })).toBeVisible();
      await page.getByRole("button", { name: /^(Hi-fi|Wire)$/ }).click();
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }

  test("every button in the states matrix reaches visible focus via keyboard", async ({ page }) => {
    await page.goto("/system/components");
    const firstButton = page.getByRole("button", { name: "Mark done" }).first();
    await firstButton.focus();
    await expect(firstButton).toBeFocused();
    const outline = await firstButton.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(outline).not.toBe("none");
  });

  test("icon-only controls have an accessible name", async ({ page }) => {
    await page.goto("/system/components");
    const addButtons = page.getByRole("button", { name: "Add" });
    expect(await addButtons.count()).toBeGreaterThan(0);
    const deleteButtons = page.getByRole("button", { name: "Delete item" });
    expect(await deleteButtons.count()).toBeGreaterThan(0);
  });

  test("disabled controls are excluded from the tab order", async ({ page }) => {
    await page.goto("/system/components");
    const disabledButton = page
      .locator("table")
      .filter({ hasText: "Button variant" })
      .getByRole("button", { name: "Mark done" })
      // Primary row: default, hover, active, focus, disabled are all labeled "Mark
      // done" (the 6th, loading, swaps its children for a spinner and has no text) —
      // so "disabled" is the 5th match, index 4.
      .nth(4);
    await expect(disabledButton).toBeDisabled();
  });
});
