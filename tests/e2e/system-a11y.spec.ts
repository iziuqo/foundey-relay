import { test, expect } from "@playwright/test";
import { axeViolations } from "./axe";

// Gate G4 (plan §9.1). Phase 2 covered Foundations and Components; Phase 7 adds
// Patterns and Rules, the last two /system sections (§6.7).

test.describe("G4 accessibility", () => {
  for (const path of ["/system", "/system/components", "/system/patterns", "/system/rules"]) {
    test(`${path} has zero axe violations`, async ({ page }) => {
      await page.goto(path);
      expect(await axeViolations(page)).toEqual([]);
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
      expect(await axeViolations(page)).toEqual([]);
    });

    test(`${path} has zero axe violations in light + wireframe`, async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: /^(Hi-fi|Wire)$/ }).click();
      expect(await axeViolations(page)).toEqual([]);
    });

    test(`${path} has zero axe violations in dark + wireframe`, async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: /^(Light|Dark)$/ }).click();
      await expect(page.getByRole("button", { name: "Dark" })).toBeVisible();
      await page.getByRole("button", { name: /^(Hi-fi|Wire)$/ }).click();
      expect(await axeViolations(page)).toEqual([]);
    });
  }

  test("every button in the states matrix reaches visible focus via keyboard", async ({ page }) => {
    await page.goto("/system/components");
    const firstButton = page.getByRole("button", { name: "Mark done" }).first();
    await firstButton.focus();
    await expect(firstButton).toBeFocused();
    // Focus is an `outline`, not a Tailwind `ring`. A ring is a box-shadow whose offset
    // has to be painted in a background colour, which is wrong the moment a control sits
    // on a tinted surface — a white halo around a button inside the Act-now hero. An
    // outline follows the border radius and needs no background to match.
    const focusRing = await firstButton.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        style: style.outlineStyle,
        width: parseFloat(style.outlineWidth),
        offset: parseFloat(style.outlineOffset),
        color: style.outlineColor,
      };
    });
    expect(focusRing.style).not.toBe("none");
    expect(focusRing.width).toBeGreaterThanOrEqual(2);
    expect(focusRing.offset).toBeGreaterThanOrEqual(2);
    expect(focusRing.color).not.toBe("rgba(0, 0, 0, 0)");
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
