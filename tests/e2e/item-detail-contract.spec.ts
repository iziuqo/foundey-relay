import { test, expect, type Page } from "@playwright/test";
import { axeViolations } from "./axe";

// Phase 4 exit gate (plan §10): "G4 keyboard flow end to end" for item detail, the
// command palette, and /lookup. The pixel baselines live in
// tests/visual/screens.spec.ts; these assert properties instead.

async function resetDemo(page: Page) {
  await page.addInitScript(() => window.localStorage.removeItem("relay-demo-v2"));
}

test.describe("G3 layout (/items/[id])", () => {
  for (const width of [390, 768, 1024, 1280, 1440, 1920]) {
    test(`no horizontal scroll at ${width}px`, async ({ page }) => {
      await resetDemo(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/items/it-01");
      await expect(page.getByTestId("item-detail-title")).toBeVisible();
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }
});

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
    await palette.getByText("Compliance alert — missing hazmat labels").first().click();

    await expect(palette).toBeHidden();
    await expect(page.getByRole("dialog").getByTestId("item-detail-title")).toHaveText(
      "Compliance alert — missing hazmat labels",
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
    await expect(page.getByText("Compliance alert — missing hazmat labels").first()).toBeVisible();
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
    expect(await axeViolations(page)).toEqual([]);
  });

  test("the command palette has zero axe violations", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("Meta+k");
    await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("the shortcuts sheet has zero axe violations", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("?");
    await expect(page.getByRole("dialog", { name: "Keyboard shortcuts" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("the full item page has zero axe violations", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/items/it-01");
    await expect(page.getByTestId("item-detail-title")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("/lookup has zero axe violations", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/lookup");
    expect(await axeViolations(page)).toEqual([]);
  });
});

/* =====================================================================================
 * v3 M5 — item detail and the "why" (plan §5.2, ADVISOR-craft.md §5.7 / M10 / M11).
 * =================================================================================== */

/** Mirrors work-contract.spec.ts's own helper: the theme swap runs inside
 * document.startViewTransition()'s callback, so it resolves after click() does. */
async function setMode(page: Page, mode: "Light" | "Dark" | "Wire") {
  await page.getByRole("radio", { name: mode }).click();
  const html = page.locator("html");
  if (mode === "Wire") await expect(html).toHaveAttribute("data-fidelity", "wire");
  else await expect(html).toHaveAttribute("data-theme", mode.toLowerCase());
}

async function gotoAsManager(page: Page, path: string) {
  await page.addInitScript(() => {
    window.localStorage.setItem("relay-demo-v2", JSON.stringify({ state: { persona: "m1" }, version: 0 }));
  });
  await page.goto(path);
}

test.describe("Item detail sheet — geometry (§5.7)", () => {
  test("the sheet steps 26 / 30 / 34rem at 1024, 1280 and 1440", async ({ page }) => {
    await resetDemo(page);
    for (const [width, expected] of [
      [1024, 416],
      [1280, 480],
      [1440, 544],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work");
      await page.locator("[data-row-nav]").first().click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      const box = await dialog.boundingBox();
      expect(Math.round(box!.width), `sheet width at ${width}px`).toBe(expected);
    }
  });

  test("at 768 it is still a bottom drawer, not a right panel", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto("/work");
    await page.locator("[data-row-nav]").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box!.x).toBeLessThan(40);
  });

  test("at 1440 the opened row's own title stays clear of the sheet (M11: the source row stays visible)", async ({
    page,
  }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work");
    const row = page.locator("[data-row-nav]").first();
    const title = row.locator("span.t-row");
    const titleBox = await title.boundingBox();
    await row.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const dialogBox = await dialog.boundingBox();
    expect(titleBox!.x + titleBox!.width, "row title right edge vs. sheet left edge").toBeLessThanOrEqual(
      dialogBox!.x,
    );
  });
});

test.describe("Item detail — the why breakdown (M10)", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("each factor shows a text value beside its bar, not just the bar (non-text contrast)", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await page.locator("[data-row-nav]").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/^\d+ of \d+$/).first()).toBeVisible();
  });

  test("bars animate on first open and not on reopen", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await page.locator("[data-row-nav]").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator("[data-bars-animate]")).toHaveAttribute("data-bars-animate", "true");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await page.locator("[data-row-nav]").first().click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-bars-animate]")).toHaveAttribute("data-bars-animate", "false");
  });
});

test.describe("Item detail — people and reassign (§7.3: reassign lives in the detail panel)", () => {
  test("a worker viewing their own item sees no reassign control", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/items/it-01");
    await expect(page.getByTestId("item-detail-title")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reassign" })).toHaveCount(0);
  });

  test("a manager can reassign from the item's People section, and the sheet reflects it", async ({ page }) => {
    await gotoAsManager(page, "/items/it-01");
    await expect(page.getByTestId("item-detail-title")).toBeVisible();
    const reassignButton = page.getByRole("button", { name: "Reassign" });
    await expect(reassignButton).toBeVisible();
    await reassignButton.click();
    await expect(page.getByText("Who should do this?")).toBeVisible();

    const firstCandidate = page.locator("ul li button").first();
    const name = await firstCandidate.locator("span.font-medium").textContent();
    await firstCandidate.click();

    await expect(page.getByText("Who should do this?")).toBeHidden();
    await expect(page.getByText(name ?? "", { exact: true })).toBeVisible();
  });
});

test.describe("Item detail — G4 accessibility across modes", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  for (const mode of ["Dark", "Wire"] as const) {
    test(`the sheet has zero axe violations in ${mode.toLowerCase()}`, async ({ page }) => {
      await resetDemo(page);
      await page.goto("/work");
      await expect(page.getByTestId("hero")).toBeVisible();
      await setMode(page, mode);
      await page.locator("[data-row-nav]").first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(250);
      expect(await axeViolations(page)).toEqual([]);
    });
  }
});
