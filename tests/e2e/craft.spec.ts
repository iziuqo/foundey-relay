import { test, expect, type Page } from "@playwright/test";
import { animationsSettled } from "./settle";
import { cssColorToOklch } from "../../lib/color";

/**
 * The mechanical craft checks — plan/redesign/v3/ADVISOR-craft.md §9, the half that
 * needs a rendered page. (Checks 6 and 7, the tier ladder and wire's chroma-zero
 * transform, are cheaper against the stylesheet and live in tests/unit/tokens.test.ts.)
 *
 * Every check cites the v2 measurement it exists to prevent, so a failure is readable
 * without going back to the report.
 *
 * ---------------------------------------------------------------------------------
 * MIGRATED is the list of routes whose craft has actually been rebuilt. **Each
 * milestone adds its own route here when it lands** — M4 `/work`, M6 `/team`,
 * M7 `/updates` and `/lookup`, M9 the rest of `/system`, M10 `/deck`.
 *
 * Routes that are not listed still render through the v2 back-compat token aliases
 * (one radius for every control, one type size for most text), so running these checks
 * against them would fail for a reason the milestone has not reached yet. Adding a
 * route to this list is part of that milestone's exit gate, not an afterthought.
 * ---------------------------------------------------------------------------------
 */
const MIGRATED = ["/system/components", "/work", "/items/it-01", "/team", "/updates", "/lookup"];

/** Radius is a function of height: r = round(h × 0.28), snapped to the ladder. */
const RADIUS_FOR_HEIGHT: [number, number][] = [
  [24, 8],
  [28, 8],
  [32, 8],
  [40, 10],
  [48, 12],
];

const CONTROLS = "button, input, select, a[role='button'], [role='button']";

/**
 * Text nodes that are actually painted, with their computed type.
 *
 * "Painted" has to include ancestor opacity, not just the node's own box: §5.6 item 6
 * requires a row's action cluster to occupy its track **at all times** at `opacity: 0`
 * so that revealing it cannot move anything, which means every queue row lays out a
 * "Start" that puts no ink on the screen. Counting those as visible text made check 2
 * read five phantom 14px nodes on `/work` and would have had this suite grading the DOM
 * rather than the page.
 *
 * It also has to exclude `sr-only` accessible names (Dialog/Drawer titles, a page's own
 * `<h1>` when the nav already names the location): Tailwind's `sr-only` clips them to a
 * `clip-path: inset(50%)` box that still measures 1×1px, so they were passing the
 * width/height check while contributing zero ink — on a short page like `/lookup`
 * (ten text nodes in total) two invisible 16px accessible names were enough on their
 * own to tip check 2's share of one size over 55%.
 */
async function textNodes(page: Page) {
  // Settled, never sampled: an entrance animation in flight hides real content from the
  // opacity filter below and silently changes every ratio measured off this list.
  await animationsSettled(page);
  return page.evaluate(() => {
    const out: { text: string; size: number; tracking: string; color: string; tabular: string }[] = [];
    const walker = document.createTreeWalker(document.querySelector("main") ?? document.body, NodeFilter.SHOW_TEXT);
    const transparent = (el: Element) => {
      for (let node: Element | null = el; node; node = node.parentElement) {
        if (parseFloat(getComputedStyle(node).opacity) === 0) return true;
        if (getComputedStyle(node).clipPath === "inset(50%)") return true;
      }
      return false;
    };
    let node = walker.nextNode();
    while (node) {
      const text = node.textContent?.trim() ?? "";
      const el = node.parentElement;
      if (text && el) {
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.display !== "none" && !transparent(el)) {
          out.push({
            text,
            size: parseFloat(style.fontSize),
            tracking: style.letterSpacing,
            color: style.color,
            tabular: style.fontVariantNumeric,
          });
        }
      }
      node = walker.nextNode();
    }
    return out;
  });
}

