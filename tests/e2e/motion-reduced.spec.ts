import { test, expect, type Page } from "@playwright/test";

/**
 * Gate G6: "every animation has a `prefers-reduced-motion` variant; nothing loops except
 * the all-clear gradient; no layout shift from any transition."
 *
 * M8 rewrote this suite, because the rule it used to assert was the wrong one. It swept
 * every element for *any* transition or animation over 50ms and demanded none — which is
 * what the old blanket CSS rule delivered, and which is not what the catalog asks for.
 * Fourteen of the eighteen moments have a designed reduced variant that **keeps
 * something**: the tint wash that says which row moved, the ring that says how much undo
 * window is left, the 120–160ms fades on every overlay. A test that forbids those is a
 * test that would fail the spec being implemented.
 *
 * So the question is narrowed to the one the catalog actually asks: **does anything still
 * move?** Position, size and shape are what reduced motion is about; opacity and colour
 * are explicitly not. Three checks, because they reach different animation systems:
 *
 *   1. A computed-style sweep for *declared* CSS transitions on moving properties. This
 *      is the only one that sees a transition nobody has triggered yet.
 *   2. A `getAnimations()` sweep taken *during* a real action, with the keyframes read
 *      off each animation. This is the only one that sees Motion's layout and shared
 *      element animations, which run through the Web Animations API and never touch the
 *      `transition`/`animation` CSS properties at all — a computed-style check would pass
 *      with `MotionConfig reducedMotion="user"` silently removed.
 *   3. A `layout-shift` PerformanceObserver across the done and undo sequences, at both
 *      widths. G6 says "no layout shift from any transition" and this is the only one of
 *      the three that measures it.
 */

/** Properties whose animation moves, resizes or reshapes something on the page. */
const MOVING = [
  "transform",
  "translate",
  "rotate",
  "scale",
  "clip-path",
  "top",
  "right",
  "bottom",
  "left",
  "inset",
  "width",
  "height",
  "margin",
  "padding",
  "gap",
];

async function resetDemo(page: Page) {
  await page.addInitScript(() => window.localStorage.removeItem("relay-demo-v2"));
}

async function boundingBox(page: Page, testId: string) {
  const box = await page.getByTestId(testId).boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

/**
 * Runs done-then-undo on /work and returns the layout-shift score it caused.
 *
 * `buffered: false` matters: with `buffered: true` the observer replays every shift
 * since navigation, so the figure comes back as the page's whole load history (measured:
 * 0.74) and says nothing at all about the interaction.
 */
async function shiftScoreOfDoneAndUndo(page: Page): Promise<number> {
  await expect(page.getByTestId("hero")).toBeVisible();
  await page.waitForTimeout(300);

  await page.evaluate(() => {
    const w = window as unknown as { __cls: number };
    w.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number })[]) {
        // Shifts inside 500ms of an interaction are excluded from the real CLS metric.
        // They are counted here on purpose: the whole question is what this interaction
        // does, and excluding them would leave nothing to measure.
        w.__cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: false });
  });

  const before = await page.getByTestId("hero-title").textContent();
  await page.keyboard.press("e");
  await expect(page.getByTestId("hero-title")).not.toHaveText(before ?? "");
  await page.waitForTimeout(900);
  await page.keyboard.press("Control+z");
  await expect(page.getByTestId("hero-title")).toHaveText(before ?? "");
  await page.waitForTimeout(900);

  return page.evaluate(() => (window as unknown as { __cls: number }).__cls);
}

