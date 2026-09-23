import { test, expect, type Page } from "@playwright/test";
import { axeViolations } from "./axe";

// Gates G3 (text) and G7 (layout) for the "My work" screen (plan §9.1, Phase 3 exit
// gate). G2's screenshot baselines need a human to approve them, so they aren't here.

const breakpoints = [390, 768, 1024, 1280, 1440, 1920];

async function resetDemo(page: Page) {
  await page.addInitScript(() => window.localStorage.removeItem("relay-demo-v2"));
}

test.describe("G7 layout (/work)", () => {
  for (const width of breakpoints) {
    test(`no horizontal scroll at ${width}px`, async ({ page }) => {
      await resetDemo(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work");
      await expect(page.getByTestId("hero")).toBeVisible();
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  }

  test("main column is at least 36rem at 1280 and up", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/work");
    const box = await page.getByTestId("work-main").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(576 - 1); // 36rem
  });

  test("the rail never overlaps the main column at 1440", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work");
    const main = await page.getByTestId("work-main").boundingBox();
    const rail = await page.getByTestId("work-rail").boundingBox();
    expect(main).not.toBeNull();
    expect(rail).not.toBeNull();
    expect(main!.x + main!.width).toBeLessThanOrEqual(rail!.x + 1);
  });

  test("the rail is hidden below 1200 (v3 M3: it does not disappear at 1279 and reappear at 1280)", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto("/work");
    await expect(page.getByTestId("work-rail")).toBeHidden();
  });

  test("the rail is visible at exactly 1200, and the main column caps at 720px centered just below it", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");

    await page.setViewportSize({ width: 1199, height: 900 });
    await expect(page.getByTestId("work-rail")).toBeHidden();
    const capped = await page.getByTestId("work-main").boundingBox();
    expect(capped!.width).toBeLessThanOrEqual(720 + 1);

    await page.setViewportSize({ width: 1200, height: 900 });
    await expect(page.getByTestId("work-rail")).toBeVisible();
  });
});

