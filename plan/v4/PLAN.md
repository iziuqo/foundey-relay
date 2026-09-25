# v4 — brief fidelity and craft

Written before the work, rewritten after it, so it records what shipped rather than what
was intended. Two jobs:

1. **Fidelity.** A reviewer opens `/work` and recognises *their own brief* — their
   context, their vocabulary, their four example rows — redesigned. Not a new problem.
2. **Craft.** Take the brutalist read out of the queue, make the done choreography
   confirm the right thing, put the icon set on the ladder the system already described,
   and rebuild the account control. Measured, not eyeballed.

---

## 0. What the brief says

> You're working at **Amazon** on an internal **operations application** used by the
> **fulfillment team** to manage and coordinate their **daily workflows**.

Currently the dashboard shows **Recent activity / Tasks (Orders) / Notifications / Team
updates (Internal Comms)**. Two complaints, verbatim:

- *"I never know what needs my attention first."* — workers
- *"I cannot see what each workers are doing"* — managers

The challenge: **redesign the dashboard so people can quickly identify the priority of
the individual work, from most critical to least urgent.**

### The four rows in the brief's screenshot

| # | Chip | Row | Time |
|---|---|---|---|
| 1 | ORDER | Order #4821 — payment mismatch, blocking fulfillment | due 2h ago |
| 2 | NOTIFICATION | Compliance alert — [entity] annual report filing due | due today |
| 3 | COMMS | [Teammate] flagged you in "Client escalation" thread | 3h ago |
| 4 | ORDER | Order #4796 — customer requested rush shipping | due tomorrow |

The PDF labels that screenshot **"Currently, the dashboard shows"** — it is the status
quo, not a target. So Relay carries the brief's *rows*, and ranks them by its own rule.
That is also what the deck already argued ("ranking was never the missing piece"), so
the argument and the data now agree.

---

## 1. What shipped — seed (`plan/seed.json`)

Scores verified by running the suite, not by hand. `T + B + I`, `≥60 = Act now`,
`≥30 = Up next`.

| id | Title | T | B | I | = | Tier |
|---|---|---|---|---|---|---|
| it-04 | **Order #4821 — payment mismatch** | 40 | 14 | 10 | **64** | **Act now — hero** |
| it-01 | Label printer offline at Pack 7 | 30 | 22 | 10 | 62 | Act now |
| it-03 | **Compliance alert — missing hazmat labels** | 22 | 14 | 25 | 61 | Act now |
| it-05 | **Tomasz flagged you in “Medical supplies escalation”** | 36 | 0 | 0 | 36 | Up next |
| it-13 | Danielle asked you to confirm the UPS order count | 36 | 0 | 0 | 36 | Up next |
| it-11 | **Order #4796 — customer requested rush shipping** | 8 | 0 | 4 | 12 | When you can |

The brief's four rows keep the brief's own relative order — 64 > 61 > 36 > 12 — and
Relay's own items interleave. Nothing was re-ranked to make a point.

**Why #4821 blocks 24 orders:** the payment method on the account failed
re-authorization, so every open order on that account is held at pack. That is what
"blocking fulfillment" means, and it is why the item is late *and* consequential — the
pair the score is made of.

`it-04` is also Priya's `currentTaskId`, so the hero's primary reads **Mark done** and
the signature choreography is one click from a cold load.

## 2. Vocabulary (`lib/copy.ts`, `lib/selectors.ts`)

The brief's four cards all have visible homes, and the deck's brief slide prints the map:

| Brief | Relay |
|---|---|
| Tasks (Orders) | `/work` — the ranked queue |
| Notifications | `/updates` → **Notifications** tab |
| Team updates (Internal Comms) | `/updates` → **Team comms** tab |
| Recent activity | `/updates` → **Activity** tab, and each item's own history |

The `UpdateTab` ids were renamed with the labels (`forYou`→`notifications`,
`system`→`activity`), so a code reader and a screen reader see the same word.

## 3. Claims corrected

All were checkable against the PDF and all were wrong:

- ~~"Four identical buttons"~~ → the PDF shows two filled *Review*, one outlined *Open*,
  one outlined *Review*. The true criticism is sharper: **the top two rows share the
  heaviest button on the screen**, so nothing on it is the first thing.
- ~~"System, safety, vendor, escalation"~~ → the brief's chips are **Order, Notification,
  Comms**.
- The managers' quote is now verbatim, including its slip of grammar.
- The landing's tier ranges said 40–59 / 20–39 / under 20. `lib/priority.ts` uses
  **≥60 / ≥30 / under 30**, and FYI is set by source, not by a score.

## 4. Craft — measured, then changed

Measured at 1440 on `/work` with `getComputedStyle`, not by eye:

| What | Was | Shipped |
|---|---|---|
| Icon strokes | lucide's `stroke-width="2"` on all 25 glyphs, whatever the size | The ladder `sizing.ts` has described since v3: 16@1.5, 18@1.6, 20@1.75, 24@1.9. Declared in `globals.css`, handed down as `--icon-stroke`, and paired with size in the new `icon-*` utilities so the two cannot drift. Held by a new craft test on four routes |
| Top bar | 40 / 38 / 32 px on one row | All three on 40. G2's own test only compared siblings, so it never saw it; it now measures the whole row |
| Account control | A 32px `Settings2` button printing "Priya", beside a greeting also printing "Priya" | 28px avatar + chevron in a 40px pill. Name lives in the accessible name only |
| `PersonAvatar` | `--surface-3`, which resolves to `--n-0` — white on white in light *and* wire | `--surface-2` with a hairline. It was invisible everywhere except dark mode |
| Tier glyphs | 20 of 24 viewBox units, hard mitred corners, once per row | A 14-unit span with rounded joins, ~⅓ less ink, same box so nothing reflowed. Four silhouettes, so G5 still reads them |
| Act-now rows | Card tint, row tint **and** chip tint, three red fields stacked | A chip inside an already-tinted row drops its fill and border and keeps its text colour |
| The countdown, late | `2` over `H` in an empty grey ring, plus a stray red pip from a round cap on a zero-length dash | `2h` over `late`, red, arc empty, cap butt. The small line moved 12px → 14px, fixing a G3 violation that had simply never been on screen |
| Status line | `· ⎵4 of 10 done` — the counter's box was reserved in front of the digit | Reserved on the whole clause, so the slack lands at the end of the sentence |
| Mark done | The check drew for 200ms while the promoted card arrived at 140ms, so for ~100ms the tick sat over the item that *replaced* the one just finished | The promoted card waits for the draw; the check swells and lifts as it goes. **420ms end to end**, measured frame by frame, down from ≈700 |

## 5. Figma

**Correction:** an early read reported the prototype file's Work, Handheld and Flows
pages as empty. They were not — Figma loads pages lazily, and `children.length` on an
unloaded page is 0. `await page.loadAsync()` first. Work and Handheld each hold 21 real
frames.

What shipped: a scripted v4 pass over both pages — 220 component-property edits and 83
text edits across 38 frames — then a structural pass over the 28 frames that show the
queue: Order #4821 promoted into the hero, the label printer inserted into the Act-now
group it vacated, the duplicate removed, and both band counts corrected. The two
after-done frames were rebuilt to the state that now follows a completed #4821.

Not done, and worth knowing: the Figma top bar still shows the v3 persona pill and text
mode switch rather than the v4 account control, and the library's `TierIcon` still
carries the v3 geometry.

## 6. Name

The site footer said lowercase `izaias`. It is **Izaias**, and the deck cover — which
`plan/PLAN.md` §10.7 always specified should carry it — now does.
