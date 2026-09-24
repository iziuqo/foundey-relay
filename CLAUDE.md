# Relay — working notes

**This project is UX and visual design first.** Roughly 80% of the effort — and of the tokens —
belongs in the screens: layout, type, color, motion, copy, the feel of the thing at 2 metres.
Infrastructure work is only worth doing when it is in the way of that.

## The fast loop

Look at the app instead of rebuilding it. The dev server on :3000 (`.claude/launch.json` →
`relay-dev`, or `npm run dev`) hot-reloads every change; open it in the preview pane and screenshot
it. A production build proves nothing about a visual change that a dev server does not.

## What to run, and when

| | Cost | When |
|---|---|---|
| `npm test` | ~1s, ~250 chars | Freely. It is faster than deciding whether to run it |
| `npm run test:e2e` | ~55s, ~260 chars | After changing behavior, layout, or anything with an axe/a11y contract |
| `npm run dev:test` | — | Keeps the test server on :3100 warm between e2e runs |
| `npm run lint` | ~3s | Before committing. Also runs `scripts/check-source.mjs`: no literal colour, no `filter`, no fixed-width flex child |
| `npm run test:visual` | ~10s | After any change to how a screen *looks*. 48 pixel baselines (8 surfaces × 6 widths, light). A failure is a diff to look at, not a verdict: if the change was meant, `npm run test:visual:update` and commit the PNGs |
| `npm run check:gates` | ~75s | Before shipping a milestone. G1–G7 and G9 in one command, one line per step |
| `npm run build` | seconds | Only when shipping, or for G8 |
| `npm run check:g8` | 60–90s | **Pre-ship only.** Lighthouse three times over. Never part of a normal edit loop |
| `npm run export:deck` | ~1min | Only when the deck PDF needs regenerating |

## Ports, and a trap worth knowing

**Humans on :3000, tests on :3100.** Playwright runs its own dev server on 3100 and reuses one if it
is already there.

Playwright's `reuseExistingServer` will happily reuse a stale `next start` that an earlier session
left on a port, and report a confident green for code that is no longer on disk. That cost a session
about ten minutes. A dev server compiles what is on disk right now, so it cannot go stale — which is
why the tests use one even though a production build runs the suite a couple of seconds quicker.

If a suite passes suspiciously fast, or a fix "already works" before you have restarted anything,
check what is actually listening before believing it.

## Tests are not the slow part

Measured in this repo (M14): 278 unit tests in 2s, 291 e2e tests in ~55s, 48 visual baselines in 10s, a build in 3s. Anything that
feels slow is almost certainly Lighthouse, a deploy, or a rebuild that did not need to happen.

## Writing tests here

Assert settled state, never sample it. `expect(locator).toHaveCount(n)` polls; `await
locator.count()` reads once and races hydration — the store rehydrates the persona from
`localStorage` after the first paint, so anything persona-dependent is not there yet on the first
read. Two separate flaky failures in this repo have been exactly this.

## Keeping output cheap

Test output lands in an agent's context window, so it is a budget like any other. A passing e2e run
costs about 260 characters; it used to cost 15KB, which is most of what a screen's worth of design
work should be spending.

Two rules keep it there:

- **The suite reports with dots locally, lists in CI.** Failures still print in full, with the diff
  and the source line. Do not switch the local reporter back to `list` to "see what ran" — the count
  at the end is what ran.
- **axe assertions summarize.** Use `axeViolations(page)` from `tests/e2e/axe.ts`, never
  `JSON.stringify` of the raw result tree. One real failure in this repo was 232KB of JSON, about
  58,000 tokens, for something that fits on four lines. The full tree is written to `test-results/`
  if it is ever genuinely needed.

The same applies to reading things: `grep` an `error-context.md`, do not `cat` it. Pipe `npm run
build` through `tail`. Never `ps aux` unfiltered — that one dumps every Electron helper on the
machine.
