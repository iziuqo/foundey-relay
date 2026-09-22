# Visual + Interaction Design Advisory: "Shift" (fulfillment ops dashboard)

Advisor lens: visual and interaction design. Written so a cheap implementation model can build it literally. Every value is meant to be copied as written. If a value is missing, use the nearest token. Never invent a new color.

---

## 0. Diagnosis: why the existing "ranked queue" still fails

The brief's current screen already has "Needs Your Attention (6)", ranked, with red/amber dots. Users still complain because:

1. **Everything is the same size and weight.** Six identical rows means there's no visible "first thing." A ranked list is still a list, so the eye has to read all six rows to decide.
2. **Rank is shown only by a 8px dot color plus button fill.** Red vs amber is the only difference, which fails for color-blind users and in glare on a warehouse floor.
3. **No "why."** "Payment mismatch, blocking fulfillment" gives a cause but never says *why it ranks above* the next row. Workers don't trust ranking they can't see into, so they re-triage in their heads.
4. **Time is static text** ("due 2h ago") that doesn't feel urgent or change as they watch.
5. **The reference cards compete.** Four equal gray cards under the queue have the same visual mass as the queue itself.
6. **There is no manager surface at all.**

**Where the four original panels went (nothing dropped):**

| Original panel | New home | Ranked? |
|---|---|---|
| Tasks (Orders) | Priority queue, source tag `ORDER` | Yes |
| Notifications | Priority queue when actionable (source `NOTIF`); informational ones go to Recent activity | Yes when actionable |
| Team updates (Internal Comms) | Priority queue when addressed to you or needing a reply (source `COMMS`); otherwise the rail's "Team updates" card (FYI) | Only when actionable |
| Recent activity | Right rail "Recent activity" card only (handheld: behind the "Updates" chip) | Never |

Use this table as a deck slide ("Where did my panel go?").

**Design goal (the "3-second test"):** a worker who glances at the screen can say *what* to do now, *why it's first*, and *how late it is*, without reading a second item.

---

## 1. Mobbin research: what to steal (20 Mobbin searches, deep mode where supported; 26 references cited)

