# Relay

Making the next right action obvious, for the people doing the work and the people leading it.

A redesign of an internal fulfillment operations dashboard, built for the Foundey Senior Product
Designer challenge. The plan behind this build is in [`plan/PLAN.md`](plan/PLAN.md); the research
behind the plan is in [`plan/research/`](plan/research/).

## Links

- Prototype: _recorded after deploy, see below_
- Deck: _prototype URL_ + `/deck`
- Design system: _prototype URL_ + `/system`
- Figma: _added once available, see §13 of the plan_

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