for (const path of MIGRATED) {
  test.describe(`craft: ${path}`, () => {
    test("1 · every size above 16px is optically tracked", async ({ page }) => {
      // v2: 255 of 256 elements in main computed letter-spacing: normal, including a
      // 56px h1. It is the largest single contributor to "it doesn't look designed".
      await page.goto(path);
      const untracked = (await textNodes(page))
        .filter((n) => n.size > 16 && (n.tracking === "normal" || parseFloat(n.tracking) === 0))
        .map((n) => `${n.size}px "${n.text.slice(0, 40)}"`);
      expect(untracked, "text above 16px with no tracking").toEqual([]);
    });

    test("2 · the scale is a scale, and no single size swallows the page", async ({ page }) => {
      // v2 /work: 14px on 60 of 72 text nodes (83%), with a 3.3× hole between 17 and 56.
      // v2 /team used exactly two sizes on the whole page.
      await page.goto(path);
      const sizes = (await textNodes(page)).map((n) => n.size);
      const counts = new Map<number, number>();
      for (const size of sizes) counts.set(size, (counts.get(size) ?? 0) + 1);
      expect(counts.size, `distinct font sizes: ${[...counts.keys()].sort((a, b) => a - b).join(", ")}`).toBeLessThanOrEqual(8);
      const dominant = Math.max(...counts.values()) / sizes.length;
      expect(dominant, "share of text nodes at one size").toBeLessThan(0.55);
    });

    test("3 · every list renders one row height", async ({ page }) => {
      // v2 /work: 63/64/64/63/63, because the separator was a real border on some rows
      // and not others. v2 /team: 88/88/67/88/67/88/87, driven by whether the role
      // string wrapped.
      await page.goto(path);
      const lists = await page.evaluate(() =>
        [...document.querySelectorAll("[data-craft-list]")].map((list) => ({
          heights: [
            ...new Set(
              [...list.querySelectorAll("[data-craft-row]")].map((row) =>
                Math.round(row.getBoundingClientRect().height),
              ),
            ),
          ],
          rows: list.querySelectorAll("[data-craft-row]").length,
        })),
      );
      for (const list of lists) {
        expect(list.rows, "a marked list with no marked rows").toBeGreaterThan(0);
        expect(list.heights, "row heights within one list").toHaveLength(1);
      }
    });

    test("4 · controls sharing a line share a height and a centre", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1024 });
      await page.goto(path);
      const rows = await page.evaluate((selector) => {
        return [...document.querySelectorAll("[data-craft-row]")].map((row) => {
          const controls = [...row.querySelectorAll<HTMLElement>(selector)]
            // /system's state matrix forces `active`, whose 0.985 press transform
            // shrinks the rendered box to 39.4px. That is the demo working, not a
            // contract break — so measure layout, and leave the forced cells out of
            // the centre comparison entirely.
            .filter((node) => !node.hasAttribute("data-force"))
            .map((node) => {
              const box = node.getBoundingClientRect();
              return {
                height: node.offsetHeight,
                top: Math.round(box.top),
                centre: Math.round(box.top + node.offsetHeight / 2),
              };
            });
          // Group by visual line first: a wrapped row is two lines, and controls on
          // different lines are not row-mates.
          const lines = new Map<number, typeof controls>();
          for (const control of controls) {
            const line = [...lines.keys()].find((top) => Math.abs(top - control.top) < 8) ?? control.top;
            lines.set(line, [...(lines.get(line) ?? []), control]);
          }
          return [...lines.values()].map((line) => ({
            heights: [...new Set(line.map((c) => c.height))],
            centres: [...new Set(line.map((c) => c.centre))],
          }));
        });
      }, CONTROLS);

      for (const row of rows.flat()) {
        expect(row.heights, "heights of controls on one line").toHaveLength(1);
        expect(row.centres, "vertical centres of controls on one line").toHaveLength(1);
      }
    });

    test("5 · radius follows height", async ({ page }) => {
      // v2 computed border-radius: 12px on every control it had, from a 28px pill to a
      // 48px button, so r/h ranged 0.25 → 0.43.
      await page.goto(path);
      const wrong = await page.evaluate(
        ([selector, ladder]) => {
          const expected = new Map(ladder as [number, number][]);
          return [...document.querySelectorAll<HTMLElement>(selector as string)]
            .map((node) => {
              const height = node.offsetHeight;
              const radius = Math.round(parseFloat(getComputedStyle(node).borderTopLeftRadius));
              // Wire fidelity collapses every radius to 2px by design, so inside a wire
              // subtree that is the contract — and it is worth asserting, because a
              // control that kept its hi-fi radius there would mean the mode is being
              // applied by hand somewhere instead of through the tokens.
              const inWire = node.closest('[data-fidelity="wire"]') !== null;
              if (inWire) return radius === 2 ? null : `${node.tagName.toLowerCase()} in wire r${radius} (expected r2)`;
              const want = expected.get(height);
              return want === undefined || radius === want || radius >= 9999
                ? null
                : `${node.tagName.toLowerCase()} h${height} r${radius} (expected r${want})`;
            })
            .filter(Boolean);
        },
        [CONTROLS, RADIUS_FOR_HEIGHT] as const,
      );
      expect(wrong).toEqual([]);
    });

    test("9 · every number is tabular and slashed-zero", async ({ page }) => {
      // v2: 52 of 404 elements carried tabular figures, so every ticking countdown,
      // tier count and load triplet was a coin flip. v3 inverts the default; the only
      // opt-out is [data-prose-num], for prose that quotes a number in a sentence.
      await page.goto(path);
      const proportional = (await textNodes(page))
        .filter((n) => /\d/.test(n.text))
        .filter((n) => !n.tabular.includes("tabular-nums") || !n.tabular.includes("slashed-zero"))
        .filter((n) => !n.tabular.includes("proportional-nums"))
        .map((n) => `"${n.text.slice(0, 40)}" → ${n.tabular}`);
      expect(proportional).toEqual([]);
    });

    test("--text-3 never carries small text", async ({ page }) => {
      // Found in M1 by axe, not by eye: --text-3 is 3.68:1 on the canvas, which is AA
      // only at 18.66px or above. The first draft of /system used it for every 12px
      // caption — 90 violating nodes.
      await page.goto(path);
      const text3 = await page.evaluate(() => {
        const probe = document.createElement("span");
        document.body.append(probe);
        probe.style.color = "var(--text-3)";
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      });
      const small = (await textNodes(page))
        .filter((n) => n.color === text3 && n.size < 18.66)
        .map((n) => `${n.size}px "${n.text.slice(0, 40)}"`);
      expect(small, "--text-3 used below 18.66px").toEqual([]);
    });
  });
}