| # | Reference | What to steal, exactly |
|---|---|---|
| 1 | [Linear – issues grouped w/ priority bars](https://mobbin.com/screens/be6c4ee4-aa93-42b4-89b3-dcfc8386f022), [Linear – High Priority view](https://mobbin.com/screens/610d34b6-6ad8-45ab-80fb-2107b31ed01e) | **Shape carries rank on its own, without color.** The priority glyph (bars) reads in grayscale. Group headers are a tinted 32px band with the status icon, label and count ("In Progress 5"). Rows are 36–40px, single line, and the meta sits right-aligned. Copy the header band and the right-aligned meta. Our tier icons follow the same idea: different *shapes* per tier. |
| 2 | [Linear – Inbox with detail pane](https://mobbin.com/screens/beb9d6b3-ec34-46d7-9332-320fcb32a338) | List on the left, detail on the right, properties in a right sub-column. The "Overdue" item carries a red icon and the word "Overdue", not just color. Use it for our drawer layout (properties block on top, activity below). |
| 3 | [Linear – toast w/ Undo](https://mobbin.com/screens/14cbb61d-2120-46fa-b29c-b7678e4b85cc) | Small white toast at the bottom right: "Notification deleted · Undo · ×". We put ours bottom-left on desktop (see §6), but keep the same anatomy: icon, one short sentence, text-button Undo, close. |
| 4 | [incident.io – Home, active incidents](https://mobbin.com/screens/beb49f89-6e5a-47e0-a02b-70665a3fe7bf) | **Severity chip = icon + word ("Critical") in a solid red chip**, plus a live elapsed timer ("50m 59s") at the card's top right. Steal: a live ticking time pill for the hero and Now rows, in tabular numbers. The static "due 2h ago" becomes "Overdue 2:04:17", counting. |
| 5 | [incident.io – On-call now](https://mobbin.com/screens/6ba9d2a8-6b1b-4731-a4c4-f32718856481) | "On call now: [avatar chip]" and a red vertical "now" line on a timeline. Steal the **"now" chip pattern** for the manager header ("On shift now: 14 · Break: 2") and the red NOW marker for shift progress. |
| 6 | [Zendesk – Tickets requiring your attention](https://mobbin.com/screens/c733739e-7516-414a-bfc5-d163860dbb2e) | "Tickets requiring your attention (25)" with the queue split by in-table headers "Priority: Urgent" / "Priority: Normal". Precedent for **tier section headers with counts inside one list**. What not to copy: every row has a red "Open" badge, and badge repetition flattens hierarchy. |
| 7 | [Programa – Overdue group tinted](https://mobbin.com/screens/079d676e-8012-4f1d-b29a-a20bfb05a015) | The "Overdue" group has a **pale red row tint plus a thin colored left rail**, and "This Week" has a neutral rail. Steal: **only the top tier gets a background tint**. All other tiers stay white. That gives hierarchy without a wall of color. |
| 8 | [Better Stack – on-call gap](https://mobbin.com/screens/f5ca8d25-7fa7-4f35-b2a7-0b587ca7a4df) | A coverage gap is drawn with **diagonal red hatching** plus the label "14-hour gap". Steal the hatch pattern for load bars over 100% capacity (the overflow segment is hatched, so it reads without color). |
| 9 | [7shifts – schedule w/ conflicts](https://mobbin.com/screens/d9ad10cb-11f5-4035-8268-5b83057a0ad6) | Header chips "2 Conflicts" and "2 Overtime" in red-outlined pills, "5h Total OT" under the employee name, and a pink row tint for people in trouble. Steal: **problem-count pills in the manager header** and a per-person trouble line under the name. |
| 10 | [HubSpot – Team availability](https://mobbin.com/screens/49fb345d-b6f3-4145-833a-9b2e111e7e1f) | Row shows avatar, name, "Assigned: 1 ticket", and "Current status: ● Away". This is the minimum worker row, and ours adds current task and load bar. |
| 11 | [ClickUp – Team cards w/ online filter](https://mobbin.com/screens/9d29b1e7-7fb3-482a-8d4c-88891da75e66) | Status filter "All 5 / Online 2 / Offline 3" with counts. Steal the **status filter with counts** for the manager segmented control. What not to copy: huge photo cards. They waste space and show no work. |
| 12 | [Asana – Set capacity](https://mobbin.com/screens/8e35ff5b-86ad-475e-9eb5-d2921197dcbc), [ClickUp – Workload grid](https://mobbin.com/screens/95dd15f8-941f-4898-aee0-3ccceafccee9) | Asana draws capacity as a dashed red threshold line over the allocation curve. ClickUp puts a small warning badge on over-capacity cells. Steal: **a load bar with a visible 100% tick mark**. The overflow goes past the tick in hatched red, and an alert icon appears when over. |
| 13 | [Stripe – Your overview](https://mobbin.com/screens/673e89af-fe9e-4ab9-ac27-435dedf21888), [Stripe – Payouts paused banner](https://mobbin.com/screens/c4b398b4-4393-44d7-9732-93a55eb9ca3b) | Calm white cards on a very light canvas with "Updated 11:08" timestamps. The one critical banner is pale red with a red icon, a bold title and one secondary action on the right. Steal: **"Updated hh:mm" freshness stamps** on the manager tiles, and the banner anatomy for our "new urgent item" hero notice. |
| 14 | [Vercel – Projects overview (list)](https://mobbin.com/screens/2dbc8bfc-0725-4682-9453-27f6be9d2bc1), [Vercel – Action Required card](https://mobbin.com/screens/c54df5c8-f72c-406e-bb92-a9a6b116f0a5) | Neutral monochrome UI where status icons are the only color. The sidebar "Action Required" card is pale red with a triangle icon. Steal: **a monochrome shell with color only for status**, and an ink (#000-ish) primary button. |
| 15 | [Attio – Tasks grouped by due](https://mobbin.com/screens/16b2e7b2-da40-4dc2-a63b-139c3078c1d9) | Due text is colored *and* worded: "Due today" (amber), "Due 4 days ago" (red), "Due in 2 days" (amber), "Due Sep 5" (gray). Steal: **time pill copy rules** (relative words, then color). |
| 16 | [Charma – complete item → toast Undo](https://mobbin.com/flows/c711020f-6ff2-4c3d-93db-83cbad847c2e) | The row disappears immediately and a dark toast says "Item completed! [Undo]". Zero confirmation dialogs. Contrast with the [Zoho CRM flow](https://mobbin.com/flows/5926f92e-5549-4623-97af-74e2098a5144), which asks "Are you sure?" **Never add a confirm dialog. Undo replaces confirmation.** |
| 17 | [Todoist – toast w/ Undo](https://mobbin.com/screens/75c4093b-73e7-4344-b2e7-54e90d94e58c) | Dark ink toast at the bottom-left. Undo is a colored text button and the × is separate. That is the exact placement and palette of our toast. |
| 18 | [Superhuman – Inbox Zero](https://mobbin.com/screens/08b8e810-572c-45b5-91ec-4f76bc6e6a0d) | A calm full-bleed all-clear with a keyboard hint pill at the bottom. Steal the **tone**: a big quiet headline and one hint. We drop the gradient and keep the calm. See also [Twist](https://mobbin.com/screens/86de625e-61f1-4039-a770-328eac88a3ee) ("You've hit Inbox Zero" as a small status line under the H1) and [Front](https://mobbin.com/screens/d45e3c73-35a6-4917-b5fa-50c84e4b65d2) ("Mission accomplished"). **Reject** [Trello's confetti](https://mobbin.com/screens/5efa7ddf-952d-4264-938c-b5ec328ee885). It's too loud for 200 completions per shift. |
| 19 | [Juicebox – command palette footer hints](https://mobbin.com/screens/2af813bf-0129-45d1-81ed-069edee76e16), [Magnific – palette](https://mobbin.com/screens/6ad219c3-e308-4d95-b4dc-70859de1e02d) | A palette footer with kbd hints: "↵ to select · ↑↓ to navigate · Tab to jump sections". The selected row has a 2px accent left bar. Steal both for ⌘K and the focus state of our list rows. |
| 20 | [Jobber (iOS) – job detail](https://mobbin.com/screens/96d24bf8-5eaa-44cb-b687-f7c353419b42) | **A field-worker screen with one huge full-width primary button ("Complete Task")** plus a "…" square next to it, and the address and schedule as big text. This is the handheld hero model. |
| 21 | [ClickUp (iOS) – overdue task, Clear](https://mobbin.com/screens/0909b0bc-0c11-4acf-898b-1d3a82b0a669) | A bottom-pinned two-button bar: "Open task" (secondary) and "✓ Clear" (primary), full width with safe-area padding. Steal it for the handheld sticky action bar. |
| 22 | [Tiimo (iOS) – priority groups](https://mobbin.com/screens/99dab3c1-f5f5-4cb2-88b9-fea41d8c3e8d) | Priority groups use ▲ HIGH (red triangle), ● MEDIUM (amber dot) and ▼ LOW (blue down-triangle), so each has a distinct shape *and* color, with a "0 / 7" progress chip top-left. Direct precedent for **redundant shape encoding** and a "done today" counter. |
| 23 | [Jira Cloud (iOS) – work items](https://mobbin.com/screens/7ccfb103-e54d-45aa-9f8f-40552da41b67) | Priority chevrons (︽ ︿ ﹀) sit next to a status word chip and a date. Dense but legible on 390. |
| 24 | [Front – Workload analytics](https://mobbin.com/screens/32987909-e219-442e-89a4-249ab388376b), [Gorgias – Live overview](https://mobbin.com/screens/8d140229-3dec-4e38-aa2c-b16f18419001) | Gorgias has a stat strip "Agents online 1 · Offline 0 · Assigned 3 · Unassigned 2" in 4 equal tiles with the label on top and a big number. That is our team risk strip. Front's "Data from up to 1 hour ago" is the freshness stamp. |
| 25 | [Wrike – assignee popover](https://mobbin.com/screens/62d1ad89-33f1-4b10-b564-674ff2d51187), [Slack – assignee picker](https://mobbin.com/screens/653fd646-3333-4cd4-a783-3af15d9277b0) | In-place popover with a search field, then avatar, name and a right-aligned muted status ("Not in list"). Our reassign popover swaps that right-aligned text for a **mini load bar plus a count**. |
| 26 | [Sentry – filtered issues](https://mobbin.com/screens/24993e88-58f7-4ae4-bf84-626e96d9a63f) | A priority bar-glyph column, "Last seen / Age" in tabular numbers, and "Saved changes ✓" as a dark pill toast. Confirms the dark-pill toast convention in dev tools. |

**What's not on Mobbin:** there are no real warehouse or handheld-scanner apps in the index. The logistics searches returned Programa, Square and Shopify. Our fulfillment-specific choices (48px targets, glare-proof contrast, glove use) come from ops ergonomics, not from precedent. Flag that in the deck as a known assumption.

---

## 2. Visual direction

### Three directions considered

**A. "Paper & Ink" (chosen).** Warm off-white canvas, white cards, near-black ink text and ink primary buttons, and a monochrome shell. Color is reserved for priority and status only. Think Linear/Vercel restraint with Stripe's warmth, echoing the brief's warm-gray wireframe so the before and after feel like one product evolving.

**B. "Control Room."** A dark ops UI (#111 background) with glowing status colors and dense tables, in the Datadog/PagerDuty style. It looks impressive in a deck, but it fails on a bright warehouse floor (glare, low ambient contrast on handhelds), turns every screen into alarm aesthetics, and pushes users toward alert fatigue.

**C. "Signal Blocks."** Big full-color tier blocks (red, amber and blue panels) in a kanban layout. Very scannable at a distance, but color dominates. When there are 5 red items the screen is 60% red, and it looks like a toy or an Amazon-orange clone.

### Pick: A, "Paper & Ink." Why

- **The hierarchy comes from contrast of *mass*, not color.** One large hero card, then compact rows, then a quiet rail. Color is added only as a *redundant* layer, so the design survives grayscale printing, color blindness and glare.
- **Calm is a feature.** The complaint is overwhelm. Every pixel of color is a claim on attention, and we only spend it where the ranking says to.
- **Legible under bright industrial lighting.** Ink on off-white gives 15.9:1 for primary text.
- **Credible as an internal Amazon-grade tool without impersonating Amazon.** No orange and no smile arrow.

### Name and wordmark

**Product name: `Shift`.** It means the work shift, and "shift your attention." Use it everywhere. Never use "Floor."

**Wordmark:**
- **Mark:** a 20×20px square with 6px radius, filled `#1C1B19`. Inside are three white horizontal bars, left-aligned at x=5px, each 2px tall with 2px rounded ends and a 3px vertical gap. Widths from top to bottom are 10px, 7px and 4px, and the group is vertically centered. It reads as "a ranked queue, most important first."
- **Logotype:** "Shift" in Inter 600, 17px, letter-spacing -0.02em, color `#1C1B19`, 8px to the right of the mark, baseline-aligned to the mark's optical center.
- **Lockup height** is 20px. In the nav it sits 20px from the left and is vertically centered in a 56px header row.
- **Favicon:** the mark alone.

---

## 3. Design tokens

### 3.1 Color: neutrals ("stone")

| Token | Hex | Use |
|---|---|---|
| `--n-0` | `#FFFFFF` | surface (cards, rows, drawer) |
| `--n-25` | `#FAFAF9` | row hover |
| `--n-50` | `#F6F6F4` | app canvas background |
| `--n-75` | `#F1F1EE` | pressed row, kbd bg, skeleton base, segmented control track |
| `--n-100` | `#E8E8E4` | divider hairlines, load-bar track |
| `--n-200` | `#DAD9D4` | default border (cards, inputs) |
| `--n-300` | `#C9C7C0` | input border hover |
| `--n-400` | `#8F8D85` | control border that must be visible (3.07:1 on canvas), disabled text |
| `--n-500` | `#6B6961` | tertiary text / meta (5.08:1 on canvas, 5.50:1 on white) |
| `--n-600` | `#57554F` | secondary text (7.45:1 on white) |
| `--n-800` | `#2E2D2A` | ink button hover |
| `--n-900` | `#1C1B19` | primary text, ink button, toast bg (17.21:1 on white) |

### 3.2 Accent (selection, focus, links: *not* priority)

| Token | Hex | Notes |
|---|---|---|
| `--accent` | `#4338CA` | links, selected nav text, and the selected row's left bar. 7.90:1 on white |
| `--accent-bg` | `#EEF2FF` | selected nav item bg, selected row bg (text on it 7.07:1) |
| `--focus` | `#4F46E5` | focus ring. 6.29:1 on white, 5.78:1 on the Now tint |
| `--accent-on-ink` | `#A5B4FC` | Undo link inside the dark toast (8.63:1 on #1C1B19) |

Primary buttons are **ink** (`#1C1B19`), not accent. Accent never appears as a big filled area. That keeps indigo from being confused with a priority tier.

### 3.3 Semantic priority tiers

Four tiers. Names are verbs of time, because workers think in "when," not "severity."

| Tier | Meaning (display copy) | fg (text) | bg (tint) | border | solid (icon / rail) |
|---|---|---|---|---|---|
| **NOW** | "Do now": blocking, overdue, or breaches in <30 min | `#B42318` | `#FEF3F2` | `#FDA29B` | `#D92D20` |
| **NEXT** | "Do next": due this shift / <2h | `#93370D` | `#FFFAEB` | `#FEC84B` | `#B54708` (icon) · `#DC6803` (rail) |
| **LATER** | "Later today": no risk yet | `#475467` | `#F2F4F7` | `#D0D5DD` | `#667085` |
| **DONE** | completed | `#067647` | `#ECFDF3` | `#ABEFC6` | `#079455` |
| (FYI) | reference / updates, not action | `#57554F` | `#F1F1EE` | `#DAD9D4` | `#8F8D85` |

**Contrast ratios (computed, WCAG 2.x):**

| Pair | Ratio | Passes |
|---|---|---|
| NOW fg `#B42318` on NOW bg `#FEF3F2` | 6.05 | AA text |
| NOW fg on white | 6.57 | AA text |
| NOW solid `#D92D20` on white (icon/rail) | 4.83 | AA text; ≥3 non-text |
| White on NOW solid `#D92D20` (solid chip label) | 4.83 | AA text |
| NEXT fg `#93370D` on NEXT bg `#FFFAEB` | 7.21 | AA/AAA |
| NEXT icon `#B54708` on white | 5.43 | AA |
| NEXT rail `#DC6803` on white / on canvas | 3.49 / 3.22 | ≥3 non-text (the rail is decorative anyway) |
| LATER fg `#475467` on LATER bg `#F2F4F7` | 6.98 | AA |
| LATER icon `#667085` on white | 4.97 | AA |
| DONE fg `#067647` on DONE bg `#ECFDF3` | 5.40 | AA |
| DONE icon `#079455` on white | 3.91 | ≥3 non-text (always paired with the word "Done") |
| Primary text on NOW bg | 15.83 | AAA |
| Secondary text `#57554F` on NOW bg / NEXT bg | 6.86 / 7.14 | AA |
| Load-bar over-capacity `#D92D20` on track `#E8E8E4` | 3.93 | ≥3 non-text |
| Load-bar normal `#475467` on track | 6.26 | ≥3 non-text |

**Rule:** tier *borders* (`#FDA29B`, `#FEC84B`) are decorative at 2.3–2.8:1. They are never the only thing carrying meaning. The icon and the label do that.

### 3.4 Typography

**Family:** `Inter` (Google Fonts), weights 400/500/600, with `font-feature-settings: "cv11" 1, "ss01" 1;`. **Numbers:** every time, count, ID and percentage uses `font-variant-numeric: tabular-nums;` (make a class `.tnum`). Deck display type uses `Inter Tight` 600.

Import: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@600&display=swap`

**Desktop app scale:**

| Role | Size / line-height | Weight | Tracking | Notes |
|---|---|---|---|---|
| `page-title` | 24 / 32 | 600 | -0.015em | "Good morning, Dana" |
| `hero-title` | 22 / 30 | 600 | -0.01em | hero card task sentence |
| `stat-number` | 28 / 32 | 600 | -0.02em | tnum; risk strip |
| `section` | 15 / 22 | 600 | -0.005em | tier section header label |
| `row-title` | 15 / 22 | 500 | 0 | row sentence |
| `body` | 14 / 20 | 400 | 0 | drawer text, reason line in hero |
| `meta` | 13 / 18 | 400 | 0 | reason line in rows, timestamps |
| `label` | 13 / 18 | 500 | 0 | buttons (md), chips |
| `eyebrow` | 12 / 16 | 600 | +0.06em | UPPERCASE; tier eyebrow, "DO THIS NOW" |
| `micro` | 12 / 16 | 500 | 0 | time pill, source tag |
| `kbd` | 11 / 16 | 500 | 0 | keyboard hint glyphs |

**Handheld (390) scale:** every role gets +2px size and +2–4px line-height: row-title 17/24, body 16/24, meta 14/20, eyebrow 12/16 (unchanged), micro 13/18, hero-title 22/28, page-title 22/28. **Minimum text on handheld is 13px.** Nothing smaller.

### 3.5 Spacing (4px base)

`--s-0: 0` · `--s-1: 2px` · `--s-2: 4px` · `--s-3: 8px` · `--s-4: 12px` · `--s-5: 16px` · `--s-6: 20px` · `--s-7: 24px` · `--s-8: 32px` · `--s-9: 40px` · `--s-10: 48px` · `--s-11: 64px` · `--s-12: 80px`

- Space between major blocks (hero → queue → section) is 32px.
- Between a section header and its first row: 8px.
- Rows are separated by 1px `--n-100` dividers inside one white container, not by gaps.

### 3.6 Radius

`--r-xs: 4px` (kbd, source tag, time pill) · `--r-sm: 6px` (buttons, inputs, chips) · `--r-md: 8px` (row hover highlight, popovers, menu items) · `--r-lg: 12px` (cards, list container, drawer inner, toast) · `--r-xl: 16px` (hero card) · `--r-full: 999px` (avatars, status dots, segmented control, load bar)

### 3.7 Elevation

| Token | Value | Use |
|---|---|---|
| `--e-0` | `none` | rows |
| `--e-1` | `0 1px 2px rgba(28,27,25,0.05), 0 0 0 1px rgba(28,27,25,0.06)` | list container, stat tiles, worker cards |
| `--e-2` | `0 1px 2px rgba(28,27,25,0.06), 0 6px 16px -4px rgba(28,27,25,0.10)` | hero card |
| `--e-3` | `0 2px 6px rgba(28,27,25,0.08), 0 12px 28px -6px rgba(28,27,25,0.16)` | popovers, menus, toast |
| `--e-4` | `0 24px 48px -12px rgba(28,27,25,0.24)` | drawer, command palette |
| Scrim | `rgba(28,27,25,0.32)` | behind the palette only. **The drawer has no scrim** (the list stays usable) |

### 3.8 Borders

- Default: `1px solid #DAD9D4`.
- Divider: `1px solid #E8E8E4`.
- Input: `1px solid #C9C7C0`, hover `#8F8D85`, focus uses the focus ring.
- Tier rail: `box-shadow: inset 3px 0 0 <solid>` on rows (Now and Next only) and `inset 4px 0 0 #D92D20` on the hero. Using an inset shadow avoids layout shift.

### 3.9 Motion

| Token | Duration | Easing | Use |
|---|---|---|---|
| `--m-press` | 80ms | `cubic-bezier(0.2, 0, 0, 1)` | button press scale 0.98 |
| `--m-hover` | 120ms | `cubic-bezier(0.2, 0, 0, 1)` | bg/border color changes, row actions reveal |
| `--m-enter-sm` | 180ms | `cubic-bezier(0.22, 1, 0.36, 1)` | popover, toast, chip appear (from 4px below + opacity 0) |
| `--m-exit-sm` | 140ms | `cubic-bezier(0.4, 0, 1, 1)` | popover/toast exit |
| `--m-list` | 240ms | `cubic-bezier(0.22, 1, 0.36, 1)` | row insert/remove height, reorder (FLIP) |
| `--m-hero` | 320ms | `cubic-bezier(0.22, 1, 0.36, 1)` | next item promoted into the hero; drawer slide |
| `--m-check` | 360ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | done check pop (the only overshoot curve in the system) |
| `--m-flash` | 1600ms | `linear` | new urgent row tint fade `#FEF3F2 → #FFFFFF` |
| `--stagger` | 20ms per row, max 5 rows | n/a | list shift after completion |

**Reduced motion** (`@media (prefers-reduced-motion: reduce)`): all translate/scale become 0. Every enter/exit becomes an **opacity-only 120ms linear** crossfade. The check pop becomes an instant swap. FLIP reorder and height animation become instant. The flash becomes a static tint for 1600ms that then drops to white with no fade. The skeleton pulse stops (static `#F1F1EE`). The live timer still ticks (it's information, not decoration).

### 3.10 Iconography

**Lucide** (`lucide-react`). Stroke width 2 at 16px and 1.75 at 20/24px. Sizes are 16px in rows/chips, 20px for the hero eyebrow and nav, and 24px on handheld.

| Meaning | Lucide icon |
|---|---|
| Tier NOW | `octagon-alert` (stop-sign shape) |
| Tier NEXT | `triangle-alert` (warning triangle) |
| Tier LATER | `circle-dashed` (open, low-energy circle) |
| DONE | `circle-check` |
| FYI | `info` |
| Snoozed | `alarm-clock` |
| Why / rationale | `list-ordered` (the "why is this ranked" link) |
| Time / overdue | `clock` |
| Mark done | `check` |
| Snooze | `alarm-clock-plus` |
| Hand off | `arrow-right-left` |
| Ask for help | `hand` (raised hand) |
| Open detail | `panel-right-open` |
| Reassign (manager) | `user-round-plus` |
| Source ORDER | `package` |
| Source NOTIFICATION (tag text `NOTIF`) | `bell` |
| Source COMMS | `message-square` |
| Nav: Home / Queue | `house` / `list-todo`, Team `users`, Orders `package`, Reports `chart-column`, Settings `settings` |
| Worker status: Active | 8px solid dot `#079455` + word |
| Blocked | `octagon-alert` `#D92D20` |
| Needs help | `hand` `#B54708` |
| Idle | `circle-pause` `#6B6961` |
| On break | `coffee` `#6B6961` |
| Offline | 8px hollow dot, 1.5px `#8F8D85` border |

### 3.11 Density

- Desktop default "Comfortable": priority row is 60px (12px vertical padding, two text lines).
- Compact toggle (manager only): 44px single line, reason line hidden, reason available on hover and in the drawer.
- Handheld: row 72px min, targets 48×48px min. Glove use and moving users, so no hit target under 48px anywhere on 390, including icon buttons.

### 3.12 Focus ring

```
:focus-visible { outline: none; box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #4F46E5; }
```
Rows get the ring inset instead (`box-shadow: inset 0 0 0 2px #4F46E5`) so the ring isn't clipped by the list container. Keyboard j/k selection uses the **selected** state (below), not the focus ring, unless the row also has DOM focus.

### 3.13 Dark mode

**v1 ships light only.** Fulfillment floors are brightly lit and handhelds are used in glare, where dark UIs lose contrast. Dark also dilutes the "calm paper" direction. The token names are theme-agnostic, so a dark theme can be added later: canvas `#141413`, surface `#1C1B19`, text `#EDEDEA` (15.71:1), NOW fg `#FDA29B` (9.5:1). It is **not** in scope for the prototype.

---

## 4. Priority encoding (redundant: shape + color + label + position + mass)

Every tier is identifiable in pure grayscale. Test: set the prototype to `filter: grayscale(1)` and you should still be able to rank every item.

| Channel | NOW | NEXT | LATER | DONE |
|---|---|---|---|---|
| **Position** | top; item #1 is lifted into the hero | directly below Now | below Next, collapsed after 5 rows ("Show 7 more") | leaves the queue; shows only as a count in the rail and in the "Done today" list |
| **Mass** | #1 is the hero card (≈200px tall). Other Now rows are 60px with a tint | 60px row, white | 60px row, white, secondary text weight | n/a |
| **Shape (icon)** | octagon `octagon-alert` | triangle `triangle-alert` | dashed circle `circle-dashed` | check circle `circle-check` |
| **Color** | icon `#D92D20`, row bg `#FEF3F2`, rail 3px `#D92D20` | icon `#B54708`, bg white, rail 3px `#DC6803` | icon `#667085`, bg white, no rail | icon `#079455` |
| **Label** | section header "NOW · 2" and the hero eyebrow "DO THIS NOW" | section header "NEXT · 3" | section header "LATER TODAY · 7" | "Done" word in toast/list |
| **Time pill** | solid red: `#D92D20` bg, white text, "Overdue 2:04" (live) or "Due in 12m" | tint: `#FFFAEB` bg, `#93370D` text, "Due 13:40 · in 1h 20m" | neutral: `#F1F1EE` bg, `#57554F` text, "By 17:00" | n/a |
| **Title weight** | 500 `#1C1B19` | 500 `#1C1B19` | 400 `#1C1B19` | strikethrough never used; items leave |

**Only the NOW tier gets a background tint.** Next and Later are white. That keeps color scarce, which is the Programa lesson.

---

## 5. Component inventory (anatomy + states)

Conventions: all measurements in px. "fg/bg/border" refer to tokens above.

### 5.1 App shell and nav

- **Left nav:** width 248, bg `#F6F6F4` (same as canvas; no divider, the content area is what feels like a surface). Padding 12.
  - Top: wordmark row, 56 tall, 8px left inset.
  - Role switch (5.2) below the wordmark, full width, margin-bottom 16.
  - Nav items: 36 tall, radius 8, padding 0 10, icon 20 `#57554F` + label 14/20 500 `#2E2D2A`, gap 10. Count badge right-aligned: micro tnum `#57554F`. The Home count badge uses NOW style when Now > 0 (`#D92D20` bg, white text, 18 tall, radius full, padding 0 6).
  - States: hover bg `#F1F1EE`. Active: bg `#FFFFFF` + `--e-1`, label 600 `#1C1B19`, icon `#1C1B19`. Focus: ring.
  - Items: **Home** (worker: "My queue"; manager: "Team"), Orders, Notifications, Team comms, Reports, Settings. Divider (1px `#E8E8E4`, margin 12 0), then "Shortcuts ?" at the bottom.
  - Bottom: user chip (avatar 28, name 13/18 500, role micro `#6B6961`) and a shift clock "Shift 06:00–14:30 · 4h 12m left" in micro tnum.
- **Top bar** (inside content): 56 tall, sticky, bg `#F6F6F4` at 92% opacity with `backdrop-filter: blur(8px)`. Left: page title. Right: search trigger (240×32, radius 6, bg `#FFFFFF`, border `#DAD9D4`, placeholder "Search or jump to…", kbd `⌘K` at right), then a notifications icon button 32×32, then the avatar.

### 5.2 Role switch (prototype-level; in production this is permission-based)

- A segmented control with 2 segments, "Worker" / "Manager". Height 32, track `#F1F1EE`, radius full, padding 2.
- The segment thumb is `#FFFFFF`, radius full, `--e-1`. Label 13/18 500 `#1C1B19` when active, `#6B6961` when inactive.
- Thumb slide 240ms `--m-list` easing. Under reduced motion, it switches instantly.
- Keyboard: arrow keys move between segments. Role is `radiogroup`.

### 5.3 "Do this now" hero card

**Anatomy (desktop, 744 wide):**
```
┌──────────────────────────────────────────────────────────────────────┐ radius 16, bg #FFFFFF,
│▌ [octagon 20] DO THIS NOW · 1 OF 6                  [Overdue 2:04:17]│ border 1px #FDA29B,
│▌                                                                     │ inset rail 4px #D92D20,
│▌ Resolve payment mismatch on Order #4821                             │ shadow --e-2, padding 24
│▌                                                                     │
│▌ [list-ordered 16] Why first: blocks 3 outbound orders · carrier    │
│▌  cutoff 14:30 · overdue 2h                        [See ranking ›]   │
│▌                                                                     │
│▌ [package] ORDER · Aisle 14-C · from Billing                         │
│▌ ─────────────────────────────────────────────────────────────────── │ divider #E8E8E4, margin 20 0
│▌ [ ✓ Resolve payment  E ]  [⇄ Hand off H] [✋ Ask for help A]  [⏰ S] │
└──────────────────────────────────────────────────────────────────────┘
```
- Eyebrow row: icon 20 `#D92D20`, then eyebrow text `#B42318` "DO THIS NOW", a `·` separator, and "1 OF 6" in `#6B6961` tnum. The time pill (5.7, NOW variant, **large**: 28 tall, 13/18 600 tnum) is right-aligned.
- Title: hero-title `#1C1B19`, margin-top 12, max 2 lines, then ellipsis.
- Why line (5.6, hero variant): body 14/20, `#57554F`, margin-top 8. "Why first:" is 600 `#1C1B19`. Reasons are joined by ` · `. The "See ranking ›" text button (13/18 500 `#4338CA`) opens the drawer's "Why this rank" section.
- Context line: meta `#6B6961`, source tag (5.8) first, margin-top 12.
- Action row: primary button **lg** (40 tall) with an in-button kbd hint, secondary buttons md (36 tall), and a ghost icon button for snooze (36×36) with tooltip "Snooze (S)". Gap 8. The primary label is a verb specific to the task ("Resolve payment", "Pick wave 14", "Reply to Maya"), never "Review".
- **Placement:** always the first thing in the main column. No banners above it (the one exception is 5.3b).
- **States:**
  - Default (NOW item) as above.
  - **NEXT variant** (when there's no NOW item): rail `#DC6803`, border `#FEC84B`, eyebrow `triangle-alert` `#B54708` "DO THIS NEXT", NEXT time pill.
  - **LATER variant:** no rail, border `#DAD9D4`, eyebrow `circle-dashed` `#667085` "UP NEXT".
  - **Help requested:** an amber chip under the eyebrow reading "[hand] Help requested from Lead · 3m ago".
  - **Completing:** see §7.1.
  - **Loading:** hero skeleton (5.19).
  - **Empty:** replaced by All-clear (5.13).
- **5.3b New-urgent notice (inside the hero, top):** a 40-tall band that pushes the content down, bg `#FEF3F2`, border-bottom 1px `#FDA29B`, radius 16 16 0 0, padding 0 24. Content: `octagon-alert` 16 + "New: Order #4903 ranked above this. Carrier cutoff in 9m." (13/18 500 `#B42318`), with right-aligned buttons "Switch (N)" (secondary sm) and "Stay" (ghost sm).

### 5.4 Priority row

**Anatomy (744 wide, 60 tall):**
```
│▌[icon16] Order #4830 — address unverified, label on hold      [Due in 38m] [package ORDER] │
│▌         blocking pick · 2nd overdue in zone                                                │
```
- Container padding `12px 16px 12px 16px`. Grid: `24px (icon) | 1fr (text) | auto (time pill) | 96px (source tag, right-aligned) | 0→auto (actions on hover)`. Column gap 12.
- Icon: tier icon 16, vertically aligned to the first text line (top offset 3).
- Text: line 1 is row-title, 1 line with ellipsis. Line 2 is the reason line (5.6 row variant): meta `#6B6961`, 1 line with ellipsis, max ≈6 words.
- Right: time pill (5.7), then the source tag (5.8).
- Row rail: Now `inset 3px 0 0 #D92D20` + bg `#FEF3F2`. Next `inset 3px 0 0 #DC6803`. Later has none.
- **States:**
  - **Default** as above.
  - **Hover:** bg `#FAFAF9` (Now rows go to `#FDECEA`). The source tag hides and in its place three icon buttons appear (32×32, radius 6, icon 16 `#57554F`, hover bg `#F1F1EE`): `check` (Done, E), `alarm-clock-plus` (Snooze, S), `arrow-right-left` (Hand off, H). Fade in 120ms. Tooltips show label + kbd after a 400ms delay.
  - **Focus (DOM focus):** inset ring 2px `#4F46E5`.
  - **Selected (j/k cursor or drawer open):** bg `#EEF2FF`, plus a 2px left bar `#4338CA` that *replaces* the tier rail while selected. The tier icon keeps its color. Quick actions stay visible.
  - **Done (transient, 600ms):** icon morphs to `circle-check` `#079455`, title color `#6B6961`, then the row collapses (height 60→0, opacity 1→0, 240ms) and a toast appears.
  - **Snoozed:** moves into a collapsed "Snoozed · 2" group at the end of the queue. The row is white, the icon becomes `alarm-clock` `#6B6961`, the time pill becomes neutral "Back 14:20", and title weight is 400. Text is **not** faded (keep contrast).
  - **Handed off (transient):** same exit as Done, but the toast reads "Handed to Maya R."
  - **Help requested:** an amber chip "[hand] Help asked" (micro, `#FFFAEB`/`#93370D`, radius 4, 20 tall) is appended after the title.
  - **New (just arrived):** see §7.7.
- Click anywhere on the row opens the drawer. Checkbox-free (bulk actions are out of scope for workers).

### 5.5 Tier section header with count

- 32 tall, padding 0 16, bg `#FAFAF9`, border-bottom 1px `#E8E8E4`. It sticks under the top bar (sticky top 56) while its rows scroll.
- Content: tier icon 16 (tier solid color), then 8px, then the label in eyebrow style (12/16 600 +0.06em uppercase) in the tier fg color (NOW `#B42318`, NEXT `#93370D`, LATER `#475467`, SNOOZED `#57554F`), then 8px, then the count in 12/16 600 tnum `#6B6961`.
- Right side (optional): a meta explainer `#6B6961`, e.g. NOW: "Blocking or overdue", NEXT: "Due this shift", LATER: "No risk yet". This is how the ranking **rule** is explained once per tier instead of on every row.
- Collapse chevron (`chevron-down` 16) on LATER and SNOOZED only. **NOW and NEXT cannot be collapsed.**

### 5.6 Why-chip / reason line

- **Row variant:** plain text line, meta 13/18 `#6B6961`, ≤6 words, built from a **closed vocabulary** of cause phrases, e.g.: `blocking pick`, `blocking 3 orders`, `carrier cutoff 14:30`, `customer escalated`, `SLA breach in 20m`, `short-picked`, `mentioned you`, `lead asked`. Join two with ` · `, max two.
- **Hero variant:** "Why first:" plus up to 3 phrases (body 14/20).
- **Drawer variant "Why this rank":** a numbered list of factors, each with an icon and a weight bar (see 5.11).
- No chips or pills for reasons in rows. Plain text keeps the row calm.

### 5.7 Time pill

- Height 22 (row) / 28 (hero). Radius 4. Padding 0 8. micro 12/16 500 tnum (hero 13/18 600). Leading `clock` icon 12 (hero 14), gap 4.
- **Overdue** (NOW): bg `#D92D20`, text `#FFFFFF`. Copy "Overdue 2:04" (h:mm), live ticking every 60s in rows and every 1s in the hero ("Overdue 2:04:17").
- **Soon** (<2h): bg `#FFFAEB`, text `#93370D`, border 1px `#FEC84B`. Copy "Due in 38m" / "Due 13:40".
- **Later:** bg `#F1F1EE`, text `#57554F`. Copy "By 17:00".
- **Snoozed:** bg `#F1F1EE`, text `#57554F`, icon `alarm-clock`. Copy "Back 14:20".
- Copy rules: under 60m "in 38m", under 12h "13:40", "Overdue h:mm". Use 24h clock (ops floors).

### 5.8 Source tag (secondary)

- Height 20, radius 4, padding 0 6, bg transparent, border 1px `#DAD9D4`. Icon 12 `#6B6961` + text micro 12/16 500 `#57554F` uppercase with +0.02em tracking. Exactly three strings, used everywhere: `ORDER`, `NOTIF` (NOTIFICATION, shortened to fit a 96px column; full word in tooltip and filter), `COMMS`.
- It is **deliberately the quietest element in the row.** Source is metadata, not priority. The old design gave it a chip as loud as the priority.

### 5.9 Buttons

| Variant | Height (sm/md/lg) | Bg | Text | Border | Hover | Pressed | Disabled |
|---|---|---|---|---|---|---|---|
| Primary (ink) | 28/36/40 (handheld 48) | `#1C1B19` | `#FFFFFF` 13/18 500 (lg 14/20 600) | none | `#2E2D2A` | scale .98 80ms | bg `#DAD9D4`, text `#8F8D85` |
| Secondary | same | `#FFFFFF` | `#1C1B19` | 1px `#DAD9D4` | bg `#FAFAF9`, border `#C9C7C0` | bg `#F1F1EE` | text `#8F8D85` |
| Ghost | same | transparent | `#57554F` | none | bg `#F1F1EE`, text `#1C1B19` | bg `#E8E8E4` | text `#8F8D85` |
| Danger (confirm-less; used in manager "Remove") | same | `#FFFFFF` | `#B42318` | 1px `#FDA29B` | bg `#FEF3F2` | n/a | n/a |
| Success-transient | same | `#067647` | `#FFFFFF` | none | n/a | n/a | n/a |

Padding: sm 0 10, md 0 14, lg 0 16. Radius 6. Icon 16 with gap 6. **In-button kbd hint:** a 18×18 box, radius 4, bg `rgba(255,255,255,0.14)` (on ink) or `#F1F1EE` (on white), 11/16 500, margin-left 8.

### 5.10 Keyboard shortcut hint (kbd)

min-width 18, height 18, padding 0 4, radius 4, bg `#F1F1EE`, border 1px `#DAD9D4`, border-bottom 2px `#DAD9D4`, text 11/16 500 `#57554F` (6.59:1). Shown in: buttons, tooltips, the palette footer, the queue footer strip ("J K move · ↵ open · E done · S snooze · H hand off · ? all shortcuts"), 32 tall, centered, meta `#6B6961`. Hidden on touch devices (`@media (hover: none)`).

### 5.11 Detail side panel (drawer)

- Right side, width 480 (desktop), full height below the top bar, bg `#FFFFFF`, border-left 1px `#DAD9D4`, `--e-4`. Slide in from x+24 with opacity 0→1 over 320ms `--m-hero`, out in 140ms.
- **No scrim**, so the list remains visible and the selected row stays highlighted. At ≤1280 width the drawer overlays the right rail. At 1440 it overlays the rail (4 cols) and slightly overlaps the queue.
- **Anatomy:**
  1. Header, 56 tall, padding 0 20: tier icon + tier label in eyebrow style (tier fg), then flex space, then prev/next icon buttons (`chevron-up`/`chevron-down`, K/J) and close (`x`, Esc).
  2. Title: 20/28 600, padding 0 20, margin-top 4.
  3. Time pill (large) + source tag, padding 12 20.
  4. **"Why this rank"** block: bg `#FAFAF9`, radius 12, margin 16 20, padding 16. Heading is section 15/22 600 "Why this is #1". Then up to 4 factor rows, each 28 tall: icon 16, label body 14/20 `#1C1B19`, and a right-aligned 64×4 bar (track `#E8E8E4`, fill `#1C1B19`) showing relative weight. Example: `package` "Blocks 3 outbound orders" (bar 100%), `clock` "Overdue by 2h" (80%), `truck` "Carrier cutoff 14:30" (60%). Footer micro `#6B6961`: "Ranked by: blocking impact → time to deadline → customer tier. Learn how ranking works ›".
  5. Details: property list, 2 columns (label 13/18 `#6B6961` 120 wide, value 14/20 `#1C1B19`). Order, SKU, Location, Customer, Created.
  6. Activity: timeline, avatar 20 + meta text, 1px `#E8E8E4` connector.
  7. Sticky footer, 72 tall, border-top 1px `#E8E8E4`, padding 16 20: primary lg (task verb), secondary "Hand off", ghost "Ask for help", ghost icon "Snooze".

### 5.12 Toast with undo

- **Position:** desktop bottom-left, 24 from the left edge of the content area (x = 248 + 24) and 24 from the bottom. Handheld: bottom center, 12 above the sticky action bar, width 358.
- 48 tall, min-width 320, max-width 480, radius 12, bg `#1C1B19`, `--e-3`, padding 0 8 0 16.
- Content: `circle-check` 16 `#4ADE80` (graphic on ink, 9.88:1), then body 14/20 `#F6F6F4` "Order #4821 resolved. 4 done today.", then the **Undo** text button (14/20 600 `#A5B4FC`, 32 tall, padding 0 8) with kbd "Z" (on-ink style), then close `x` 16 `#8F8D85` in a 32×32 target.
- A progress hairline sits at the bottom inside the radius: 2px, `#57554F`, shrinking from 100%→0 over the timeout (linear). It pauses on hover/focus.
- **Timeout:** 6000ms (8000ms for hand-off, since it affects someone else). Max 1 toast visible. A new one replaces the old with a crossfade.
- Enter: from y+8, opacity 0 → y 0, opacity 1 in 180ms `--m-enter-sm`. Exit 140ms.
- `role="status"` `aria-live="polite"`.

### 5.13 All-clear empty state

- Replaces the hero *and* the queue. Centered in the 8-col main column, padding 80 0.
- A 48×48 circle, bg `#ECFDF3`, containing `circle-check` 24 `#079455`.
- Headline 24/32 600 `#1C1B19`: "You're clear."
- Sub 14/20 `#57554F`: "Nothing needs you right now. New work will appear here, ranked."
- Stat line meta tnum `#6B6961`: "11 done today · last new item 14 min ago".
- Two ghost buttons: "Help a teammate" (opens the team's Now items that are open to help) and "View done today".
- Kbd hint pill at the bottom: "Press G then T to see the team queue."
- No confetti and no illustrations.

### 5.14 Worker card (manager view)

**Anatomy (360 wide, ~148 tall):**
```
┌───────────────────────────────────────────────┐ radius 12, bg #FFFFFF, --e-1, padding 16
│ (AV)● Maya Rodriguez          [octagon Blocked 14m]│ ← status chip right
│       Picker · Zone C                               │
│ ─────────────────────────────────────────────────── │
│ NOW  Short-pick on Order #4871 · 14m                │ ← current task line
│ Queue  ▇▇▇▇▇▇▇▇▇▇▇▇▇|▨▨▨  9 items · 112%   [!]     │ ← load bar
│ 1 NOW · 3 NEXT · 5 LATER            Done 18        │
└───────────────────────────────────────────────┘
```
- Avatar 32 (initials 12/16 600 on `#E8E8E4`, or a photo) with a status dot 10px at bottom-right, 2px white ring. Dot colors: Active `#079455`, Blocked `#D92D20`, Needs help `#DC6803`, Idle/Break `#8F8D85`, Offline hollow.
- Name 15/22 600. Role · zone meta `#6B6961`.
- **Status chip** (right-aligned): 22 tall, radius 4, icon 12 + micro 500 text + elapsed tnum. Blocked uses NOW colors (bg `#FEF3F2`, fg `#B42318`, border `#FDA29B`). Needs help uses NEXT colors. Active: no bg, dot + "Active" `#57554F`. Idle: `circle-pause` + "Idle 9m" `#57554F`, bg `#F1F1EE`. Break: `coffee` + "Break · back 11:15". Offline: "Off shift".
- **Current task line:** eyebrow tier label (in tier fg), 8px, then body 14/20 `#1C1B19` task sentence (1 line with ellipsis), `·`, elapsed tnum `#6B6961`.
- **Load bar:** label "Queue" meta `#6B6961` 48 wide, then the bar (flex, 6 tall, radius full, track `#E8E8E4`).
  - Fill `#475467` up to 80%, `#B54708` for 80–100%, and anything past 100% is a hatched segment: `repeating-linear-gradient(135deg, #D92D20 0 3px, #FEF3F2 3px 6px)`.
  - A 100% tick: 1px × 10 `#1C1B19` at the capacity point. The bar scale is 0–150%, so the tick sits at 66.7%.
  - Then the text "9 items · 112%" (micro tnum `#1C1B19`). When over 100%, `triangle-alert` 14 `#B54708` follows. **The text always carries the value.**
- Footer: tier counts in micro tnum ("1 NOW" in `#B42318`, "3 NEXT" in `#93370D`, "5 LATER" in `#475467`) and right-aligned "Done 18" `#067647`.
- **States:**
  - Hover: border `#C9C7C0`, and the action row reveals "Reassign" and "Message" as ghost sm buttons, replacing the footer.
  - Selected: border 2px `#4338CA`, which opens the worker drawer (their queue, read-only plus reassign).
  - Blocked/needs-help cards: bg `#FFFFFF` with a 3px left rail in the status color. **No full-card tint.**
- Sort order: Blocked → Needs help → Over capacity → Idle → Active → Break → Offline.

### 5.15 Team risk summary strip

- 4 tiles, each 264 wide × 104 tall, radius 12, bg `#FFFFFF`, `--e-1`, padding 16 20. The whole tile is a button that filters the view.
- Tile: label eyebrow `#6B6961` (e.g. "AT RISK"), stat-number 28/32 600 tnum, and a sub-line meta.
  1. **AT RISK:** count of team Now items. Number in `#B42318` when >0, with `octagon-alert` 16 before it. Sub: "3 overdue · 2 due <30m".
  2. **BLOCKED / NEEDS HELP:** "2 / 1", number `#1C1B19`. Sub shows avatars (20px, stacked -6 overlap) of those workers.
  3. **UNASSIGNED:** "4". Sub: "Oldest 22m". The tile has an inline "Assign ›" ghost link.
  4. **SHIFT PACE:** "64%" of planned units, followed by a pace chip "On pace" (DONE colors) or "Behind 6%" (NEXT colors). Under it is a 6px progress bar with a 1px `#D92D20` "now" tick (the incident.io "now line").
- Freshness stamp right-aligned above the strip: meta `#6B6961` "Live · updated 11:08:42", with a 6px `#079455` dot that pulses (opacity 1→0.4, 2s) and is static under reduced motion.
- Active filter tile: border 2px `#1C1B19`.

### 5.16 Reassign popover

- Anchored to the trigger, 320 wide, max 400 tall, radius 8, bg `#FFFFFF`, border 1px `#DAD9D4`, `--e-3`. Enter 180ms from y-4.
- Header: task title micro `#6B6961`, 1 line.
- Search input: 36 tall, placeholder "Find teammate…", autofocused.
- The "Suggested" group eyebrow is followed by the top 3 teammates, ranked by **same zone + lowest load + not blocked**.
- Row, 44 tall: avatar 24 + status dot, name 14/20 500, zone meta, and right-aligned mini load bar (48×4) plus "4 items" micro tnum. Over-capacity people show the hatched overflow and "112%" in `#B42318`, and they sort lower but are not hidden.
- Then an "Everyone" group follows.
- Keyboard: ↑↓ + Enter. Row hover and selection: bg `#F1F1EE`.
- Optional note field (collapsed "Add note" ghost link).
- Commit: toast "Reassigned to Maya R. · Undo". The source worker card's load bar animates down and the target's up (width transition 240ms).

### 5.17 Filter / segmented control

- Same visual as the role switch (5.2), height 32. Manager status filter: "All 16 · Needs attention 4 · Active 9 · Break 2 · Off 1". Counts in tnum `#6B6961`, and active-segment counts in `#1C1B19`.
- Worker queue filter (top-right of the queue): "All · Orders · Notifications · Comms". This filters by source without changing the rank.

### 5.18 Command palette (⌘K)

- 640 wide, top offset 120, radius 12, `--e-4`, with the scrim behind.
- Input: 52 tall, 16/24.
- Groups: "Actions on selected", "Go to", "Teammates".
- Row: 40 tall, and the selected row gets bg `#F1F1EE` plus a 2px `#4338CA` left bar (the Juicebox pattern).
- Footer: 36 tall, bg `#FAFAF9`, kbd hints "↑↓ navigate · ↵ select · esc close".

### 5.19 Skeleton loading

- Blocks bg `#F1F1EE`, radius 4 (text) / 16 (hero shell). Pulse: opacity 1 → 0.55 → 1 over 1400ms `ease-in-out`, infinite. Reduced motion: static.
- Hero skeleton: card shell with the real border, an eyebrow bar 120×12, a title bar 70%×22, a second title bar 45%×22, a why bar 60%×14, and button blocks 160×40 and 110×36.
- Row skeleton: icon 16×16 circle, bar 55%×14, bar 35%×12, pill 72×22.
- Show 1 hero + 5 rows. Never show a spinner for the queue. **Show the skeleton only if loading takes >300ms** (avoid flash).

---

## 6. Layouts

### 6.1 Desktop grid (1440 wide), shared

- Left nav **248**. Content area 1192. Content padding **32** left and right, giving an inner width of **1128**.
- **12 columns × 72px, 11 gutters × 24px** (12×72 + 11×24 = 864 + 264 = **1128** ✓).
- The top bar is 56 tall. Content starts at y=56+24.
- At widths above 1440, the inner width is capped at 1128 and centered in the content area.

### 6.2 Worker home (1440)

- Main column: **cols 1–8 = 744px** (8×72 + 7×24). Right rail: **cols 9–12 = 360px**. 744 + 24 + 360 = 1128 ✓.

```
┌────────┬──────────────────────────────────────────────────────────────────────────────┐
│ ▪ Shift│  Good morning, Dana                                 [Search… ⌘K]  🔔  (DA)  │ 56
│[Worker│Mgr]──────────────────────────────────────────────────────────────────────────┤
│        │  Tue 22 Sep · Shift 06:00–14:30 · 6 need you · 2 now     (meta, 13/18)       │
│ ⌂ My   │ ┌──────────────── HERO (744 × ~208) ────────────────┐ ┌── RAIL 360 ───────┐ │
│  queue6│ │▌⬣ DO THIS NOW · 1 OF 6          [⏱ Overdue 2:04:17]│ │ MY SHIFT          │ │
│ 📦Orders│ │▌Resolve payment mismatch on Order #4821          │ │ ◔ 4 of 11 done    │ │
│ 🔔Notif │ │▌Why first: blocks 3 orders · cutoff 14:30 · 2h late│ │ ▇▇▇▇▇░░░░░ 36%    │ │
│ 💬Comms │ │▌📦 ORDER · Aisle 14-C             See ranking ›  │ │ 4h 12m left       │ │
│ 📊Report│ │▌[✓ Resolve payment E] [⇄ Hand off] [✋ Ask] [⏰] │ ├───────────────────┤ │
│ ⚙ Setng │ └────────────────────────────────────────────────────┘ │ TEAM UPDATES · 3  │ │
│        │                                         32px          │ (FYI, 3 lines max │ │
│        │ ┌─ list container radius 12, --e-1 ────────────────┐  │  each, meta size) │ │
│        │ │ ⬣ NOW · 1                    Blocking or overdue │  │ ─ Dock 4 closes   │ │
│        │ │▌⬣ Order #4830 — label on hold      [Due 12m] ORDER│  │   at 13:00        │ │
│        │ │   blocking pick                                   │  │ ─ New SOP: hazmat │ │
│        │ │ ▲ NEXT · 3                       Due this shift   │  ├───────────────────┤ │
│        │ │▌▲ Restock bin C-22                [Due 13:40] NOTF│  │ RECENT ACTIVITY   │ │
│        │ │   short-picked twice                              │  │ (5 items, meta,   │ │
│        │ │▌▲ Reply to Lead: wave 15 split    [in 1h 20m] COMM│  │  "View all ›")    │ │
│        │ │▌▲ Verify returns tote #88          [Due 14:00] ORD│  └───────────────────┘ │
│        │ │ ◌ LATER TODAY · 2             No risk yet    ⌄    │                        │
│        │ │ ◌ Cycle count aisle 9              [By 17:00] ORD │                        │
│        │ │ ◌ Read: holiday peak memo          [By EOD]  COMM │                        │
│        │ └───────────────────────────────────────────────────┘                        │
│        │  J K move · ↵ open · E done · S snooze · H hand off · ? all   (32, centered) │
│ (DA)Dana│  [toast bottom-left]                                                        │
└────────┴──────────────────────────────────────────────────────────────────────────────┘
```
- The hero item is **not repeated** in the list. The list's NOW count excludes the hero, and the header copy says "6 need you" in total.
- **The rail is FYI only.** Its cards are bg `#FFFFFF`, radius 12, `--e-1`, padding 16, gap 16. The rail header uses the FYI eyebrow style `#6B6961`. Nothing in the rail has a tier color. That is how "for reference, not action" is enforced visually.
- The "My shift" card has a progress ring 40px: 4px stroke, track `#E8E8E4`, fill `#1C1B19`. Text: "4 of 11 done" 15/22 600 tnum.

### 6.3 Manager team view (1440)

```
┌────────┬──────────────────────────────────────────────────────────────────────────────┐
│ ▪ Shift│  Team · Outbound B                      [Search… ⌘K]  🔔  (JL)              │
│[Wkr│Manager]  On shift now: 14 · Break 2 · Off 1          Live · updated 11:08:42 ●    │
│        │ ┌AT RISK──────┐┌BLOCKED/HELP─┐┌UNASSIGNED───┐┌SHIFT PACE───┐  (4 × 264, gap 24)│
│ ⌂ Team │ │⬣ 5          ││ 2 / 1       ││ 4   Assign ›││ 64% On pace │                  │
│        │ │3 overdue·2<30││(av)(av)(av) ││ Oldest 22m  ││▇▇▇▇▇▇|░░░░  │                  │
│        │ └─────────────┘└─────────────┘└─────────────┘└─────────────┘                  │
│        │  [All 16 | Needs attention 4 | Active 9 | Break 2 | Off 1]   [Cards|Compact]  │
│        │ ┌── WORKERS (cols 1–8 = 744: 2 cards × 360, gap 24) ──┐ ┌ AT-RISK WORK 360 ┐ │
│        │ │┌Maya R.  ⬣Blocked 14m┐ ┌Leo K.  ✋Needs help 3m┐   │ │ ⬣ NOW · 5        │ │
│        │ ││NOW Short-pick #4871 │ │NOW Damaged tote #12  │   │ │ #4903 cutoff 9m  │ │
│        │ ││Queue ▇▇▇▇▇|▨ 112% ! │ │Queue ▇▇▇▇░ 78%       │   │ │  Maya · [Reassign]│ │
│        │ │└─────────────────────┘ └──────────────────────┘   │ │ #4821 overdue 2h │ │
│        │ │┌Ana P.  ⏸ Idle 9m ──┐ ┌Sam T.  ● Active ─────┐   │ │  Dana · [Reassign]│ │
│        │ ││— No current task    │ │NEXT Restock C-22 8m  │   │ │ UNASSIGNED · 4   │ │
│        │ ││Queue ▇░░░ 20%       │ │Queue ▇▇▇▇▇ 64%       │   │ │ #4910 [Assign ▾] │ │
│        │ │└─────────────────────┘ └──────────────────────┘   │ └──────────────────┘ │
└────────┴──────────────────────────────────────────────────────────────────────────────┘
```
- The risk strip spans 12 columns (4 × 264 + 3 × 24 = 1128 ✓). It sits 24 below the header, and the filter row is 24 below the strip.
- Worker cards: 2 per row in cols 1–8 (2 × 360 + 24 = 744 ✓), row gap 24.
- "At-risk work" rail: cols 9–12 = 360. It is a list container with rows 56 tall and tier icons, and assignee avatar 20 + name + ghost sm "Reassign" on the right. "Unassigned" is its own section with an "Assign ▾" secondary sm that opens the Reassign popover.
- **Compact mode:** worker cards become 44-tall table rows spanning 8 cols. Columns: avatar+name 200 | status chip 140 | current task 1fr | load bar 120 | tier counts 96.
- Clicking a card opens a 480 drawer showing that worker's ranked queue (the same row component, read-only), with "Reassign" on each row's hover.

### 6.4 Handheld worker (390 × 844)

- Side padding **16**, inner width **358**. Single column. 4-col helper grid: 4 × 82 + 3 × 10 = 358 ✓ (used only for the action bar split).
- All targets are 48 tall min. Status bar safe area 47, bottom home indicator 34.

```
┌──────────────────────────────┐
│ ▪ Shift        6 need you  (DA)│ 56 top bar (bg #F6F6F4), title 17/24 600
├──────────────────────────────┤
│┌────────────────────────────┐│ HERO, radius 16, padding 20, rail 4px
││▌⬣ DO THIS NOW · 1 OF 6      ││ eyebrow 12/16
││▌[⏱ Overdue 2:04:17]        ││ time pill 28 tall on its own line
││▌Resolve payment mismatch   ││ hero-title 22/28 600
││▌on Order #4821             ││
││▌Why first: blocks 3 orders ││ body 16/24
││▌· cutoff 14:30             ││
││▌📦 ORDER · Aisle 14-C       ││ meta 14/20
│└────────────────────────────┘│
│ ⬣ NOW · 1                     │ 36 tall section header (sticky under top bar)
│▌⬣ Order #4830 — label hold   │ row 72 min, padding 14 16
│   blocking pick   [Due 12m]  │ time pill moves to line 2, right-aligned
│ ▲ NEXT · 3                    │
│▌▲ Restock bin C-22           │
│   short-picked   [Due 13:40] │
│ …                             │
├──────────────────────────────┤
│ [ ✓ Resolve payment        ] │ sticky action bar: primary 48 tall full width (358)
│ [⇄ Hand off] [✋ Help] [⏰]   │ second row: 3 buttons, 48 tall: 164 | 134 | 48 (gaps 6)
└──────────────────────────────┘   bar bg #FFFFFF, border-top 1px #E8E8E4, padding 12 16 + 34 safe
```
- The sticky action bar always acts on the **hero item** (Jobber/ClickUp pattern). Tapping a row opens a full-screen detail sheet (slides up 320ms), and the bar then acts on that item.
- **Handheld detail sheet:** the same sections as the desktop drawer (5.11), in the same order (header, title, time pill + source, "Why this is #1", details, activity), but full-bleed at 390. The header is 56 tall with a `chevron-down` close (48×48 target) on the left, the tier eyebrow in the center, and prev/next on the right. Horizontal padding is 16. The details grid collapses to stacked label-over-value pairs. The drawer's sticky footer is replaced by the 48-tall two-row action bar above. Swipe down past 120px also closes it. Reduced motion: opacity crossfade 120ms.
- Row swipe: swipe right past 96px reveals Done (bg `#067647`, `check` white), and swipe left past 96px reveals Snooze (bg `#57554F`). Swipe is **optional**, because the buttons always exist (glove users can't swipe reliably).
- Toast: bottom center, 12 above the action bar.
- No right rail on handheld. Team updates live behind a "Updates · 3" chip in the top bar (FYI styling).

---

## 7. Interaction spec

### 7.1 Finish top item → celebration-lite → next item slides up

Trigger: the hero primary button, the `E` key, or the handheld bar button.

| t (ms) | What happens |
|---|---|
| 0 | Button press: scale 0.98 over 80ms, release. |
| 0–160 | The button bg crossfades `#1C1B19 → #067647` and its label swaps to "✓ Done" (check icon draws via stroke-dashoffset 24→0, 160ms). |
| 120–480 | The hero eyebrow icon morphs to `circle-check` `#079455` with the `--m-check` pop (scale 0.6→1). The hero rail color crossfades to `#079455`. |
| 480–720 | Hero content exits: opacity 1→0, translateY 0→-8, 240ms `--m-exit-sm` curve. The card shell stays in place. |
| 480–660 | Toast enters bottom-left: "Order #4821 resolved. 5 done today. [Undo Z]". |
| 600–920 | **Promotion.** The first row in the list (the new #1) animates via FLIP from its row position into the hero shell (320ms `--m-hero`). Its content fades in inside the hero with the new tier styling. If its tier differs, the shell border and rail crossfade to the new tier colors over 320ms. |
| 600–840 | The remaining rows shift up 60px each (240ms `--m-list`, 20ms stagger, max 5 rows). Section counts update, and the number crossfades (120ms). |
| 600–840 | Rail "My shift": the ring segment animates (stroke-dashoffset, 240ms) and "4 of 11" becomes "5 of 11" (number crossfade). |
| 920 | Focus moves to the new hero's primary button (for screen reader and keyboard continuity). The live region announces: "Done. Next: Restock bin C-22, due 13:40." |

- **Celebration-lite** means only the green check pop, the ring increment and the toast's "5 done today." No confetti, no sound, no modal.
- **Milestones:** at 50% and 100% of the shift plan, the toast copy upgrades ("Halfway there: 6 of 12 done."). The visuals don't change.
- **Last item:** after the promotion step there is nothing to promote. The hero shell crossfades (320ms) into the All-clear state (5.13).
- **Undo (Z or toast button):** the reverse happens. The current hero content exits, the restored item re-enters the hero (320ms), and the list shifts down. The toast changes to "Restored" for 2000ms.
- **Reduced motion:** the button swaps to Done instantly, the hero content crossfades to the next item (120ms opacity), rows reposition instantly, and the ring updates instantly.

### 7.2 Snooze

- Trigger: `S`, the row hover icon, or the hero ghost button. A popover (240 wide) opens with options as 36-tall menu items:
  - NEXT/LATER: "15 min", "1 hour", "After my break", "Pick time…"
  - **NOW items:** only "10 min" and "Until I finish current task", **plus a required reason**: 3 radio chips "Waiting on someone", "Need equipment", "Other", then "Snooze" primary sm.
- A snoozed NOW item appears as a flag on the manager's view (the worker card footer shows "1 snoozed").
- Result: the row collapses (240ms) and reappears inside "Snoozed · n" at the bottom. Toast: "Snoozed until 14:20 · Undo."
- When the snooze expires, the item re-enters its tier with the arrival animation (7.7) and the reason line prefix "Back from snooze ·".

### 7.3 Hand off (worker)

- Trigger: `H` or the button. The reassign popover (5.16) opens with "Hand off to…" and suggested teammates. A note is optional. Commit gives toast "Handed to Maya R. · Undo" (8s) and the row exits like Done.
- The recipient gets it inserted into their queue per rank, with reason prefix "From Dana ·".

### 7.4 Ask for help

- Trigger: `A` or the button. A popover (280) opens: "Who?" radio "Shift lead (Jordan L.)" (default) / "Anyone nearby", a note textarea (3 lines, placeholder "What's blocking you?"), and a primary sm "Ask".
- Result: the item **stays in place** (the worker still owns it) and gets the "Help asked" chip. The hero shows "Help requested from Jordan · 0m" with the elapsed time counting.
- On the manager side, the worker's status becomes "Needs help", their card sorts to the top, the BLOCKED/HELP tile increments, and a non-modal toast appears for the manager: "Dana asked for help on #4821 · View".
- When the lead responds, the chip changes to "Jordan is coming" (DONE colors) for 60s.

### 7.5 Manager reassign

- From the "At-risk work" row "Reassign", a worker card's hover "Reassign", or a row inside the worker drawer, the popover (5.16) opens.
- Commit: the row's avatar crossfades to the new assignee, the load bars on both cards animate (240ms), and the toast says "Moved #4903 to Leo K. · Undo".
- Drag-and-drop is **not** in v1. It's hard to do accessibly, and the popover is faster.

### 7.6 Keyboard map (worker; manager noted)

| Key | Action |
|---|---|
| `J` / `↓` | select next row (the hero counts as index 0) |
| `K` / `↑` | select previous |
| `Enter` | open drawer for selected |
| `Esc` | close drawer / popover / palette; clear selection |
| `E` | mark selected done (defaults to the hero if nothing is selected) |
| `S` | snooze selected |
| `H` | hand off selected (manager: reassign) |
| `A` | ask for help on selected |
| `Z` | undo last action (while the toast is visible, plus 10s after) |
| `N` | switch to the new urgent item (when 5.3b is showing) |
| `/` | focus the queue filter |
| `⌘K` / `Ctrl K` | command palette |
| `G` then `H` / `G` then `T` | go to Home / Team |
| `?` | shortcut sheet (modal 480, two-column kbd list) |

Selection scrolls into view with `scroll-margin-top: 96px` (under the sticky header plus the tier header). Single-letter keys are ignored while focus is in a text input.

### 7.7 Real-time arrival of a new item

Principle: **never move the thing the user is about to click.**

- **Lower-rank arrivals (NEXT/LATER, or NOW that ranks below the current hero):** the row inserts at its rank position. Height 0→60 over 240ms, and the content fades in during the last 120ms. The section count crossfades. The row gets a 6px dot `#4338CA` before its title (meaning "new, unseen") that disappears after the row has been visible for 3s or once selected. No flash for NEXT/LATER. A NOW row additionally gets the `--m-flash` tint fade.
- **An arrival that outranks the current hero:**
  - If the user is **idle** (no pointer/keyboard input in the last 8s, no drawer or popover open), the current hero demotes into the list (FLIP 320ms), the new item enters the hero (320ms), and the tab title prefixes "(1) ".
  - If the user is **active**, the hero stays and the new-urgent notice band (5.3b) slides down inside the hero (height 0→40, 240ms). The user presses `N` / "Switch" or dismisses with "Stay". If there's no response in 60s and they go idle, auto-switch as above.
- **Batching:** if more than 3 items arrive within 5s, insert them in one pass and show one line under the header: "4 new items added · ranked in." (meta `#4338CA`, fades after 5s).
- **Live region:** `aria-live="polite"` for NOW arrivals: "New urgent item: Order #4903, carrier cutoff in 9 minutes." Nothing is announced for lower tiers (avoids chatter).
- **Sound/vibration:** off by default. A handheld setting can enable one short vibration (200ms) for NOW arrivals only.
- **Reduced motion:** insertions are instant, the notice band appears instantly, and the tint is static for 1.6s.

### 7.8 Reduced motion (summary)

All transform-based motion is removed. Remaining transitions are opacity-only at 120ms linear. Timers still tick. Skeleton pulse, freshness pulse and check pop are disabled. Implement it once with a global CSS rule plus a `useReducedMotion()` hook that the FLIP and list code checks.

---

## 8. Deck visual system (Keynote, 16:9, 1920 × 1080)

### Grid
- Margins: **140** left/right, **100** top/bottom. 12 columns × **100**, gutters **40** (12 × 100 + 11 × 40 = 1640 = 1920 − 280 ✓).
- Footer baseline at y = 1020: left "Shift · Foundey challenge", right the slide number, both 16/20 500 `#6B6961` tnum.

### Color
- Default slide bg `#F6F6F4`, text `#1C1B19`, secondary `#57554F`.
- Statement slides: bg `#1C1B19`, text `#F6F6F4`, secondary `#A8A69E` (7.06:1 on ink).
- Tier colors are used **only** when talking about priority, and never decoratively. Accent `#4338CA` is only for "this is our proposal" highlights.

### Type (Inter Tight for ≥44px, Inter for smaller)
| Role | Size/LH | Weight | Tracking |
|---|---|---|---|
| Display (cover) | 120/120 | 600 | -0.03em |
| Statement | 88/96 | 600 | -0.025em |
| Slide title | 64/72 | 600 | -0.02em |
| H2 / column head | 40/48 | 600 | -0.015em |
| Body | 30/42 | 400 | -0.005em |
| Caption / annotation | 22/30 | 500 | 0 |
| Eyebrow | 20/24 | 600 | +0.08em, uppercase, `#6B6961` |
| Big number | 160/160 | 600 | -0.04em, tnum |

### Layout patterns
1. **Title:** eyebrow at y=100 ("FOUNDEY · SENIOR PRODUCT DESIGNER CHALLENGE"). The Shift mark at 96px plus display "Shift" at cols 1–8, vertically centered. Sub (body `#57554F`): "Making the next right action obvious, for workers and managers." Name and date at the bottom-left above the footer.
2. **Statement:** dark bg, statement text at cols 1–10 aligned to the vertical center, max 3 lines. Optional eyebrow above it. Used for the problem reframe: "They already had a ranked list. Nobody could tell what was first."
3. **Before / After:** eyebrow + title at the top. Two panels at cols 1–6 and 7–12, each a screenshot in a frame (radius 16, `--e-2`, 1px `#DAD9D4`). Labels above each panel: "BEFORE" (eyebrow `#6B6961`) and "AFTER" (eyebrow `#4338CA`). Up to 3 numbered callouts per panel: 36px circles `#1C1B19` with a white numeral 18/20 600, connected by 1.5px `#1C1B19` leader lines to caption text (22/30) below the panel.
4. **Tradeoff:** title, then two columns (cols 1–6 "WE CHOSE", cols 7–12 "WE GAVE UP") split by a 1px `#DAD9D4` vertical rule at the gutter center. Each column is H2 plus 3 bullets at body size, with 24 between bullets. Bottom band (cols 1–12, bg `#FFFFFF`, radius 16, padding 32): "Why it's worth it:" in body 600 plus one sentence.
5. **Assumptions:** title, then a table spanning cols 1–12 with rows 88 tall and 1px `#E8E8E4` dividers. Columns: # (tnum 40/48 600) | assumption (body) | confidence chip (22/30 500, radius 6, padding 6 14): "Validated" (DONE colors), "Assumed" (NEXT colors), "Needs research" (FYI colors) | how we'd test it (caption `#57554F`).
6. **Process / thought:** a horizontal 4-step track. Steps are 36px circles on a 2px `#DAD9D4` line with step titles in H2 and captions below, each step 3 cols.
7. **System / tokens:** swatch grid (swatch 200 × 120, radius 12, hex in 22/30 tnum below) plus a type specimen column.
8. **Prototype:** a device frame (desktop 1440 scaled to cols 1–9, handheld 390 scaled to cols 10–12), with a QR code or URL in caption tnum.

### Motion in the deck
Only Keynote "Dissolve" 0.3s between slides, and "Magic Move" for before→after of the same screen. No bounces.

---

## 9. Tradeoffs (visual/interaction lens)

1. **The hero card costs vertical space.** About 208px shows one item instead of 3 rows. *Worth it:* the complaint is "what first," and a single dominant object answers it in under a second. The compact manager view compensates for density.
2. **Tinting only NOW.** NEXT rows look similar to LATER at a glance, apart from icon shape, rail and time pill. *Worth it:* scarcity keeps red meaningful. If testing shows NEXT/LATER confusion, add the NEXT rail (already specced) before adding any tint.
3. **Light only.** We lose the dark control-room aesthetic that looks impressive in decks. We gain glare legibility and a calmer tone.
4. **Auto-promotion vs. stability.** Automatically swapping the hero on arrival is "correct" but disorienting. The active/idle rule adds complexity but protects the user's aim.
5. **No drag-and-drop for reassign.** It looks less "magical" in a demo. It's more accessible and faster (2 clicks).
6. **Source demoted to a quiet tag.** People used to navigating by source (Orders vs Comms) lose a strong cue. The source filter covers that need.
7. **Live timers.** A ticking clock creates urgency, which is the point for NOW, but it's anxiety-inducing if overused. That's why only NOW and the hero tick every second, and rows update every 60s.

## 10. Position on the likely IA disagreement: how much rationale per row

**Position: rows carry the *cause*, not the *ranking math*.**

- **Row:** one reason line, ≤6 words, from a closed vocabulary of ~8–12 cause templates ("blocking 3 orders", "carrier cutoff 14:30"). It answers "what's wrong," not "why it's #3." Plain text, meta size, no chips.
- **Tier header:** the *rule* is stated once per tier ("Blocking or overdue", "Due this shift", "No risk yet"). This explains the grouping without repeating it on every row.
- **Hero:** "Why first:" plus up to 3 causes, and a "See ranking ›" link.
- **Drawer:** the full "Why this is #1" factor breakdown with weight bars, plus the global ranking order ("blocking impact → deadline → customer tier").

**Rationale:** per-row rationale ("ranked #3 because A + B, above #4 because C") turns a scannable queue into a wall of prose, which reproduces the exact overwhelm we're fixing. Trust in the ranking comes from (a) a legible *rule* at the tier level, (b) a concrete *cause* on each row, and (c) full transparency one click away. I'd concede to the IA expert on vocabulary and wording: the closed cause list should use workers' own words, validated with them. I'd hold firm on the budget of **one line, ≤6 words, no extra UI element per row**.

---

## 11. Implementation notes for the builder (cheap-model guardrails)

- Put every token in `:root` CSS variables with exactly the names above, and in `tailwind.config` `theme.extend` if using Tailwind. Never write raw hex in components.
- One `<PriorityIcon tier="now|next|later|done|fyi" size={16|20|24} />` component maps tier to Lucide icon plus color. Every tier visual goes through it.
- `<TimePill due={Date} tier />` computes the copy and variant itself, with one shared 1s ticker (`useNow(1000)` for the hero, `useNow(60000)` for rows).
- The list uses a FLIP library (`framer-motion` `layout` with `transition={{ duration: 0.24, ease: [0.22,1,0.36,1] }}`) and respects `useReducedMotion()`.
- Test checklist: (1) `filter: grayscale(1)` still ranks correctly; (2) Tab/J/K/E can do the full completion flow without a mouse; (3) at 390px every target measures ≥48px; (4) the 3-second test: show the screen for 3s to someone, ask "what would you do first and why?"
