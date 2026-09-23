import { test, expect, type Page } from "@playwright/test";
import { animationsSettled } from "./settle";

/**
 * /system/motion (M9). The page's promise is narrow and mechanical: eighteen moments,
 * each played twice — full and reduced — by a press of Play, and *nothing runs until the
 * press*. G6's "nothing loops except the all-clear aurora" is checked here at rest, and
 * "every animation has a reduced variant" is checked by sampling the reduced stages while
 * every moment plays and asking whether anything in them still moves.
 */

/** Properties whose animation moves, resizes or reshapes something (see motion-reduced.spec). */
const MOVING = ["transform", "translate", "rotate", "scale", "clip-path", "top", "left", "right", "bottom", "width", "height"];

async function movingInReducedStages(page: Page): Promise<string[]> {
  return page.evaluate((moving) => {
    const found: string[] = [];
    for (const animation of document.getAnimations()) {
      const effect = animation.effect as KeyframeEffect | null;
      const target = effect?.target as Element | null;
      if (!target?.closest?.('[data-stage="reduced"]')) continue;
      // Motion resolves "instant" as a 0.01ms animation rather than none at all. That is
      // a jump, not movement, and it is exactly what reduced motion asks for.
      if ((effect!.getComputedTiming().duration as number) < 1) continue;
      for (const frame of effect!.getKeyframes()) {
        for (const prop of moving) {
          const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
          if (frame[camel] !== undefined && frame[camel] !== "none") {
            found.push(`M${target.closest("[data-moment]")?.getAttribute("data-moment")} ${prop}=${String(frame[camel])} ${target.className.toString().slice(0, 40)}`);
          }
        }
      }
    }
    return found;
  }, MOVING);
}

test.describe("/system/motion", () => {
  test("renders all eighteen moments, each with a full and a reduced stage and a Play control", async ({ page }) => {
    await page.goto("/system/motion");
    await expect(page.locator("[data-moment]")).toHaveCount(18);
    for (let id = 1; id <= 18; id++) {
      const card = page.locator(`[data-moment="${id}"]`);
      await expect(card.locator('[data-stage="full"]')).toHaveCount(1);
      await expect(card.locator('[data-stage="reduced"]')).toHaveCount(1);
      await expect(card.getByRole("button", { name: /^(Play|Count up)/ })).toBeVisible();
    }
  });

  test("nothing runs at rest — no animation of any kind, and nothing loops", async ({ page }) => {
    await page.goto("/system/motion");
    await animationsSettled(page);
    const running = await page.evaluate(
      () => document.getAnimations().filter((a) => a.playState === "running").length,
    );
    expect(running).toBe(0);
  });

  test("pressing Play plays the moment, and the aurora is the only thing that loops", async ({ page }) => {
    await page.goto("/system/motion");
    for (let id = 1; id <= 18; id++) {
      await page.locator(`[data-moment="${id}"]`).getByRole("button").first().click();
    }
    await page.waitForTimeout(500);
    const loops = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations === Infinity)
        .map((a) => ((a.effect as KeyframeEffect | null)?.target as Element | null)?.closest("[data-moment]")?.getAttribute("data-moment")),
    );
    // The aurora on M17 — one loop per stage, both stages — and nothing else.
    expect(new Set(loops)).toEqual(new Set(["17"]));
  });

  test("nothing in a reduced stage moves while every moment plays", async ({ page }) => {
    await page.goto("/system/motion");
    const offenders = new Set<string>();
    for (let id = 1; id <= 18; id++) {
      const card = page.locator(`[data-moment="${id}"]`);
      await card.scrollIntoViewIfNeeded();
      await card.getByRole("button").first().click();
      for (let sample = 0; sample < 6; sample++) {
        for (const hit of await movingInReducedStages(page)) offenders.add(hit);
        await page.waitForTimeout(90);
      }
    }
    expect([...offenders]).toEqual([]);
  });

  test("the reduced stage drops the new-urgent sweep, the full stage keeps it", async ({ page }) => {
    await page.goto("/system/motion");
    const card = page.locator('[data-moment="9"]');
    await card.getByRole("button", { name: "Play" }).click();
    const display = async (stage: "full" | "reduced") =>
      card
        .locator(`[data-stage="${stage}"] .glow-sweep`)
        .evaluate((el) => getComputedStyle(el, "::after").display);
    expect(await display("reduced")).toBe("none");
    expect(await display("full")).not.toBe("none");
  });

  test("no horizontal scroll at 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/system/motion");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
