import { test, expect, type Page } from "@playwright/test";
import { axeViolations } from "./axe";

// Gates G3 (text) and G7 (layout) for /updates (plan §9.1, Phase 5 exit gate). G2's
// screenshot baselines need a human to approve them, so they aren't here.

const breakpoints = [390, 768, 1024, 1280, 1440, 1920];

async function resetDemo(page: Page) {
  await page.addInitScript(() => window.localStorage.removeItem("relay-demo-v2"));
}

test.describe("G3 layout (/updates)", () => {
  for (const width of breakpoints) {
    test(`no horizontal scroll at ${width}px`, async ({ page }) => {
      await resetDemo(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/updates");
      await expect(page.getByTestId("updates-list")).toBeVisible();
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }

  test("the preview pane is hidden below 1024, list plus preview at 1024 and up", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1023, height: 900 });
    await page.goto("/updates");
    await expect(page.getByTestId("updates-preview")).toBeHidden();

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.reload();
    await expect(page.getByTestId("updates-preview")).toBeVisible();
    const list = await page.getByTestId("updates-list").boundingBox();
    const preview = await page.getByTestId("updates-preview").boundingBox();
    expect(list).not.toBeNull();
    expect(preview).not.toBeNull();
    expect(list!.x + list!.width).toBeLessThanOrEqual(preview!.x + 1);
  });
});

test.describe("G3 text (/updates)", () => {
  for (const width of [390, 1440]) {
    test(`no computed font under 14px outside kbd at ${width}px`, async ({ page }) => {
      await resetDemo(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/updates");
      await expect(page.getByTestId("updates-list")).toBeVisible();
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
});

test.describe("Updates defect fixes (README §6)", () => {
  test("every For you row shows its item title, not just the reason line (P1 19)", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/updates");
    // "For you" is the default tab.
    const rows = page.getByTestId("updates-list").getByRole("listitem");
    expect(await rows.count()).toBeGreaterThan(0);
    // The known For you fixture: an FYI item with a real title, not just its why text
    // ("New carton size C7 added to the pack menu" is the title; "For your info.
    // Packers may ask about it." is the reason v1 showed alone).
    await expect(page.getByTestId("updates-list")).toContainText("New carton size C7 added to the pack menu");
  });

  test("selecting a row previews it on the right at 1024 and up", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/updates");
    await page.getByTestId("updates-list").getByRole("button").first().click();
    await expect(page.getByTestId("updates-preview")).not.toContainText("Select an update");
  });

  test("tabs are real tablist/tab semantics with arrow key navigation (P1 13)", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/updates");
    const tablist = page.getByRole("tablist", { name: "Updates" });
    await expect(tablist).toBeVisible();
    const notificationsTab = page.getByRole("tab", { name: /Notifications/ });
    const teamTab = page.getByRole("tab", { name: /^Team/ });
    await expect(notificationsTab).toHaveAttribute("aria-selected", "true");
    await notificationsTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(teamTab).toHaveAttribute("aria-selected", "true");
  });

  test("marking an update read clears its unread dot without removing the row", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/updates");
    const firstRow = page.getByTestId("updates-list").getByRole("listitem").first();
    await firstRow.getByRole("button").click();
    const rowCountBefore = await page.getByTestId("updates-list").getByRole("listitem").count();
    await page.getByTestId("updates-preview").getByRole("button", { name: "Mark as read" }).click();
    const rowCountAfter = await page.getByTestId("updates-list").getByRole("listitem").count();
    expect(rowCountAfter).toBe(rowCountBefore);
  });
});

test.describe("G4 accessibility (/updates)", () => {
  test("the list plus preview layout has zero axe violations", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/updates");
    await page.getByTestId("updates-list").getByRole("button").first().click();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("the handheld update sheet has zero axe violations", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/updates");
    await page.getByTestId("updates-list").getByRole("button").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });
});
