import type { Page } from "@playwright/test";

/**
 * Waits until every animation on the page has finished, ignoring the ones that never do
 * (the all-clear aurora's hue drift is the only one, by contract — see the unit gate in
 * tests/unit/motion-tokens.test.ts).
 *
 * M8 made this necessary and it is worth stating why. Any check that *reads the page* —
 * axe's colour contrast, the craft suite's walk over every text node — reads computed
 * values, and an entrance animation makes those values temporarily untrue. Content
 * fading in from `opacity: 0` is graded against a colour it occupies for 200ms and never
 * again, and the craft suite's own rule for skipping invisible nodes then skips *real*
 * content, which changes the denominator underneath every ratio it asserts.
 *
 * Both surfaced within minutes of each other the moment the item sheet's sections
 * started staggering: one flaky axe run on `/items/it-01` (once in three, only under
 * parallel load) and craft check 2 reporting 57% of text nodes at one size on a page
 * whose text had not changed at all. Neither was a defect in the page.
 *
 * This polls for the settled state rather than sleeping a guessed number of milliseconds,
 * which is the same rule the rest of this suite follows: assert settled state, never
 * sample it. `512db5f` fixed one instance of this by hand for the theme crossfade; doing
 * it here means no future caller has to know.
 */
export async function animationsSettled(page: Page): Promise<void> {
  const quiet = () =>
    page.waitForFunction(
      () =>
        document.getAnimations().every((animation) => {
          const timing = animation.effect?.getComputedTiming();
          return timing?.iterations === Infinity || animation.playState !== "running";
        }),
      null,
      { timeout: 5000 },
    );

  // Twice, with a beat between, and the second one is the one that matters. A single
  // check is trivially satisfied by asking too early: `document.getAnimations()` returns
  // an empty list until React has committed and Motion has started anything, so on a
  // loaded machine "nothing is running" is indistinguishable from "nothing has begun".
  // That is not hypothetical — it is how craft check 2 kept failing on /items/it-01 with
  // the settle wait already in place, reading 7 text nodes on a page that has far more
  // because every staggered section was still at `opacity: 0` and therefore skipped.
  await quiet();
  await page.waitForTimeout(120);
  await quiet();
}
