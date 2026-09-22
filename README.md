# Relay

Making the next right action obvious, for the people doing the work and the people leading it.

A redesign of an internal fulfillment operations dashboard, built for the Foundey Senior Product
Designer challenge. The plan behind this build is in [`plan/PLAN.md`](plan/PLAN.md); the research
behind the plan is in [`plan/research/`](plan/research/).

## Links

- Prototype: [foundey-relay.vercel.app](https://foundey-relay.vercel.app)
- Deck: [foundey-relay.vercel.app/deck](https://foundey-relay.vercel.app/deck)
- Design system: [foundey-relay.vercel.app/system](https://foundey-relay.vercel.app/system)
- GitHub: [github.com/iziuqo/foundey-relay](https://github.com/iziuqo/foundey-relay) (private; contains the brief PDF)
- Figma — Design System: [figma.com/design/6LcEBYGmZ5g2ClZEZL1sVW](https://www.figma.com/design/6LcEBYGmZ5g2ClZEZL1sVW/foundey) (variables, text/effect styles, PriorityIcon/Button/Chip component sets)
- Figma — Prototype: [figma.com/design/kCzpf4SUDbgCiTETVLHUKB](https://www.figma.com/design/kCzpf4SUDbgCiTETVLHUKB)
- Figma — Deck: [figma.com/slides/kg9EEVz7cQ1d8z62HMgokd](https://www.figma.com/slides/kg9EEVz7cQ1d8z62HMgokd) (all 27 slides)

## Running it locally

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build       # copy check, tests, production build
npm test            # vitest
npm run check:copy  # R1: no dashes in user facing copy
npm run export:deck # PDF + per-slide PNGs of the deck, via Playwright
```

## Demo script

1. As Priya: read the hero card and open "How we sort your work".
2. Mark the printer job done. Watch the hazmat task move up, press Undo, then mark it done again.
3. Open Prototype controls (bottom right) and "Send a new urgent item". Notice the band on the
   hero. Press "Show me".
4. Switch to Danielle. See the NO OWNER tile. Assign the oversize parcel to a light-loaded
   teammate and watch the tile drop.
5. "Check in" on Tomasz. See his queue exactly as he sees it.
6. Turn on Wireframe mode. The ranking is still readable in grayscale, no color needed.

## Stack

Vite, React, TypeScript, Tailwind, framer-motion. No backend: state lives in a React context and
reducer, persisted to `localStorage`. Data is seeded from [`plan/seed.json`](plan/seed.json) and
never invented.
