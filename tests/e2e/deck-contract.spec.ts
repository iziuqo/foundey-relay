import { test, expect, type Page } from "@playwright/test";
import { axeViolations } from "./axe";
import { animationsSettled } from "./settle";

// M10 exit: /deck and /deck/print (plan §8, §9). The deck's craft checks live here rather
// than in craft.spec's MIGRATED list — see the note on that constant. The deck's pixel
// baselines live in tests/visual/screens.spec.ts.

/** ADVISOR-craft §8.1: eyebrow 16, H1 72, H2 44, lead 26, body 20, caption 15, stat 88.
 * Nothing is exempt: inline `code` is set at the surrounding body size. */
const DECK_SIZES = new Set([15, 16, 20, 26, 44, 72, 88]);

async function slideTexts(page: Page) {
  await animationsSettled(page);
  return page.evaluate(() => {
    const out: { slide: number; text: string; size: number; tracking: string }[] = [];
    document.querySelectorAll<HTMLElement>("[data-deck-print-slide]").forEach((wrap, i) => {
      const walker = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const el = node.parentElement;
        const text = node.textContent?.trim();
        // The embeds are pictures of the app, with the app's own scale; the deck's scale
        // governs everything outside them.
        if (!el || !text || el.closest("[inert]")) continue;
        const style = getComputedStyle(el);
        out.push({ slide: i + 1, text: text.slice(0, 36), size: parseFloat(style.fontSize), tracking: style.letterSpacing });
      }
    });
    return out;
  });
}

