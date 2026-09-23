import { test, expect, type Page } from "@playwright/test";

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
const MIGRATED = ["/system/components"];

/** Radius is a function of height: r = round(h × 0.28), snapped to the ladder. */
const RADIUS_FOR_HEIGHT: [number, number][] = [
  [24, 8],
  [28, 8],
  [32, 8],
  [40, 10],
  [48, 12],
];

const CONTROLS = "button, input, select, a[role='button'], [role='button']";

/** Text nodes that are actually painted, with their computed type. */
async function textNodes(page: Page) {
  return page.evaluate(() => {
    const out: { text: string; size: number; tracking: string; color: string; tabular: string }[] = [];
    const walker = document.createTreeWalker(document.querySelector("main") ?? document.body, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const text = node.textContent?.trim() ?? "";
      const el = node.parentElement;
      if (text && el) {
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.display !== "none") {
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