test.describe("G3 text (/work)", () => {
  for (const width of [390, 1440]) {
    test(`no computed font under 14px outside kbd at ${width}px`, async ({ page }) => {
      await resetDemo(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work");
      await expect(page.getByTestId("hero")).toBeVisible();
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

  test("the hero title never clips (scrollWidth <= clientWidth)", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/work");
    const title = page.getByTestId("hero-title");
    await expect(title).toBeVisible();
    const overflow = await title.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("the hero why line never clips", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/work");
    const why = page.getByTestId("hero-why");
    await expect(why).toBeVisible();
    const overflow = await why.evaluate((el) => el.scrollWidth - el.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

/* =====================================================================================
 * v3 M4 — the worker screen.
 *
 * The craft checks (tests/e2e/craft.spec.ts) cover what is true of every migrated
 * route. What follows is what is true of *this* screen, and each one names the thing it
 * exists to stop coming back.
 * =================================================================================== */

/** The mode switch is a radiogroup, so picking a mode is selecting, not toggling. */
async function setMode(page: Page, mode: "Light" | "Dark" | "Wire") {
  await page.getByRole("radio", { name: mode }).click();
  const html = page.locator("html");
  // Assert the mode actually landed before measuring anything. The theme swap runs
  // inside document.startViewTransition()'s callback, so it resolves after click()
  // does — and a "dark" assertion that samples too early silently grades light.
  if (mode === "Wire") await expect(html).toHaveAttribute("data-fidelity", "wire");
  else await expect(html).toHaveAttribute("data-theme", mode.toLowerCase());
}

test.describe("G4 accessibility (/work)", () => {
  for (const mode of ["Light", "Dark", "Wire"] as const) {
    test(`zero axe violations in ${mode.toLowerCase()}`, async ({ page }) => {
      await resetDemo(page);
      await page.goto("/work");
      await expect(page.getByTestId("hero")).toBeVisible();
      await setMode(page, mode);
      // setMode only confirms the data-theme/data-fidelity attribute landed — the visible
      // crossfade is a separate document.startViewTransition() animation on top of that
      // (lib/theme-transition.ts, a 500ms clip-path reveal plus .ready overhead) that
      // keeps compositing the old and new snapshots for a while after the attribute
      // flips. Sampled mid-crossfade, axe read blended greys off the nav ("My work":
      // #6e6f71 on #848688, 1.37:1 — measured with node/@axe-core/playwright directly,
      // not a real dark-mode pairing anywhere in the token set) rather than the settled
      // page. 600ms — confirmed empirically to bring axe back to zero violations here —
      // covers the reveal's own 500ms plus margin for .ready to resolve.
      await page.waitForTimeout(600);
      expect(await axeViolations(page)).toEqual([]);
    });
  }
});

test.describe("the hero (advisor §7.3)", () => {
  for (const width of breakpoints) {
    test(`the countdown never sets the eyebrow's height at ${width}px`, async ({ page }) => {
      // v2's measured 73px void between the eyebrow and the title came from exactly
      // one thing: a 76px countdown sitting in a 28px text row. `align-items: start`
      // aligns a tall child, it does not stop one from setting the row's height — so
      // the ring is positioned against the card instead, and this asserts both halves
      // of that: the row stays 28, and the ring never lands on the title.
      await resetDemo(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work");
      await expect(page.getByTestId("hero")).toBeVisible();

      const eyebrow = await page.getByTestId("hero-eyebrow").boundingBox();
      expect(eyebrow!.height).toBeLessThanOrEqual(28);

      const ring = page.getByTestId("hero-countdown");
      if (await ring.isVisible()) {
        const r = (await ring.boundingBox())!;
        const t = (await page.getByTestId("hero-title").boundingBox())!;
        const overlaps = r.x < t.x + t.width && t.x < r.x + r.width && r.y < t.y + t.height && t.y < r.y + r.height;
        expect(overlaps, "the countdown overlapping the hero title").toBe(false);
      }
    });
  }

  test("the internal rhythm is 24 / 12 / 20", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    const gaps = await page.evaluate(() => {
      const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
      const eyebrow = box('[data-testid="hero-eyebrow"]');
      const title = box('[data-testid="hero-title"]');
      const why = box('[data-testid="hero-why"]');
      const actions = box('[data-testid="hero"] [data-craft-row]');
      return {
        eyebrowToTitle: Math.round(title.top - eyebrow.bottom),
        titleToWhy: Math.round(why.top - title.bottom),
        whyToActions: Math.round(actions.top - why.bottom),
      };
    });
    expect(gaps).toEqual({ eyebrowToTitle: 24, titleToWhy: 12, whyToActions: 20 });
  });

  test("the hero title is the largest type on the screen", async ({ page }) => {
    // The two-metre test, made mechanical. v2's greeting was 56px over a 33px hero
    // title, so the first thing readable across the room was a salutation.
    await resetDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    const { titleSize, largest, largestText } = await page.evaluate(() => {
      const sizes = [...document.querySelectorAll<HTMLElement>("main *")]
        .filter((el) => [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()))
        .filter((el) => el.getBoundingClientRect().width > 0)
        .map((el) => ({ size: parseFloat(getComputedStyle(el).fontSize), text: (el.textContent ?? "").trim().slice(0, 30) }));
      const top = sizes.sort((a, b) => b.size - a.size)[0];
      return {
        titleSize: parseFloat(getComputedStyle(document.querySelector('[data-testid="hero-title"]')!).fontSize),
        largest: top.size,
        largestText: top.text,
      };
    });
    expect(titleSize, `something bigger than the hero title: "${largestText}"`).toBeGreaterThanOrEqual(largest);
  });

  test("only one control carries the primary verb at 390", async ({ page }) => {
    // v2 painted the hero's own primary and a floating bar at the same time on first
    // paint (measured), so the phone showed the same action twice, 500px apart.
    await resetDemo(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    const label = await page.getByTestId("work-mobile-cta").getByRole("button").textContent();
    await expect(page.getByRole("button", { name: label!.trim(), exact: true })).toHaveCount(1);
  });
});

test.describe("the rail (advisor §7.3)", () => {
  test("contains zero interactive elements and never exceeds 368px", async ({ page }) => {
    // The rule that stops reference material being given room before the primary task.
    await resetDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work");
    const rail = page.getByTestId("work-rail");
    await expect(rail).toBeVisible();
    await expect(
      rail.locator("a, button, input, select, textarea, [tabindex], [role='button'], [role='link']"),
    ).toHaveCount(0);
    expect((await rail.boundingBox())!.width).toBeLessThanOrEqual(368);
  });
});

test.describe("G5 the wire test (/work)", () => {
  test("tier order is still recoverable with no colour at all", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    await setMode(page, "Wire");

    // Position and label: the three groups still read top to bottom in rank order.
    const labels = await page.getByTestId("queue").locator("[data-tier-label]").allTextContents();
    expect(labels).toEqual(["Act now", "Up next", "When you can"]);

    // Shape: each tier's glyph is a different drawing, not the same glyph in three
    // hues — which is the whole of why the ranking survives `--chroma: 0`. Compared by
    // geometry, because "now" and "next" are both `<polygon>` and differ only in their
    // points (an octagon and a triangle).
    const shapes = await page.evaluate(() =>
      ["now", "next", "later"].map((tier) => document.querySelector(`[data-tier="${tier}"] svg`)?.innerHTML ?? tier),
    );
    expect(new Set(shapes).size, "distinct tier glyphs").toBe(3);
  });
});

test.describe("G3 the six widths (/work)", () => {
  for (const width of breakpoints) {
    test(`nothing clips at ${width}px, before or after a done action`, async ({ page }) => {
      await resetDemo(page);
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/work");
      await expect(page.getByTestId("hero")).toBeVisible();

      const noClipping = async (label: string) => {
        for (const id of ["status-line", "hero-title", "hero-why"]) {
          const overflow = await page
            .getByTestId(id)
            .evaluate((el) => el.scrollWidth - el.clientWidth);
          expect(overflow, `${id} clipped ${label}`).toBeLessThanOrEqual(1);
        }
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth, `horizontal scroll ${label}`).toBeLessThanOrEqual(clientWidth + 1);
      };

      await noClipping("on first paint");

      // The promoted hero is a different item with a different title length, and it is
      // the state a reviewer reaches in one click.
      await page.keyboard.press("e");
      await expect(page.getByTestId("hero-title")).not.toHaveText("Label printer offline at Pack 7");
      await noClipping("after a done action");
    });
  }
});

test.describe("the status line's later states (§5.1)", () => {
  test("reads as clauses, not sentences, once the Act-now tier is empty", async ({ page }) => {
    // The all-clear branch is four keystrokes away and no screenshot reaches it. Its
    // first version reused `nothingUrgent` with the "Nothing urgent. " prefix stripped
    // by a regex, which left the full stop sitting mid-line after a "·".
    await resetDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work");
    const status = page.getByTestId("status-line");
    await expect(page.getByTestId("hero")).toBeVisible();

    for (let i = 0; i < 12 && !(await status.textContent())!.startsWith("Nothing urgent"); i += 1) {
      await page.keyboard.press("e");
      await page.waitForTimeout(80);
    }

    const text = (await status.textContent())!.trim();
    expect(text.startsWith("Nothing urgent"), `status line never cleared: "${text}"`).toBe(true);
    expect(text.endsWith("."), `clause ends in a full stop: "${text}"`).toBe(false);
    expect(text, "a clock time reached through the 'in {rel}' clause").not.toMatch(/ in \d{2}:\d{2}/);
  });
});

test.describe("the hero away from /work", () => {
  test("keeps its own primary at 390 where there is no dock to hold it", async ({ page }) => {
    // `/work` moves the handheld primary into a sticky bar above the dock, and hides the
    // card's own. `/system/patterns` and the deck render this same card with neither, so
    // the hiding is opt-in — otherwise those two show a hero with no action at all below
    // 768, at a width nothing else tests them at.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/system/patterns");
    const hero = page.getByTestId("hero").first();
    await expect(hero).toBeVisible();
    await expect(hero.getByRole("button", { name: /Mark done|Reroute|Reprint/ })).toBeVisible();
  });
});
