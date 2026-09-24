# Relay

Making the next right action obvious, for the people doing the work and the people leading it.

A redesign of an internal fulfillment operations dashboard, built for the Foundey Senior Product
Designer challenge. The site is SEA4, a fulfillment center; the screens are seeded from one fixed
snapshot of a Tuesday morning at 10:40 local time, and no data is invented at runtime.

## The one-hour answer

The brief asked for under an hour and a low-fidelity solution. That answer comes first, everywhere
— in the deck, in this file, and in the order of the Figma pages:

**Workers cannot rank their own work, because the dashboard never ranked it for them.** So rank it,
once, by the only thing that matters in a fulfillment center — what a truck, a person or an order
count is about to lose — and put exactly one thing at the top of the screen with the reason
written underneath it in plain words. Four tiers, not a feed: **Act now · Up next · When you can ·
For your info**. The manager gets the same ranking from the other side: not a roster, but the
exceptions, and who is already on them.

Wireframe mode (`Wire` in the top bar) is that answer with every colour channel multiplied by
zero. If the ranking still reads, the ranking is real and not a paint job. It is a real mode with
its own token values, not a `grayscale` filter.

**Everything past that is optional**, and marked so: the hi-fi product, motion, the manager view,
accessibility, and the design-system and Figma work. Part A of the deck is the hour. Part B is
labelled Optional on every slide.

## Links

