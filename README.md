# Relay

Making the next right action obvious, for the people doing the work and the people leading it.

A redesign of an internal fulfillment operations dashboard, built for the Foundey Senior Product
Designer challenge. The site is SEA4, a fulfillment center; the screens are seeded from one fixed
snapshot of a Tuesday morning at 10:40 local time, and no data is invented at runtime.

The work is deliberately split in two, and the deck leads with the first half:

- **Part A, the one hour answer.** The problem, the insight, the five failures, what was cut, and a
  wireframe. This is the brief as asked.
- **Part B, beyond the hour.** The hi-fi product, motion, the manager view and the ethics line it
  does not cross, accessibility, and the handoff concept. Every Part B slide is marked optional.

## Links

- Prototype: [foundey-relay.vercel.app](https://foundey-relay.vercel.app)
- Deck: [foundey-relay.vercel.app/deck](https://foundey-relay.vercel.app/deck)
- Design system: [foundey-relay.vercel.app/system](https://foundey-relay.vercel.app/system)
- GitHub: [github.com/iziuqo/foundey-relay](https://github.com/iziuqo/foundey-relay) (private; contains the brief PDF)
- Figma — Design System: [figma.com/design/6LcEBYGmZ5g2ClZEZL1sVW](https://www.figma.com/design/6LcEBYGmZ5g2ClZEZL1sVW/foundey) (variables, text/effect styles, PriorityIcon/Button/Chip component sets)
- Figma — Prototype: [figma.com/design/kCzpf4SUDbgCiTETVLHUKB](https://www.figma.com/design/kCzpf4SUDbgCiTETVLHUKB)
- Figma — Deck: [figma.com/slides/kg9EEVz7cQ1d8z62HMgokd](https://www.figma.com/slides/kg9EEVz7cQ1d8z62HMgokd)

The three Figma files are from the first pass. The app is the source of truth; pushing the current
screens back into Figma is the last step, not the starting point.

## Running it locally

```bash
npm install
npm run dev
```

| Script | What it does |
|---|---|
| `npm run dev` | Next dev server on :3000 |
| `npm run build` | Production build |
| `npm test` | Unit tests (priority model, actions, hotkeys, color contrast) |
| `npm run test:tz` | The same suite under São Paulo, Tokyo, and UTC (gate G5) |
| `npm run test:e2e` | Playwright: layout, text, keyboard, motion, and axe contracts |
| `npm run check:g8` | Lighthouse over `/work`. Takes a deploy URL, and `--mobile` |
| `npm run export:deck` | `exports/relay-deck.pdf` plus one PNG per slide |
| `npm run lint` | ESLint, including the rules that enforce §8.3 and §9.2 |

## Screens

| Route | What it is |
|---|---|
| `/work` | The worker's screen: one hero task, a ranked queue in three time tiers, the truck clock |
| `/team` | The manager's screen: a status sentence, risk tiles that filter, Needs you, the people board |
| `/updates` | List plus preview, split into For you and FYI |
| `/items/[id]` | Item detail, as an intercepting sheet over `/work` or as its own page |
| `/lookup` | The command palette as a full page, below the desktop breakpoint |
| `/system` | Foundations, components, patterns, and rules — the design system, generated from the same tokens the app uses |
| `/deck` | 16 slides, arrow keys or the rail to move. `/deck/print` is the export view |

## Demo script

Demo controls live in the **Demo** menu in the top bar, and every one of them is also in the command
palette (⌘K).

1. **As Priya.** Read the hero card, then open "How we sort your work" to see why that task is first
   in plain words.
2. **Mark it done** (or press `E`). The hazmat task is promoted into the hero. Press `⌘Z` to undo,
   then mark it done again.
3. **Demo menu → "Send a new urgent item."** A band appears on the hero rather than reordering the
   list under your eyes. Press "Show me" to accept it.
4. **Switch to Danielle.** The NO OWNER tile is a real filter. Assign the oversize parcel to a
   light-loaded teammate and watch the tile drop.
5. **Check in on Tomasz Nowak.** His queue, exactly as he sees it, read only.
6. **Wireframe mode.** The ranking stays readable in grayscale, with no color carrying meaning on its
   own.

## Keyboard

`J` / `K` move through the queue, `Enter` opens the selected row, `E` marks the hero done, `H` asks
for help, `⌘Z` undoes, `⌘K` opens the palette, `?` lists every shortcut. Every handler ignores events
aimed at an input, a button, a link, or anything inside a dialog.

## Quality gates

Each defect found in the first review maps to a test that fails the build if it comes back.

| Gate | What it holds |
|---|---|
| G1 | Components meet the size contract; controls in a row share a vertical center |
| G2 | Screenshots across six widths × light, dark, and wireframe |
| G3 | No computed font under 14px outside `kbd`; no clipped text |
| G4 | Zero axe violations on every state, and a keyboard-only run of the demo script |
| G5 | Unit and e2e suites pass under three time zones |
| G6 | Under reduced motion, no transform transition survives, and done/undo still completes |
| G7 | Main column stays at least 36rem; no region overlaps a sibling; no horizontal scroll |
| G8 | Lighthouse performance and accessibility at or above 95 on `/work`; CLS under 0.02 |
| G9 | An independent session reviews the build against the plan. The builder does not grade their own work |

## Stack

Next 16 (App Router, React 19) and Tailwind 4, with Radix primitives, Motion, NumberFlow, Sonner,
Vaul, and cmdk. State is a Zustand store over pure, unit-tested action functions, persisted to
`localStorage`. There is no backend: data is seeded from [`plan/seed.json`](plan/seed.json).

Server and first client render both use the seed state at the seed time, so they match exactly and
nothing shifts during hydration. All time formatting goes through `lib/time.ts` with an explicit
zone — a lint rule keeps `getHours` and friends out of the rest of the app, because the greeting
once read from the reviewer's own browser clock.

## The plan

[`plan/PLAN.md`](plan/PLAN.md) is the original implementation plan and
[`plan/research/`](plan/research/) holds the advisor research and the brief behind it. The plan for
this rebuild — tokens, screens, the motion catalog, and the gates above — is kept outside the repo
along with its screenshot evidence.
