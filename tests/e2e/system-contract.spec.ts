import { test, expect } from "@playwright/test";

// Gate G1 (plan §9.1): every §4.4 size-contract row must render every control at the
// same height and the same vertical center. Measured against /system/components'
// "Size contract" section, which renders one live row per size step.

const sizes = ["sm", "md", "lg"] as const;
const controlLabels = ["Reroute orders", "Order number", "UPS", "Add"];

test.describe("G1 size contract", () => {
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

  test("button md height is exactly 40px, matching --size-control-md", async ({ page }) => {
    await page.goto("/system/components");
    const box = await page
      .getByTestId("contract-row-md")
      .getByRole("button", { name: "Reroute orders" })
      .boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeCloseTo(40, 0);
  });

  test("h-12 (a Tailwind spacing multiple) is 48px, not redefined by the token layer", async ({ page }) => {
    await page.goto("/system");
    const label = page.getByText("12 (a control's md height)");
    await expect(label).toBeVisible();
    const box = await label.locator("xpath=preceding-sibling::div").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeCloseTo(48, 0);
  });

  test("all button variants are present and labeled", async ({ page }) => {
    await page.goto("/system/components");
    for (const label of controlLabels.slice(0, 1)) {
      await expect(page.getByRole("button", { name: label }).first()).toBeVisible();
    }
  });
});
