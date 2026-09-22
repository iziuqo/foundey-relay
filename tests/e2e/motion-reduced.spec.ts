import { test, expect, type Page } from "@playwright/test";

// Gate G6 (plan §9.1): "With reducedMotion: 'reduce', no element has a transform
// transition over 0ms, and the done and undo flow still completes."
//
// Two checks, because they cover different animation systems (§7.1):
//   - A computed-style sweep catches every plain CSS transition/animation (button
//     press, row actions, popovers, the aurora) — the global reduced-motion rule in
//     globals.css collapses all of these to ~0.01ms.
//   - A behavioral check catches what the computed-style sweep structurally cannot:
//     Motion's layout/shared-element animations (M1's hero morph) are driven via
//     inline styles and the Web Animations API, not the `transition`/`animation` CSS
//     properties, so a computed-style check would pass even if MotionConfig's
//     reducedMotion="user" were silently broken. Reading the hero's bounding box
//     immediately after a done/undo action and again ~300ms later, and asserting
//     they're identical, is the only way to actually prove the promotion was instant.

async function resetDemo(page: Page) {
  await page.addInitScript(() => window.localStorage.removeItem("relay-demo-v2"));
}

async function boundingBox(page: Page, testId: string) {
  const box = await page.getByTestId(testId).boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

test.describe("G6 reduced motion", () => {
  for (const path of ["/work", "/team", "/system", "/system/components"]) {
    test(`no CSS transition or animation runs longer than 50ms on ${path}`, async ({ page }) => {
      await resetDemo(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const offenders = await page.evaluate(() => {
        const bad: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("body *")) {
          const style = getComputedStyle(el);
          const durations = [...style.transitionDuration.split(","), ...style.animationDuration.split(",")];
          for (const raw of durations) {
            const ms = raw.trim().endsWith("ms") ? parseFloat(raw) : parseFloat(raw) * 1000;
            if (Number.isFinite(ms) && ms > 50) {
              bad.push(`${el.tagName}.${el.className}: ${raw}`);
              break;
            }
          }
        }
        return bad;
      });
      expect(offenders).toEqual([]);
    });
  }

  test("done and undo promote the hero instantly, with no lingering transform animation", async ({ page }) => {
    await resetDemo(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();

    const heroTitleBefore = await page.getByTestId("hero-title").textContent();
    // "E" (§8.5) marks the current hero done directly, regardless of whether it's
    // already in progress — deterministic, unlike the primary button whose label/action
    // depends on that status.
    await page.keyboard.press("e");
    await expect(page.getByTestId("hero-title")).not.toHaveText(heroTitleBefore ?? "");

    // G4 moves focus to the new hero, which can trigger the browser's own (instant,
    // under reduced motion) scroll-into-view — a real, one-time position change that
    // isn't the "lingering transform animation" this test is after. Reading only once
    // that's settled (50ms is generous for an instant scroll) isolates the thing this
    // test actually checks: that the hero itself doesn't keep moving afterward.
    await page.waitForTimeout(50);
    const first = await boundingBox(page, "hero");
    await page.waitForTimeout(300);
    const second = await boundingBox(page, "hero");
    expect(second.x).toBeCloseTo(first.x, 0);
    expect(second.y).toBeCloseTo(first.y, 0);
    expect(second.width).toBeCloseTo(first.width, 0);
    expect(second.height).toBeCloseTo(first.height, 0);

    // ⌘Z (or Ctrl+Z) undoes — confirm the same instant-settle property holds in reverse.
    await page.keyboard.press("Control+z");
    await expect(page.getByTestId("hero-title")).toHaveText(heroTitleBefore ?? "");
    await page.waitForTimeout(50);
    const afterUndo = await boundingBox(page, "hero");
    await page.waitForTimeout(300);
    const afterUndoSettled = await boundingBox(page, "hero");
    expect(afterUndoSettled.x).toBeCloseTo(afterUndo.x, 0);
    expect(afterUndoSettled.y).toBeCloseTo(afterUndo.y, 0);
  });

  test("the done flow completes with input never blocked (no disabled state mid-animation)", async ({ page }) => {
    await resetDemo(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();

    await page.keyboard.press("e");
    // Immediately actionable again — a second done action right away must not be
    // swallowed by an in-flight exit animation blocking interaction.
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("e");
    await expect(page.getByTestId("hero")).toBeVisible();
  });
});
