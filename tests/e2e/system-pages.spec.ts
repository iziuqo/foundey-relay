import { test, expect } from "@playwright/test";
import { animationsSettled } from "./settle";

// M9: /system as a design system. Each check is the page's own claim, made mechanical.

test.describe("/system/rules", () => {
  test("four rules, each drawn as a do and a don't", async ({ page }) => {
    await page.goto("/system/rules");
    await expect(page.locator("[data-rule]")).toHaveCount(4);
    for (let n = 1; n <= 4; n++) {
      const rule = page.locator(`[data-rule="${n}"]`);
      await expect(rule.locator('[data-verdict="do"]').first()).toBeVisible();
      await expect(rule.locator('[data-verdict="dont"]')).toHaveCount(1);
    }
  });

  test("a wrong example is marked by a word and a dashed edge, never by colour alone", async ({ page }) => {
    await page.goto("/system/rules");
    for (const dont of await page.locator('[data-verdict="dont"]').all()) {
      await expect(dont).toContainText("Don’t.");
      expect(await dont.evaluate((el) => getComputedStyle(el).borderTopStyle)).toBe("dashed");
    }
  });

  test("one height per row: the do reads one number, the don't reads several", async ({ page }) => {
    await page.goto("/system/rules");
    const readouts = page.locator('[data-rule="2"] [data-testid="row-heights"]');
    await expect(readouts).toHaveCount(2);
    await expect(readouts.first()).not.toHaveText("…");
    const parse = async (i: number) =>
      ((await readouts.nth(i).innerText()).match(/\d+/g) ?? []).map(Number);
    expect(new Set(await parse(0)).size).toBe(1);
    expect(new Set(await parse(1)).size).toBeGreaterThan(1);
  });

  test("the grayscale test is real: a wire panel inside a hi-fi page resolves every tier to chroma zero", async ({ page }) => {
    // A nested `data-fidelity="wire"` used to inherit the page's already-substituted
    // colours, because an unregistered custom property resolves var(--chroma) where it is
    // declared. The rules page's own grayscale figure depended on this being fixed.
    await page.goto("/system/rules");
    const channels = await page.locator('[data-rule="1"] [data-fidelity="wire"]').evaluate((panel) => {
      // Resolve through a canvas: the engine serializes these as oklch(), lab() or
      // color() depending on the value, and only device pixels are one notation.
      const probe = document.createElement("span");
      panel.append(probe);
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      const out: number[][] = [];
      for (const token of ["--act-fg", "--next-fg", "--when-fg", "--fyi-fg", "--act-bg"]) {
        probe.style.color = `var(${token})`;
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = getComputedStyle(probe).color;
        ctx.fillRect(0, 0, 1, 1);
        out.push([...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3));
      }
      probe.remove();
      return out;
    });
    for (const [r, g, b] of channels) {
      expect(Math.abs(r - g)).toBeLessThanOrEqual(2);
      expect(Math.abs(g - b)).toBeLessThanOrEqual(3);
    }
  });

  test("the truncation don't truncates and the do does not", async ({ page }) => {
    await page.goto("/system/rules");
    const overflows = async (verdict: "do" | "dont") =>
      page.locator(`[data-rule="4"] [data-verdict="${verdict}"] p.t-body`).evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(await overflows("do")).toBe(false);
    expect(await overflows("dont")).toBe(true);
  });
});

test.describe("/system/patterns", () => {
  test("the undo filmstrip has four frames, all inert, and the same hero looks the same in each", async ({ page }) => {
    await page.goto("/system/patterns");
    await animationsSettled(page);
    const frames = page.locator("#pattern-undo").locator("xpath=ancestor::section").locator("ol > li");
    await expect(frames).toHaveCount(4);
    for (const frame of await frames.all()) {
      expect(await frame.locator("[inert]").count()).toBeGreaterThan(0);
    }
    // Frames 1 and 4 are the same hero. They used to differ because every Hero shares a
    // layoutId derived from its item's id, so the four cards fought over one background.
    const tint = (i: number) =>
      frames.nth(i).evaluate((li) => {
        const shell = [...li.querySelectorAll<HTMLElement>('[aria-hidden="true"]')].find((el) =>
          el.className.toString().includes("-z-10"),
        );
        return shell ? getComputedStyle(shell).backgroundColor : "none";
      });
    expect(await tint(0)).toBe(await tint(3));
  });

  test("the inline palette does not take focus from the page", async ({ page }) => {
    await page.goto("/system/patterns");
    await animationsSettled(page);
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("BODY");
  });

  test("every pattern names the file it lives in", async ({ page }) => {
    await page.goto("/system/patterns");
    const sections = page.locator("section[aria-labelledby^='pattern-']");
    expect(await sections.count()).toBeGreaterThanOrEqual(8);
    for (const section of await sections.all()) {
      await expect(section.locator("p.t-mono").first()).toContainText("components/");
    }
  });
});

