import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Gates G3 (text) and G7 (layout) for /team (plan §9.1, Phase 5 exit gate). G2's
// screenshot baselines need a human to approve them, so they aren't here. Tests run as
// Danielle (manager) — she is the only persona that sees the risk tiles and Needs you
// (§6.3), so that's the view these gates need to cover.

const breakpoints = [390, 768, 1024, 1280, 1440, 1920];

async function gotoTeamAsManager(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("relay-demo-v2", JSON.stringify({ state: { persona: "m1" }, version: 0 }));
  });
  await page.goto("/team");
  await expect(page.getByTestId("team-main")).toBeVisible();
}

test.describe("G7 layout (/team)", () => {
  for (const width of breakpoints) {
    test(`no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoTeamAsManager(page);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }

  test("the Needs you rail is hidden below 1280 (§5)", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 });
    await gotoTeamAsManager(page);
    await expect(page.getByTestId("team-rail")).toBeHidden();
  });

  test("the Needs you rail appears at 1280 and up, and never overlaps main", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoTeamAsManager(page);
    const main = await page.getByTestId("team-main").boundingBox();
    const rail = await page.getByTestId("team-rail").boundingBox();
    expect(main).not.toBeNull();
    expect(rail).not.toBeNull();
    expect(main!.x + main!.width).toBeLessThanOrEqual(rail!.x + 1);
  });

  test("risk tiles never overlap each other at 1440", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoTeamAsManager(page);
    const tiles = page.getByTestId("risk-tiles").getByRole("button");
    const count = await tiles.count();
    expect(count).toBe(4);
    const boxes = await Promise.all(Array.from({ length: count }, (_, i) => tiles.nth(i).boundingBox()));
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]!;
        const b = boxes[j]!;
        const overlaps = a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
        expect(overlaps).toBe(false);
      }
    }
  });
});

test.describe("G3 text (/team)", () => {
  for (const width of [390, 1440]) {
    test(`no computed font under 14px outside kbd at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoTeamAsManager(page);
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

  test("no role or 'On:' line clips (scrollWidth <= clientWidth)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await gotoTeamAsManager(page);
    for (const testId of ["person-role", "person-on"]) {
      const nodes = page.getByTestId(testId);
      const count = await nodes.count();
      for (let i = 0; i < count; i++) {
        const overflow = await nodes.nth(i).evaluate((el) => el.scrollWidth - el.clientWidth);
        expect(overflow).toBeLessThanOrEqual(1);
      }
    }
  });
});

test.describe("Team defect fixes (README §6)", () => {
  test("the 'On:' icon takes the item's own tier, not a hardcoded Act now octagon (P0 8)", async ({ page }) => {
    await gotoTeamAsManager(page);
    // Luis Herrera is on it-08, which scores into "next" (Up next) at the seed clock —
    // v1 hardcoded every row to the Act now ("now") octagon regardless.
    const row = page.locator("li", { hasText: "Luis Herrera" });
    await expect(row.getByTestId("person-on")).toHaveAttribute("data-tier", "next");
  });

  test("risk tiles are real toggle filters with aria-pressed (P1 20)", async ({ page }) => {
    await gotoTeamAsManager(page);
    const noOwnerTile = page.getByTestId("risk-tiles").getByRole("button", { name: /No owner/ });
    await expect(noOwnerTile).toHaveAttribute("aria-pressed", "false");
    await noOwnerTile.click();
    await expect(noOwnerTile).toHaveAttribute("aria-pressed", "true");
    await noOwnerTile.click();
    await expect(noOwnerTile).toHaveAttribute("aria-pressed", "false");
  });

  test("Check in opens a read-only sheet scrolled to that person's queue", async ({ page }) => {
    await gotoTeamAsManager(page);
    const row = page.locator("li", { hasText: "Luis Herrera" });
    await row.getByRole("button", { name: "Check in" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // Read only: no action buttons inside the sheet, only plain rows.
    await expect(page.getByRole("dialog").getByRole("button", { name: "Mark done" })).toHaveCount(0);
  });

  test("an unowned item's Assign action opens a working popover, not a dead control (P1 20)", async ({ page }) => {
    await gotoTeamAsManager(page);
    await page.getByTestId("risk-tiles").getByRole("button", { name: /No owner/ }).click();
    const assignButton = page.getByTestId("team-rail").getByRole("button", { name: "Assign" }).first();
    await assignButton.click();
    await expect(page.getByPlaceholder("Find a teammate")).toBeVisible();
  });
});

test.describe("G4 accessibility (/team)", () => {
  test("the manager board has zero axe violations", async ({ page }) => {
    await gotoTeamAsManager(page);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("the check-in sheet has zero axe violations", async ({ page }) => {
    await gotoTeamAsManager(page);
    await page.locator("li", { hasText: "Luis Herrera" }).getByRole("button", { name: "Check in" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("the assign popover has zero axe violations", async ({ page }) => {
    await gotoTeamAsManager(page);
    await page.getByTestId("risk-tiles").getByRole("button", { name: /No owner/ }).click();
    await page.getByTestId("team-rail").getByRole("button", { name: "Assign" }).first().click();
    await expect(page.getByPlaceholder("Find a teammate")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