test.describe("G6 reduced motion", () => {
  for (const path of ["/work", "/team", "/updates", "/system", "/system/components"]) {
    test(`nothing is declared to move on ${path}`, async ({ page }) => {
      await resetDemo(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const offenders = await page.evaluate((moving) => {
        const bad: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("body *")) {
          const style = getComputedStyle(el);
          const props = style.transitionProperty.split(",").map((p) => p.trim());
          const durations = style.transitionDuration.split(",").map((d) => d.trim());
          props.forEach((prop, i) => {
            const raw = durations[i % durations.length] ?? "0s";
            const ms = raw.endsWith("ms") ? parseFloat(raw) : parseFloat(raw) * 1000;
            const movesSomething = prop === "all" || moving.includes(prop);
            if (movesSomething && Number.isFinite(ms) && ms > 50) {
              bad.push(`${el.tagName}.${el.className}: ${prop} ${raw}`);
            }
          });
        }
        return bad;
      }, MOVING);
      expect(offenders).toEqual([]);
    });
  }

  test("the done sequence runs nothing that moves, and Motion's own animations included", async ({ page }) => {
    await resetDemo(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();

    // "E" (§8.5) marks the current hero done directly, regardless of whether it's already
    // in progress — deterministic, unlike the primary button whose label and action
    // depend on that status.
    await page.keyboard.press("e");

    // Sampled repeatedly across the window the full sequence would occupy (≈700ms), so a
    // spring that starts late is still caught. `getAnimations()` only ever reports what is
    // running right now, which is exactly why one reading would prove nothing.
    const moving: string[] = [];
    for (let i = 0; i < 8; i++) {
      moving.push(
        ...(await page.evaluate((props) => {
          const bad: string[] = [];
          for (const animation of document.getAnimations()) {
            const timing = animation.effect?.getComputedTiming();
            const duration = typeof timing?.duration === "number" ? timing.duration : 0;
            if (duration <= 50) continue;
            const effect = animation.effect as KeyframeEffect | null;
            const keys = new Set<string>();
            for (const frame of effect?.getKeyframes?.() ?? []) {
              for (const key of Object.keys(frame)) keys.add(key);
            }
            const transitioned = (animation as CSSTransition).transitionProperty;
            if (transitioned) keys.add(transitioned);
            for (const key of keys) {
              const kebab = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
              if (props.includes(kebab)) bad.push(`${(animation as CSSAnimation).animationName || kebab}: ${Math.round(duration)}ms`);
            }
          }
          return bad;
        }, MOVING)),
      );
      await page.waitForTimeout(90);
    }
    expect(moving).toEqual([]);
  });

  test("done and undo promote the hero instantly, with no lingering transform animation", async ({ page }) => {
    await resetDemo(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();

    const heroTitleBefore = await page.getByTestId("hero-title").textContent();
    await page.keyboard.press("e");
    await expect(page.getByTestId("hero-title")).not.toHaveText(heroTitleBefore ?? "");

    // G4 moves focus to the new hero, which can trigger the browser's own (instant, under
    // reduced motion) scroll-into-view — a real, one-time position change that isn't the
    // "lingering transform animation" this test is after. Reading only once that's settled
    // isolates the thing this test actually checks: that the hero doesn't keep moving.
    await page.waitForTimeout(50);
    const first = await boundingBox(page, "hero");
    await page.waitForTimeout(300);
    const second = await boundingBox(page, "hero");
    expect(second.x).toBeCloseTo(first.x, 0);
    expect(second.y).toBeCloseTo(first.y, 0);
    expect(second.width).toBeCloseTo(first.width, 0);
    expect(second.height).toBeCloseTo(first.height, 0);

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
    // Immediately actionable again — a second done action right away must not be swallowed
    // by an in-flight exit animation blocking interaction.
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("e");
    await expect(page.getByTestId("hero")).toBeVisible();
  });
});

test.describe("M6 the toast", () => {
  test("lands bottom-left at 360×56 with a 44px Undo target", async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("e");

    const toast = page.getByTestId("toast");
    await expect(toast).toBeVisible();
    await page.waitForTimeout(400);
    const box = (await toast.boundingBox())!;
    expect(box.width).toBe(360);
    expect(box.height).toBe(56);
    // Bottom-left, clear of the expanded nav rail rather than on top of its own account
    // control — which is where an unoffset "bottom-left" puts it at this width.
    expect(box.x).toBeGreaterThanOrEqual(240);
    expect(box.x).toBeLessThan(400);
    expect(900 - (box.y + box.height)).toBeLessThan(40);

    // The measured v2 defect this moment exists to correct was a sub-44px Undo.
    const undo = (await page.getByRole("button", { name: /undo/i }).boundingBox())!;
    expect(undo.height).toBeGreaterThanOrEqual(44);
  });

  // 390 has the dock and /work's sticky primary; 768 has lost the primary but the dock
  // is `lg:hidden` and survives another 256px; 1024 has neither and the rail instead.
  // A single "≥768 is desktop" step put the toast on top of the dock for that whole
  // middle range, which only a width between the two could ever have caught.
  for (const { width, height } of [
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
  ]) {
  test(`clears the dock and the sticky primary at ${width}`, async ({ page }) => {
    await resetDemo(page);
    await page.setViewportSize({ width, height });
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.keyboard.press("e");
    await expect(page.getByTestId("toast")).toBeVisible();
    await page.waitForTimeout(400);

    // Craft check 10 forbids two intersecting fixed rectangles at 390, and it runs on a
    // page with no toast on it — so the one width where three fixed bars can stack is
    // the one width that check cannot see.
    const toast = (await page.getByTestId("toast").boundingBox())!;
    for (const testId of ["work-mobile-cta", "bottom-dock"]) {
      const other = await page.getByTestId(testId).boundingBox();
      if (!other) continue;
      const overlaps =
        toast.x < other.x + other.width &&
        other.x < toast.x + toast.width &&
        toast.y < other.y + other.height &&
        other.y < toast.y + toast.height;
      expect(overlaps, `toast overlaps ${testId} at ${width}`).toBe(false);
    }
  });
  }
});

test.describe("M4 the check", () => {
  test("draws on a completion and on nothing else", async ({ page }) => {
    // Deliberately no `resetDemo`. Its init script runs before *every* document in the
    // page's lifetime, including a reload — so it would wipe the persisted state this
    // test reloads in order to read. Each test gets a fresh context, so storage is
    // already empty here.
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();

    // A completion draws it.
    await page.keyboard.press("e");
    await expect(page.getByTestId("check-draw")).toHaveCount(1);
    await expect(page.getByTestId("check-draw")).toHaveCount(0);

    // An undo does not — this is the same slot emptying, and while the check was rendered
    // from the outgoing card it put a green tick on the item just un-completed.
    await page.keyboard.press("Control+z");
    await page.waitForTimeout(150);
    await expect(page.getByTestId("check-draw")).toHaveCount(0);

    // And neither does switching persona, which swaps the done list wholesale. The undo
    // case above is the one that was observed failing; this one is here because it is the
    // other way the slot's contents change without anything being finished, and the
    // contract is "on a completion and on nothing else" rather than "on the two things
    // that happened to break".
    // Both directions: only Priya has completions in the seed, so u1 → m1 empties the
    // list and m1 → u1 fills it back up. The second hop is the one worth asserting.
    // The trigger's accessible name is "Viewing as: <persona>", so match on the stable half —
    // pinning it to a persona's name means the locator stops matching the moment the
    // switch this test is making succeeds.
    const persona = page.getByRole("button", { name: /^Viewing as:/ });
    // The demo panel is a console, not a one-shot menu: picking a persona switches it and
    // leaves the panel open, so the other controls stay to hand. This test used to click
    // the trigger again before reaching for "Priya", which *closed* the panel it was
    // about to read — the click then waited out its timeout against a dismissed popover.
    // It passed only when that second click lost a race. Assert the state instead.
    await expect(persona).toHaveAttribute("aria-expanded", "false");
    await persona.click();
    await expect(persona).toHaveAttribute("aria-expanded", "true");

    await page.getByRole("button", { name: /Danielle/ }).click();
    await expect(persona).toHaveAccessibleName(/Danielle/);
    await expect(persona).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("button", { name: /Priya/ }).click();
    await expect(persona).toHaveAccessibleName(/Priya/);
    await page.waitForTimeout(400);
    await expect(page.getByTestId("check-draw")).toHaveCount(0);
  });
});

test.describe("M8 the re-sort wash", () => {
  test("washes the rows that moved, and only when the user did not move them", async ({ page }) => {
    await resetDemo(page);
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();

    const rows = () => page.$$eval("li[data-craft-row] .t-row", els => els.map(e => e.textContent ?? ""));
    const washed = () => page.$$eval("li.tint-wash .t-row", els => els.map(e => e.textContent ?? ""));

    // The demo clock is the one thing that re-ranks the queue on its own. Each jump
    // reopens the popover, because clicking inside it re-renders the content and detaches
    // whatever node the previous locator was holding.
    let moved: string[] = [];
    const before = await rows();
    for (let i = 0; i < 6 && moved.length === 0; i += 1) {
      await page.getByRole("button", { name: /^Viewing as:/ }).first().click();
      await page.getByRole("button", { name: "+15m", exact: true }).click();
      await page.waitForTimeout(180);
      moved = await washed();
      if (moved.length === 0) await page.keyboard.press("Escape");
    }
    await page.keyboard.press("Escape");

    // Something washed, the ranking really did change, and it is not the whole list —
    // "only animate rows whose index changed" is the catalog's note for this moment, and
    // washing everything communicates nothing.
    expect(moved.length).toBeGreaterThan(0);
    const after = await rows();
    expect(after).not.toEqual(before);
    expect(moved.length).toBeLessThan(after.length);
    for (const title of moved) expect(after).toContain(title);

    // 900ms and done — a wash that outlives the glance it is for is just a coloured row.
    await page.waitForTimeout(1100);
    expect(await washed()).toEqual([]);

    // A completion reorders the queue too, and it gets no wash: the user caused that one
    // and the promotion is already explaining itself.
    await page.keyboard.press("e");
    await page.waitForTimeout(300);
    expect(await washed()).toEqual([]);
  });
});

test.describe("G6 layout shift", () => {
  /**
   * "No layout shift from any transition" — and the word doing the work is *transition*.
   * Replacing a 285px hero card with a 160px one moves the queue underneath it by 125px,
   * and that is not a defect, it is the state change the user asked for; a raw score
   * counts it anyway and there is no threshold that separates the two.
   *
   * So the measurement is a difference. The same done-and-undo runs twice: once with
   * reduced motion, where every position change is instant and the score is purely the
   * cost of the content swap, and once with the full 700ms choreography. The catalog's
   * claim is that the choreography is a *transform* — popLayout lifting the outgoing card
   * out of the flow, a shared `layoutId` carrying the promoted card's box, a FLIP closing
   * the gap — and transforms are excluded from layout instability by definition. If any
   * of that quietly becomes a reflow, this is the number that moves.
   *
   * Both widths, because 390 stacks what 1440 puts side by side, and the sticky primary
   * and the dock only exist there.
   */
  for (const { width, height, label } of [
    { width: 1440, height: 900, label: "1440" },
    { width: 390, height: 844, label: "390" },
  ]) {
    test(`the done choreography adds no shift over the bare state change at ${label}`, async ({ page }) => {
      await page.setViewportSize({ width, height });

      await resetDemo(page);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/work");
      const bare = await shiftScoreOfDoneAndUndo(page);

      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto("/work");
      const animated = await shiftScoreOfDoneAndUndo(page);

      expect(animated).toBeLessThanOrEqual(bare + 0.02);
    });
  }
});