test.describe("/deck", () => {
  test("has zero axe violations on the cover slide", async ({ page }) => {
    await page.goto("/deck");
    await expect(page.getByTestId("slide")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("arrow keys move between slides, and the rail reflects the current one", async ({ page }) => {
    await page.goto("/deck");
    await expect(page.getByRole("button", { name: /^1\s*Cover$/ })).toHaveAttribute("aria-current", "true");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("button", { name: /^2\s/ })).toHaveAttribute("aria-current", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("button", { name: /^1\s*Cover$/ })).toHaveAttribute("aria-current", "true");
  });

  test("clicking a rail entry jumps straight to that slide", async ({ page }) => {
    await page.goto("/deck");
    await page.getByRole("button", { name: /The wireframe/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "The wireframe" })).toBeVisible();
  });

  test("a #n in the URL opens that slide", async ({ page }) => {
    await page.goto("/deck#11");
    await expect(page.getByRole("heading", { level: 1, name: "Beyond the hour" })).toBeVisible();
  });

  test("no horizontal scroll at 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/deck");
    await expect(page.getByTestId("slide")).toBeVisible();
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});

test.describe("/deck/print", () => {
  test("renders every slide, Part A then Part B, one per PDF page (§8)", async ({ page }) => {
    await page.goto("/deck/print");
    const slides = page.locator("[data-deck-print-slide]");
    await expect(slides).toHaveCount(16);
    await expect(slides.nth(0)).toContainText("Relay");
    await expect(slides.nth(9)).toContainText("What we cut");
    await expect(slides.nth(10)).toContainText("Optional");
  });

  test("has zero axe violations", async ({ page }) => {
    await page.goto("/deck/print");
    await expect(page.locator("[data-deck-print-slide]").first()).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test("every slide is one canvas, 1600×900, with exactly one h1", async ({ page }) => {
    await page.goto("/deck/print");
    const slides = page.getByTestId("slide");
    await expect(slides).toHaveCount(16);
    const shape = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("[data-testid='slide']")].map((el) => ({
        w: el.offsetWidth,
        h: el.offsetHeight,
        h1: [...el.querySelectorAll("h1")].filter((h) => !h.closest("[inert]")).length,
      })),
    );
    for (const [i, s] of shape.entries()) expect(s, `slide ${i + 1}`).toEqual({ w: 1600, h: 900, h1: 1 });
  });

  test("the split is legible on every slide: eyebrow names the half, and slide 11 alone is inverted", async ({ page }) => {
    await page.goto("/deck/print");
    const info = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("[data-testid='slide']")].map((el) => ({
        theme: el.dataset.theme,
        eyebrow: el.querySelector("[data-slide-eyebrow]")?.textContent ?? "",
      })),
    );
    // Slides 2 and 11 are the dividers: their h1 names the half, and they carry no eyebrow.
    for (const [i, s] of info.entries()) {
      const n = i + 1;
      if (n === 2 || n === 11) expect(s.eyebrow, `slide ${n}`).toBe("");
      else if (n <= 10) expect(s.eyebrow, `slide ${n}`).toMatch(/^Part A/);
      else expect(s.eyebrow, `slide ${n}`).toMatch(/^Part B.*Optional$/);
    }
    expect(info.map((s) => s.theme).filter((t) => t === "dark")).toHaveLength(1);
    expect(info[10].theme).toBe("dark");
  });

  test("deck type comes from the deck scale, and everything above 16px is tracked", async ({ page }) => {
    await page.goto("/deck/print");
    const texts = await slideTexts(page);
    const off = texts.filter((t) => !DECK_SIZES.has(t.size));
    expect(off.map((t) => `slide ${t.slide}: ${t.size}px "${t.text}"`)).toEqual([]);
    const untracked = texts.filter((t) => t.size > 16 && (t.tracking === "normal" || parseFloat(t.tracking) === 0));
    expect(untracked.map((t) => `slide ${t.slide}: ${t.size}px "${t.text}"`)).toEqual([]);
  });

  test("at most three annotations a slide, and no clipped deck text", async ({ page }) => {
    await page.goto("/deck/print");
    await animationsSettled(page);
    const { dots, clipped } = await page.evaluate(() => {
      const dots: number[] = [];
      const clipped: string[] = [];
      document.querySelectorAll<HTMLElement>("[data-deck-print-slide]").forEach((wrap, i) => {
        dots.push(wrap.querySelectorAll("[data-annotation]").length);
        wrap.querySelectorAll<HTMLElement>("h1, h2, p, li, strong, blockquote, span").forEach((el) => {
          if (el.closest("[inert]") || !el.textContent?.trim()) return;
          if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).display !== "inline") {
            clipped.push(`slide ${i + 1}: "${el.textContent.trim().slice(0, 30)}"`);
          }
        });
      });
      return { dots, clipped };
    });
    for (const [i, n] of dots.entries()) expect(n, `annotations on slide ${i + 1}`).toBeLessThanOrEqual(3);
    expect(clipped).toEqual([]);
  });

  test("the wireframe slide is the real product with the hue removed", async ({ page }) => {
    // Not a drawing of a wireframe: two live screens under data-fidelity="wire". Every
    // painted color inside them must be a grey (r = g = b), resolved through a canvas
    // because the engine serializes these as oklch() or lab() rather than rgb().
    await page.goto("/deck/print");
    const wire = page.locator("[data-deck-print-slide]").nth(7).locator("[data-fidelity='wire']");
    await expect(wire).toHaveCount(2);
    const tinted = await wire.evaluateAll((roots) => {
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      const bad: string[] = [];
      const toRgb = (css: string) => {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = "#000";
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        return ctx.getImageData(0, 0, 1, 1).data;
      };
      for (const root of roots) {
        for (const el of root.querySelectorAll("*")) {
          const style = getComputedStyle(el);
          for (const prop of ["color", "backgroundColor", "borderTopColor"] as const) {
            const value = style[prop];
            if (!value || value === "rgba(0, 0, 0, 0)" || value === "transparent") continue;
            const [r, g, b] = toRgb(value);
            if (Math.max(r, g, b) - Math.min(r, g, b) > 2) bad.push(`${el.tagName.toLowerCase()} ${prop} ${value}`);
          }
        }
      }
      return bad.slice(0, 5);
    });
    expect(tinted).toEqual([]);
  });

  test("the cover's ghosted context is bars, and the hero above it is not", async ({ page }) => {
    await page.goto("/deck/print");
    const cover = page.locator("[data-deck-print-slide]").first();
    await expect.poll(() => cover.locator("[data-ghost]").count()).toBeGreaterThan(8);
    expect(await cover.locator("[data-deck-focus] [data-ghost]").count()).toBe(0);
  });
});

test.describe("/deck/print in another timezone (G7)", () => {
  test.use({ timezoneId: "Asia/Tokyo" });

  test("the embeds show the site's clock, not the machine's", async ({ page }) => {
    await page.goto("/deck/print");
    const team = page.locator("[data-deck-print-slide]").nth(13);
    await expect(team).toContainText("updated 10:40");
    await expect(team).toContainText("UPS 11:30");
  });
});