test.describe("craft: handheld", () => {
  test("10 · at 390 every target is at least 44×44 and nothing fixed overlaps", async ({ page }) => {
    // v2 at 390: 14 of 31 interactive targets were under 44px on an axis, and the
    // sticky action bar (y 716–764) met the floating dock (y 763).
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of MIGRATED) {
      await page.goto(path);
      const small = await page.evaluate((selector) => {
        return [...document.querySelectorAll<HTMLElement>(selector)]
          .filter((node) => node.offsetParent !== null)
          .map((node) => {
            const box = node.getBoundingClientRect();
            // The hit area may be extended by a transparent ::before rather than by
            // growing the box, so measure the pseudo-element when there is one.
            const before = getComputedStyle(node, "::before");
            const width = Math.max(box.width, parseFloat(before.width) || 0);
            const height = Math.max(box.height, parseFloat(before.height) || 0);
            return width >= 44 && height >= 44
              ? null
              : `${node.tagName.toLowerCase()} ${Math.round(width)}×${Math.round(height)} "${(node.textContent ?? "").trim().slice(0, 24)}"`;
          })
          .filter(Boolean);
      }, CONTROLS);
      expect(small, `targets under 44px on ${path}`).toEqual([]);

      const overlaps = await page.evaluate(() => {
        const pinned = [...document.querySelectorAll<HTMLElement>("*")].filter((node) => {
          const position = getComputedStyle(node).position;
          return position === "fixed" || position === "sticky";
        });
        const rects = pinned.map((node) => node.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
        const hits: string[] = [];
        for (let i = 0; i < rects.length; i += 1) {
          for (let j = i + 1; j < rects.length; j += 1) {
            const a = rects[i];
            const b = rects[j];
            if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) {
              hits.push(`${Math.round(a.top)}-${Math.round(a.bottom)} meets ${Math.round(b.top)}-${Math.round(b.bottom)}`);
            }
          }
        }
        return hits;
      });
      expect(overlaps, `overlapping pinned elements on ${path}`).toEqual([]);
    }
  });
});