- Prototype: [foundey-relay.vercel.app](https://foundey-relay.vercel.app)
- Deck: [foundey-relay.vercel.app/deck](https://foundey-relay.vercel.app/deck) (`/deck/print` is the export view)
- Design system: [foundey-relay.vercel.app/system](https://foundey-relay.vercel.app/system)
- GitHub: [github.com/iziuqo/foundey-relay](https://github.com/iziuqo/foundey-relay) (private; contains the brief PDF)
- Figma — Design System: [Relay — Design System (v3)](https://www.figma.com/design/e3B6SgcYfcdvMHuQ3xoHLH) — variables in three modes, text and effect styles, every component as a variant set. Published as a library
- Figma — Prototype: [Relay — Prototype (v3)](https://www.figma.com/design/8mlKK2l3gEJ5wB6vTipuxA) — 21 frames at 1440 and 21 at 390, built from library instances, eight flows runnable in presentation mode
- Figma — Deck: [Relay — Deck (v3)](https://www.figma.com/slides/VKG6ns7bXazMo8FOIVLRnU) — the in-app deck mirrored slide for slide, with native text

**The app is the source of truth.** The three Figma files are generated from the shipped screens
and their tokens, not the other way round, which is why they were built last. Design systems that
are hand-maintained in two places drift within days; this one has a direction.

## Screens

| Route | What it is |
|---|---|
| `/work` | The worker's screen: one status sentence, one hero task with its reason and a countdown, then a ranked queue in four tiers, and the truck clock |
| `/team` | The manager's screen: exceptions first — a status sentence, four tiles that filter, "Needs you", then the people board |
| `/updates` | List plus preview, split into For you, Team and System |
| `/items/[id]` | Item detail, as an intercepting sheet over `/work` or as its own page on a direct load |
| `/lookup` | The command palette as a full page, below the desktop breakpoint |
| `/system` | Foundations, components, patterns, rules and motion — read out of the running cascade, not typed by hand |
| `/deck` | 16 slides, arrow keys or the rail to move |

## Demo script

Demo controls live in the **Demo** menu in the top bar, and every one is also in the command
palette (⌘K).

1. **As Priya.** Read the hero card, then open "Why is this first?" to see the score in plain words.
2. **Mark it done** (or press `E`). The next item is promoted into the hero and the ranking
   re-reads. Press `⌘Z` to undo, or use the Undo in the toast before its ring runs out.
3. **Demo → "Send a new urgent item."** A band appears on the hero rather than reordering the list
   under your eyes. Press "Show me" to accept it.
4. **Switch to Danielle.** The "No owner" tile is a real filter. Assign the oversize parcel to a
   light-loaded teammate and watch the tile drop.
5. **Open a teammate.** Their queue, exactly as they see it, read only.
6. **Wire.** The ranking stays readable with no colour carrying meaning on its own.

## Keyboard

`J` / `K` move through the queue, `Enter` opens the selected row, `E` marks the hero done, `H` asks
for help, `⌘Z` undoes, `⌘K` opens the palette, `Esc` closes a sheet, `?` lists every shortcut. Every
handler ignores events aimed at an input, a button, a link, or anything inside a dialog.

## Running it locally

```bash
npm install
npm run dev
```

| Script | What it does |
|---|---|
| `npm run dev` | Next dev server on :3000 |
| `npm run dev:test` | A second dev server on :3100 for Playwright, with its own build directory |
| `npm run build` | Production build |
| `npm test` | 278 unit tests: the priority model, actions, copy, contrast pairs, tokens |
| `npm run test:tz` | The same suite under São Paulo, Tokyo and UTC (G7) |
| `npm run test:e2e` | 291 Playwright tests: size contract, breakpoints, axe, wire, reduced motion |
| `npm run test:visual` | 48 pixel baselines — eight surfaces × six widths. `:update` re-records them |
| `npm run check:gates` | G1–G7 and G9 in one command, about 75s, one line per step |
| `npm run check:g8` | Lighthouse over `/work`, median of three. Takes a deploy URL, and `--mobile` |
| `npm run export:deck` | `exports/relay-deck.pdf` plus one PNG per slide |
| `npm run lint` | ESLint plus `scripts/check-source.mjs`: no literal colour outside `globals.css`, no `filter`, no unexplained fixed widths |

Tests run against their own dev server on :3100, never :3000. A dev server compiles what is on
disk, so it cannot go stale; a `next start` left over from an earlier session can, and Playwright
will happily reuse it and report green for code that no longer exists.

## Quality gates

Gates are mechanical, and nothing is graded by looking at the thing it grades.

| Gate | What it holds |
|---|---|
| G1 | Every colour resolves to a token; no literal hex or `oklch()` outside `globals.css`; Tailwind's own scale is not redefined |
| G2 | Controls that share a row share a height and a vertical centre; every touch target ≥44px at handheld |
| G3 | 390 / 768 / 1024 / 1280 / 1440 / 1920 render every surface with no horizontal scroll, no overlap, no clipped text |
| G4 | Zero axe violations on every route in all three modes; visible focus everywhere; AA on every text pair |
| G5 | The wire test: with colour removed the ranking is still recoverable, and there is no `filter` in the CSS |
| G6 | Every animation has a reduced-motion variant; nothing loops but the all-clear; no layout shift from a transition |
| G7 | Greeting, clocks and relative labels are identical in three time zones |
| G8 | Lighthouse performance and accessibility ≥95 on `/work`, CLS <0.02, desktop and mobile, median of three |
| G9 | Verb-first buttons, no orphaned labels, grade ≤8 reading level |
| G10 | Each Figma file matches what shipped, verified by screenshot rather than by an API call returning 200 |
| G11 | A session that did not build it drives every route at three widths and writes the review |

Ten of the eleven are a command. G10 and G11 are judgement, so they are done by a different
session from the one that built the thing.

## Stack

Next 16 (App Router, React 19) and Tailwind 4, with Radix primitives, Motion, NumberFlow, Sonner,
Vaul and cmdk. Type is Inter Variable, self-hosted for its optical-size axis, with IBM Plex Mono
for identifiers only. State is a Zustand store over pure, unit-tested action functions, persisted
to `localStorage`. There is no backend: data is seeded from [`plan/seed.json`](plan/seed.json).

Server and first client render both use the seed state at the seed time, so they match exactly and
nothing shifts during hydration. All time formatting goes through `lib/time.ts` with an explicit
zone — a lint rule keeps `getHours` and friends out of the rest of the app, because the greeting
once read from the reviewer's own browser clock.

## The plan

[`plan/PLAN.md`](plan/PLAN.md) is the original implementation plan and
[`plan/research/`](plan/research/) holds the advisor research and the brief behind it. The plan for
this rebuild — the decisions, the type and colour system, the motion catalog, the milestones and
the gates above — is kept outside the repo along with its screenshot evidence and the independent
review that cleared it to ship.
