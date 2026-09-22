import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Phase 4 exit gate (plan §10): "G4 keyboard flow end to end" for item detail, the
// command palette, and /lookup. G2's screenshot baselines need a human to approve them,
// so they aren't here (matches tests/e2e/work-contract.spec.ts's own note).

async function resetDemo(page: Page) {
  await page.addInitScript(() => window.localStorage.removeItem("relay-demo-v2"));
}

test.describe("Item detail sheet (desktop shell, 1280px)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("a queue row opens the intercepting sheet as a right panel, and Escape returns to /work", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await page.locator("[data-row-nav]").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId("item-detail-title")).toBeVisible();
    await expect(page).toHaveURL(/\/items\//);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/work$/);
  });

  test("prev/next inside the sheet replace the route, so one Escape still returns to /work", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await page.locator("[data-row-nav]").first().click();
    const dialog = page.getByRole("dialog");
    const nextButton = dialog.getByRole("button", { name: "Next item" });
    await expect(nextButton).toBeEnabled();

    const firstTitle = await dialog.getByTestId("item-detail-title").textContent();
    await nextButton.click();
    await expect(dialog.getByTestId("item-detail-title")).not.toHaveText(firstTitle ?? "");

    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/work$/);
  });

  test("⌘K opens the command palette; Escape closes it", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("Meta+k");
    const palette = page.getByRole("dialog", { name: "Command palette" });
    await expect(palette).toBeVisible();
    await expect(palette.getByPlaceholder("Search orders, people, tickets")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(palette).toBeHidden();
  });

  test("selecting an item in the palette navigates to it and closes the palette", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("Meta+k");
    const palette = page.getByRole("dialog", { name: "Command palette" });
    await palette.getByPlaceholder("Search orders, people, tickets").fill("hazmat");
    await palette.getByText("Lithium battery orders missing hazmat labels").first().click();

    await expect(palette).toBeHidden();
    await expect(page.getByRole("dialog").getByTestId("item-detail-title")).toHaveText(
      "Lithium battery orders missing hazmat labels",
    );
  });

  test("? opens the keyboard shortcuts sheet", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("?");
    await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
  });

  test("⌘Z undoes the last action even from the top bar hotkey, not just the toast button", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    const titleBefore = await page.getByTestId("hero-title").textContent();
    await page.keyboard.press("e");
    await expect(page.getByText("Done.")).toBeVisible();
    await page.keyboard.press("Meta+z");
    await expect(page.getByText("Restored.")).toBeVisible();
    await expect(page.getByTestId("hero-title")).toHaveText(titleBefore ?? "");
  });
});

test.describe("Item detail (handheld shell, 390px)", () => {
  test.use({ viewport: { width: 390, height: 900 } });

  test("a queue row opens the sheet as a bottom drawer", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await page.locator("[data-row-nav]").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    // A bottom sheet sits at the foot of the viewport, not a right-hand rail.
    expect(box!.x).toBeLessThan(40);
  });

  test("⌘K goes to the /lookup page instead of opening a dialog", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("Meta+k");
    await expect(page).toHaveURL(/\/lookup$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("/items/[id] full page", () => {
  test("renders the same detail outside any dialog, with working prev/next", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    const rowHref = await page.locator("[data-row-nav]").first().getAttribute("href");
    await page.goto(rowHref!);

    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByTestId("item-detail-title")).toBeVisible();
    await expect(page.getByRole("link", { name: /Back to My work/ })).toBeVisible();
  });

  test("an unknown id shows the not-found state instead of crashing", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/items/does-not-exist");
    await expect(page.getByText("This item isn't in the queue anymore.")).toBeVisible();
  });
});

test.describe("/lookup", () => {
  test("lists recent, actions, and searchable items even without a dialog", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/lookup");
    await expect(page.getByText("RECENT")).toBeVisible();
    await expect(page.getByText("ACTIONS")).toBeVisible();
    await page.getByPlaceholder("Search orders, people, tickets").fill("hazmat");
    await expect(page.getByText("Lithium battery orders missing hazmat labels").first()).toBeVisible();
  });
});

test.describe("G4 accessibility", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("the item detail sheet has zero axe violations", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await page.locator("[data-row-nav]").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // Give the row's hover/focus-reveal buttons (a 160ms opacity transition, queue-row.tsx)
    // time to settle back to opacity 0 now that focus moved into the dialog — otherwise
    // axe can race the transition and flag a transient, not-actually-visible frame.
    await page.mouse.move(0, 0);
    await page.waitForTimeout(250);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("the command palette has zero axe violations", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("Meta+k");
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("the shortcuts sheet has zero axe violations", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("?");
    await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("the full item page has zero axe violations", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/items/it-01");
    await expect(page.getByTestId("item-detail-title")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("/lookup has zero axe violations", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/lookup");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