/**
 * Check 8 · the chroma budget. ADVISOR-craft.md §9: "Sample every painted element on
 * /work: at most 12 have OKLCH chroma > 0.06, and the single highest-chroma element
 * belongs to the Act-now tier." *v2: the indigo primary button (C ≈ 72 in Lab) beat the
 * Act-now tint (C ≈ 14)* — the accent was the loudest object on a screen whose whole
 * argument is that loudness follows rank.
 *
 * Scoped to /work and /team by the advisor's own note (§11): /system and /deck must be
 * able to *show* the palette. /team is M6's; this runs on /work today.
 *
 * "Painted" means the element itself puts colour on the screen — its own text, its own
 * background, or a border with real width. An element counts once no matter how many of
 * those are saturated, because the budget counts objects the eye has to rank, not
 * declarations. Colour is read after the engine has resolved it, so a token that picks
 * up chroma through a var() chain cannot hide.
 */
const CHROMA_BUDGET = 12;
const SATURATED = 0.06;

async function saturatedElements(page: Page) {
  const samples = await page.evaluate(() => {
    const all = [...document.querySelectorAll<HTMLElement>("body *")];
    const indexOf = new Map(all.map((el, i) => [el, i]));

    function describe(el: Element): string {
      const tag = el.tagName.toLowerCase();
      const testid = el.getAttribute("data-testid");
      const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 32);
      return `${tag}${testid ? `[${testid}]` : ""} "${text}"`;
    }

    return all.map((el, i) => {
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      const painted =
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        parseFloat(style.opacity) !== 0 &&
        box.width > 0 &&
        box.height > 0;

      const colors: string[] = [];
      if (painted) {
        // Text colour counts only where this element paints text of its own; an
        // inherited `color` on a wrapper puts nothing on the screen.
        const paintsText = [...el.childNodes].some(
          (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim() !== "",
        );
        if (paintsText) colors.push(style.color);
        colors.push(style.backgroundColor);
        for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
          if (parseFloat(style[`border${side}Width`]) > 0) colors.push(style[`border${side}Color`]);
        }
        // An SVG glyph paints with fill and stroke, not colour — the tier icons and
        // every lucide icon live here.
        if (el instanceof SVGElement) colors.push(style.fill, style.stroke);
      }

      const parent = el.parentElement;
      return {
        index: i,
        parent: parent && indexOf.has(parent) ? indexOf.get(parent)! : -1,
        label: describe(el),
        colors,
        tier: el.closest("[data-tier]")?.getAttribute("data-tier") ?? null,
      };
    });
  });

  const chroma = samples.map((sample) =>
    Math.max(0, ...sample.colors.map((color) => cssColorToOklch(color)?.c ?? 0)),
  );
  const isSaturated = chroma.map((c) => c > SATURATED);

  /**
   * One coloured object, one entry. An icon is an `<svg>` whose `<polygon>` inherits
   * the same fill, and a time chip is a bordered span wrapping a glyph and a label in
   * the same hue — counting those as five saturated elements would measure the DOM, not
   * what the eye has to rank. So an element that has a saturated ancestor folds into it,
   * and the ancestor reports the loudest chroma in its own subtree.
   */
  const merged = new Map<number, { label: string; tier: string | null; chroma: number }>();
  for (const sample of samples) {
    if (!isSaturated[sample.index]) continue;
    let owner = sample.index;
    for (let p = sample.parent; p !== -1; p = samples[p].parent) {
      if (isSaturated[p]) owner = p;
    }
    const existing = merged.get(owner);
    const value = Math.max(chroma[sample.index], existing?.chroma ?? 0);
    merged.set(owner, { label: samples[owner].label, tier: samples[owner].tier, chroma: value });
  }

  return [...merged.values()].sort((a, b) => b.chroma - a.chroma);
}

test.describe("craft: the chroma budget", () => {
  test("8 · at most 12 elements on /work are saturated, and the loudest is Act now", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page.goto("/work");
    await expect(page.getByTestId("hero")).toBeVisible();

    const saturated = await saturatedElements(page);
    const listed = saturated.map((s) => `${s.chroma.toFixed(3)} ${s.tier ?? "—"} ${s.label}`);

    expect(listed.length, `saturated elements (C > ${SATURATED}):\n${listed.join("\n")}`).toBeLessThanOrEqual(
      CHROMA_BUDGET,
    );
    expect(saturated[0]?.tier, `the loudest element on the page: ${listed[0]}`).toBe("now");
  });
});
