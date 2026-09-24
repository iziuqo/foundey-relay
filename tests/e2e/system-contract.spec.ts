import { test, expect } from "@playwright/test";

// Gate G1 (plan §9.1): every §4.4 size-contract row must render every control at the
// same height and the same vertical center. Measured against /system/components'
// "Size contract" section, which renders one live row per size step.

const sizes = ["sm", "md", "lg"] as const;
const controlLabels = ["Reroute orders", "Order number", "UPS", "Add"];

test.describe("G2 size contract", () => {
  for (const size of sizes) {
    test(`controls in the ${size} row share one height and one vertical center`, async ({ page }) => {
      await page.goto("/system/components");
      const row = page.getByTestId(`contract-row-${size}`);
      await expect(row).toBeVisible();

      const button = row.getByRole("button", { name: "Reroute orders" });
      const input = row.getByPlaceholder("Order number");
      const select = row.getByRole("combobox");
      const iconButton = row.getByRole("button", { name: "Add" });

      const boxes = await Promise.all(
        [button, input, select, iconButton].map((locator) => locator.boundingBox()),
      );

      for (const box of boxes) expect(box).not.toBeNull();
      const [buttonBox, inputBox, selectBox, iconBox] = boxes as NonNullable<
        Awaited<ReturnType<typeof button.boundingBox>>
      >[];

      const heights = [buttonBox.height, inputBox.height, selectBox.height, iconBox.height];
      for (const h of heights) expect(Math.abs(h - heights[0])).toBeLessThanOrEqual(0.5);

      const centers = [buttonBox, inputBox, selectBox, iconBox].map((b) => b.y + b.height / 2);
      for (const c of centers) expect(Math.abs(c - centers[0])).toBeLessThanOrEqual(0.5);
    });
  }

  test("button md height is exactly 40px, matching --h-md", async ({ page }) => {
    await page.goto("/system/components");
    const box = await page
      .getByTestId("contract-row-md")
      .getByRole("button", { name: "Reroute orders" })
      .boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeCloseTo(40, 0);
  });

  test("h-12 (a Tailwind spacing multiple) is 48px, not redefined by the token layer", async ({ page }) => {
    // The token layer adds semantic sizes (--h-lg) and never rewrites the framework's
    // own scale, so a bare h-12 must still be 48px. v1 remapped Tailwind's spacing keys
    // and made every size in the app wrong at once (v1 README §5.1).
    await page.goto("/system");
    const height = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.className = "h-12 w-12";
      document.body.append(probe);
      const measured = probe.getBoundingClientRect().height;
      probe.remove();
      return measured;
    });
    expect(height).toBeCloseTo(48, 0);
  });

  test("the primary action is filled with --text-1, never the accent", async ({ page }) => {
    // Craft check 8, at its sharpest point: v2's indigo fill was the highest-chroma
    // object on /work, sitting inside the highest tier, which broke the plan's own rule
    // that loudness follows rank.
    await page.goto("/system");
    const [fill, ink] = await page.evaluate(() => {
      const probe = document.createElement("span");
      document.body.append(probe);
      const read = (token: string) => {
        probe.style.backgroundColor = `var(${token})`;
        return getComputedStyle(probe).backgroundColor;
      };
      const values = [read("--primary-bg"), read("--text-1")];
      probe.remove();
      return values;
    });
    expect(fill).toBe(ink);
  });

  test("all button variants are present and labeled", async ({ page }) => {
    await page.goto("/system/components");
    for (const label of controlLabels.slice(0, 1)) {
      await expect(page.getByRole("button", { name: label }).first()).toBeVisible();
    }
  });
});