test.describe("/system/components and /system", () => {
  test("the inventory lists fourteen components and the anatomy draws four", async ({ page }) => {
    await page.goto("/system/components");
    await expect(page.locator("#index-heading").locator("xpath=ancestor::section").locator("tbody tr")).toHaveCount(14);
    await expect(page.locator("#anatomy-heading").locator("xpath=ancestor::section").locator("figure")).toHaveCount(4);
  });

  test("a button holds an icon and a label side by side", async ({ page }) => {
    // Preflight makes an svg display:block, so an icon passed beside the label as a child
    // stacks above it. Button takes the icon as a prop and lays both out as flex items.
    await page.goto("/system/components");
    const button = page.getByRole("button", { name: "Add order" });
    const icon = await button.locator("svg").boundingBox();
    const box = await button.boundingBox();
    const text = await button.locator("span").evaluate((span) => {
      const node = [...span.childNodes].find((n) => n.nodeType === Node.TEXT_NODE)!;
      const range = document.createRange();
      range.selectNodeContents(node);
      const r = range.getBoundingClientRect();
      return { x: r.x, cy: r.y + r.height / 2 };
    });
    expect(icon!.x + icon!.width).toBeLessThanOrEqual(text.x + 1);
    expect(Math.abs(icon!.y + icon!.height / 2 - text.cy)).toBeLessThanOrEqual(2);
    expect(box!.height).toBeCloseTo(48, 0);
  });

  test("foundations shows the ladder in all three modes and prints no raw lab()", async ({ page }) => {
    await page.goto("/system");
    await expect(page.locator("[data-theme][data-fidelity]").filter({ hasText: /^(Light|Dark|Wire)/ })).toHaveCount(6);
    const raw = await page.evaluate(
      () => [...document.querySelectorAll("p.t-mono")].filter((p) => /lab\(|oklch\(/.test(p.textContent ?? "")).length,
    );
    expect(raw).toBe(0);
  });
});

test.describe("nested modes", () => {
  // A nested override re-declares the token chain and must carry both attributes. Each
  // direction of the bug was invisible to axe (light text on a light panel is fine) and to
  // the grayscale test above (its panel sets both attributes itself).
  test("a bare data-fidelity element inside a dark page does not reset it to light", async ({ page }) => {
    await page.goto("/system/components");
    await page.getByRole("button", { name: /^(Light|Dark)$/ }).click();
    await expect(page.getByRole("button", { name: "Dark" })).toBeVisible();
    const bg = await page.evaluate(() => {
      const el = document.createElement("div");
      el.setAttribute("data-fidelity", "wire");
      el.style.backgroundColor = "var(--bg)";
      document.querySelector("main")!.append(el);
      const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      ctx.fillStyle = getComputedStyle(el).backgroundColor;
      ctx.fillRect(0, 0, 1, 1);
      const rgb = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
      el.remove();
      return rgb;
    });
    expect(Math.max(...bg)).toBeLessThan(80);
  });

  test("with the page in wire, the ladder's Dark column keeps its hue", async ({ page }) => {
    await page.goto("/system");
    await page.getByRole("button", { name: /^(Hi-fi|Wire)$/ }).click();
    await expect(page.getByRole("button", { name: "Wire" })).toBeVisible();
    const spread = await page
      .locator('[data-theme="dark"][data-fidelity="hi"]')
      .first()
      .evaluate((panel) => {
        const probe = document.createElement("span");
        panel.append(probe);
        probe.style.color = "var(--act-fg)";
        const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
        ctx.fillStyle = getComputedStyle(probe).color;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        probe.remove();
        return Math.max(r, g, b) - Math.min(r, g, b);
      });
    expect(spread, "Act now foreground in a hi-fi Dark panel on a Wire page").toBeGreaterThan(30);
  });
});

test.describe("G6, the check that draws itself", () => {
  test("the Reduced stage of Mark done shows the check already complete", async ({ page }) => {
    // `pathLength` is neither a transform nor a layout animation, so MotionConfig's
    // reduced setting did not reach it and getAnimations() cannot see it (Motion drives it
    // from JS). Sample the stroke-dasharray the browser actually paints.
    await page.goto("/system/motion");
    const card = page.locator('[data-moment="4"]');
    await card.scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const w = window as unknown as { __dash: Record<string, string[]> };
      w.__dash = { full: [], reduced: [] };
      const t0 = performance.now();
      const tick = () => {
        for (const stage of ["full", "reduced"]) {
          const path = document.querySelector(`[data-moment="4"] [data-stage=${stage}] [data-testid=check-draw] path`);
          if (path) w.__dash[stage].push(getComputedStyle(path).strokeDasharray);
        }
        if (performance.now() - t0 < 500) requestAnimationFrame(tick);
      };
      (window as unknown as { __tick: () => void }).__tick = () => requestAnimationFrame(tick);
    });
    await card.getByRole("button", { name: "Play" }).click();
    await page.evaluate(() => (window as unknown as { __tick: () => void }).__tick());
    await page.waitForTimeout(700);
    const { full, reduced } = await page.evaluate(() => (window as unknown as { __dash: Record<string, string[]> }).__dash);
    expect(new Set(full).size, "the Full stage draws").toBeGreaterThan(3);
    expect(new Set(reduced), "the Reduced stage never draws").toEqual(new Set(["1px, 1px"]));
  });
});

test.describe("G3 layout, /system", () => {
  for (const width of [390, 768, 1024, 1440]) {
    for (const path of ["/system", "/system/components", "/system/patterns", "/system/rules", "/system/motion"]) {
      test(`${path} has no horizontal scroll at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await animationsSettled(page);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
      });
    }
  }
});
