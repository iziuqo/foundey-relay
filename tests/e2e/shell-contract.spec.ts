import { test, expect, type Page } from "@playwright/test";

// v3 M3 exit gate (plan §10.2): the app shell — nav rail, top bar, mode switch,
// bottom dock, and the page grid's rail rule. G2 (control heights, one location
// cue) and G3 (the six-width matrix, no horizontal scroll, the rail behaving per
// §5.7) for the shell itself, independent of any one screen's content.

const breakpoints = [390, 768, 1024, 1280, 1440, 1920];

async function resetDemo(page: Page) {
  await page.addInitScript(() => window.localStorage.removeItem("relay-demo-v2"));
}

test.describe("G3 shell layout", () => {
  for (const width of breakpoints) {
    test(`no horizontal scroll on the shell at ${width}px`, async ({ page }) => {
      await resetDemo(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work");
      await expect(page.getByRole("radiogroup", { name: "Appearance" })).toBeVisible();
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }

  test("the nav rail is hidden below 1024, icon-only at 1024, and full-width at 1280", async ({ page }) => {
    await resetDemo(page);
    const nav = page.getByTestId("nav-rail");

    await page.setViewportSize({ width: 1023, height: 900 });
    await page.goto("/work");
    await expect(nav).toBeHidden();

    await page.setViewportSize({ width: 1024, height: 900 });
    let box = await nav.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThan(120); // icon rail, 64px

    await page.setViewportSize({ width: 1280, height: 900 });
    box = await nav.boundingBox();
    expect(box!.width).toBeGreaterThan(200); // full rail, 240px
  });

  test("the bottom dock replaces the nav rail below 1024, and never both at once", async ({ page }) => {
    await resetDemo(page);
    const dock = page.getByTestId("bottom-dock");
    const rail = page.getByTestId("nav-rail");

    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto("/work");
    await expect(dock).toBeVisible();
    await expect(rail).toBeHidden();
    const box = await dock.boundingBox();
    expect(box).not.toBeNull();
    // Flush to the viewport edges (v2's floating pill sat 12px in on both sides).
    expect(box!.x).toBeLessThanOrEqual(1);
    expect(box!.width).toBeGreaterThanOrEqual(767);

    await page.setViewportSize({ width: 1024, height: 900 });
    await expect(dock).toBeHidden();
    await expect(rail).toBeVisible();
  });

  test("the mobile primary action never overlaps the bottom dock at 390", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/work");
    const dock = page.getByTestId("bottom-dock");
    const cta = page.getByTestId("work-mobile-cta");
    const dockBox = await dock.boundingBox();
    const ctaBox = await cta.boundingBox();
    expect(dockBox).not.toBeNull();
    expect(ctaBox).not.toBeNull();
    expect(ctaBox!.y + ctaBox!.height).toBeLessThanOrEqual(dockBox!.y + 1);
  });
});

test.describe("G2 shell controls", () => {
  test("the mode switch and the demo trigger share one control height", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work");

    const modeButtons = page.getByRole("radiogroup", { name: "Appearance" }).getByRole("radio");
    const demoTrigger = page.getByRole("button", { name: /^Demo:/ });
    const heights = new Set<number>();
    for (const box of await Promise.all([
      modeButtons.nth(0).boundingBox(),
      modeButtons.nth(1).boundingBox(),
      modeButtons.nth(2).boundingBox(),
      demoTrigger.boundingBox(),
    ])) {
      heights.add(Math.round(box!.height));
    }
    expect(heights.size).toBe(1);
  });

  test("the nav rail's active state is the only location cue — the top bar names no page", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work");
    const header = page.locator("header");
    await expect(header.getByText(/my work/i)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "My work" })).toHaveAttribute("aria-current", "page");
  });
});

test.describe("Mode switch", () => {
  test("Light, Dark and Wire are three first-class, independently reachable states", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");
    await expect(html).toHaveAttribute("data-fidelity", "hi");

    const group = page.getByRole("radiogroup", { name: "Appearance" });
    await group.getByRole("radio", { name: "Wire" }).click();
    await expect(html).toHaveAttribute("data-fidelity", "wire");
    await expect(group.getByRole("radio", { name: "Wire" })).toHaveAttribute("aria-checked", "true");

    await group.getByRole("radio", { name: "Dark" }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    // Selecting a theme leaves wire mode — it is a fidelity transform independent
    // of theme, not a fourth combined state a reviewer has to reason about.
    await expect(html).toHaveAttribute("data-fidelity", "hi");

    await group.getByRole("radio", { name: "Light" }).click();
    await expect(html).toHaveAttribute("data-theme", "light");
  });
});
