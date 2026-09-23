import { test, expect, type Page } from "@playwright/test";
import { axeViolations } from "./axe";

// Gates G2 (§9.1), G3 (text) and G4 (a11y) for /team (plan §10, M6 exit gate). G2's
// screenshot baselines need a human to approve them, so they aren't here. Tests run as
// Danielle (manager) — she is the only persona that sees the risk tiles and Needs you
// (§7.4), so that's the view these gates need to cover; a handful also check the
// worker's read-only mirror of the same board.

const breakpoints = [390, 768, 1024, 1280, 1440, 1920];

async function gotoTeamAsManager(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("relay-demo-v2", JSON.stringify({ state: { persona: "m1" }, version: 0 }));
  });
  await page.goto("/team");
  await expect(page.getByTestId("team-main")).toBeVisible();
}

async function gotoTeamAsWorker(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("relay-demo-v2", JSON.stringify({ state: { persona: "u1" }, version: 0 }));
  });
  await page.goto("/team");
  await expect(page.getByTestId("team-main")).toBeVisible();
}

test.describe("G3 layout (/team)", () => {
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

  // §7.4/§5.1: Needs you holds Assign/Acknowledge controls, so — unlike v2 — it can
  // never live in `PageRail` (zero interactive elements there, page-grid.tsx). It
  // stacks above the roster in the main column at every width instead.
  test("Needs you stacks above the roster in the main column at every width", async ({ page }) => {
    for (const width of [1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoTeamAsManager(page);
      const needsYou = page.getByTestId("needs-you");
      const board = page.getByTestId("team-board");
      await expect(needsYou).toBeVisible();
      const needsBox = await needsYou.boundingBox();
      const boardBox = await board.boundingBox();
      expect(needsBox).not.toBeNull();
      expect(boardBox).not.toBeNull();
      expect(needsBox!.y + needsBox!.height).toBeLessThanOrEqual(boardBox!.y + 1);
    }
  });

  test("risk tiles never overlap each other at 1440", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoTeamAsManager(page);
    const tiles = page.getByTestId("risk-tiles").getByRole("button");
    // toHaveCount polls; count() reads once. The tiles only exist after the store
    // rehydrates the seeded persona from localStorage, so a single read races hydration
    // — it passed only because a production build won the race (same failure mode as
    // a617ca5: assert the settled state, don't sample it).
    await expect(tiles).toHaveCount(4);
    const count = 4;
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

  // craft.spec.ts's check 3 (one row height per list) runs at Playwright's default
  // viewport, not 390 — it would not have caught v2's 88/67 spread, which only showed
  // up on a narrow phone. This is that check, at the width that matters, for both of
  // /team's lists (`.roster-row` reserves a taller fixed height below 768 specifically
  // so "working on" can wrap without ever needing to be that spread).
  test("every roster and Needs You row shares one height at 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await gotoTeamAsManager(page);
    for (const testId of ["needs-you", "team-board"]) {
      const heights = await page.getByTestId(testId).evaluate((list) => [
        ...new Set([...list.querySelectorAll("[data-craft-row]")].map((row) => Math.round(row.getBoundingClientRect().height))),
      ]);
      expect(heights, `${testId} row heights at 390`).toHaveLength(1);
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

  // Role is allowed to clip — advisor §7.4 clamps it onto the name's own line
  // precisely so it *can't* wrap onto a second one and reintroduce the 88/67 spread.
  // "Working on" keeps the opposite guarantee: never truncated, at any width — the
  // roster row is tall enough below 768 to hold two wrapped lines of it instead.
  test("'working on' never clips (scrollWidth <= clientWidth)", async ({ page }) => {
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoTeamAsManager(page);
      const nodes = page.getByTestId("person-on");
      const count = await nodes.count();
      for (let i = 0; i < count; i++) {
        const overflow = await nodes.nth(i).evaluate((el) => el.scrollWidth - el.clientWidth);
        expect(overflow).toBeLessThanOrEqual(1);
      }
    }
  });
});

test.describe("Team defect fixes (README §6, plan §7.4)", () => {
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

  // §7.4's whole point: the roster's seven identical "Check in" buttons are gone, and
  // nothing on the page says the generic verb again — every action names what it does.
  test("the generic 'Check in' verb appears nowhere on the page", async ({ page }) => {
    await gotoTeamAsManager(page);
    await expect(page.getByText("Check in", { exact: true })).toHaveCount(0);
  });

  test("selecting a roster row opens a read-only sheet scrolled to that person's queue", async ({ page }) => {
    await gotoTeamAsManager(page);
    await page.getByRole("button", { name: "Open Luis's queue" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // Read only: no action buttons inside the sheet, only plain rows.
    await expect(page.getByRole("dialog").getByRole("button", { name: "Mark done" })).toHaveCount(0);
  });

  test("a flagged Needs You row's action names the person, never 'Check in'", async ({ page }) => {
    await gotoTeamAsManager(page);
    const row = page.getByTestId("needs-you").locator("li", { hasText: "No update for" });
    await expect(row.getByRole("button")).toHaveText(/Open .+'s queue/);
  });

  test("the roster's ghost menu reassigns the person's current item (a real quick action, not a dead control)", async ({ page }) => {
    await gotoTeamAsManager(page);
    const row = page.locator("li", { hasText: "Priya Raman" });
    await row.getByRole("button", { name: "Reassign Priya's current item" }).click();
    await expect(page.getByPlaceholder("Find a teammate")).toBeVisible();
  });

  test("a worker sees the same roster read only — no reassign menu, no Needs You", async ({ page }) => {
    await gotoTeamAsWorker(page);
    await expect(page.getByTestId("needs-you")).toHaveCount(0);
    await expect(page.getByTestId("risk-tiles")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Reassign .+'s current item/ })).toHaveCount(0);
    // The row itself still opens the read-only sheet — the mirror is real, not a stub.
    await page.getByRole("button", { name: "Open Luis's queue" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("an unowned item's Assign action opens a working popover, not a dead control (P1 20)", async ({ page }) => {
    await gotoTeamAsManager(page);
    await page.getByTestId("risk-tiles").getByRole("button", { name: /No owner/ }).click();
    const assignButton = page.getByTestId("needs-you").getByRole("button", { name: "Assign" }).first();
    await assignButton.click();
    await expect(page.getByPlaceholder("Find a teammate")).toBeVisible();
  });
});

test.describe("G4 accessibility (/team)", () => {
  test("the manager board has zero axe violations", async ({ page }) => {
    await gotoTeamAsManager(page);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("the worker's read-only board has zero axe violations", async ({ page }) => {
    await gotoTeamAsWorker(page);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("the person sheet has zero axe violations", async ({ page }) => {
    await gotoTeamAsManager(page);
    await page.getByRole("button", { name: "Open Luis's queue" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("the reassign popover has zero axe violations", async ({ page }) => {
    await gotoTeamAsManager(page);
    await page.locator("li", { hasText: "Priya Raman" }).getByRole("button", { name: "Reassign Priya's current item" }).click();
    await expect(page.getByPlaceholder("Find a teammate")).toBeVisible();
    // The popover's own entrance animation (.popover-content, globals.css) fades opacity
    // 0 -> 1 over --dur-base (240ms). `toBeVisible()` above is satisfied the instant
    // opacity leaves 0, not once the fade settles — axe factors an element's *current*
    // opacity into its contrast math, so analyzing mid-fade reports whatever partial
    // blend the popover happens to be at that instant (flaky, and not a real defect).
    // Settling past the animation's own duration before analyzing is what makes this
    // check the same steady state a user actually reads.
    await page.waitForTimeout(300);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("the Needs You assign popover has zero axe violations", async ({ page }) => {
    await gotoTeamAsManager(page);
    await page.getByTestId("risk-tiles").getByRole("button", { name: /No owner/ }).click();
    await page.getByTestId("needs-you").getByRole("button", { name: "Assign" }).first().click();
    await expect(page.getByPlaceholder("Find a teammate")).toBeVisible();
    await page.waitForTimeout(300);
    expect(await axeViolations(page)).toEqual([]);
  });
});
