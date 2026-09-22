# Relay: Implementation Plan

Foundey Senior Product Designer challenge. Redesign of an internal fulfillment operations dashboard.

Prepared 2026-09-22 by the lead designer with three advisors (information architecture and cognitive accessibility, visual and interaction, fulfillment industry). Their full reports are in `research/`. **This file wins every conflict.** Where this file is silent, use the advisor report named in that section.

---

## 0. Read this first (rules for the implementer)

You are building four deliverables from this plan:

1. **Design system** (tokens, components, a living `/system` page).
2. **Interactive prototype** (React app, pushed to GitHub, deployed on the Vercel free tier).
3. **Keynote-style deck** (a `/deck` route in the same app, plus a PDF and PNG export).
4. **Figma** versions of all of the above.

Non-negotiable rules:

| # | Rule |
|---|---|
| R1 | **No dashes in any user-facing copy.** No em dash (—), en dash (–), or hyphen used as punctuation (" - "). In deck copy, also avoid hyphenated words ("one-click" → "one click", "next-day" → "next day"). Use periods and commas. `scripts/check-copy.mjs` enforces this (see §10.7). |
| R2 | **All UI copy lives in `src/copy.ts`; all deck copy lives in `src/deck/slides.tsx`.** Never inline strings anywhere else. The copy is in §9 and §12: use it verbatim. |
| R3 | **Never write raw hex in components.** Use the CSS variables in `src/styles/tokens.css` (§8.1). |
| R4 | **Use `plan/seed.json` verbatim** as the data. Do not invent items, people, or times (the seed includes `doneToday` for the progress line and `demoInjections` for the urgent item demo). Each item's `_expected` field is a test fixture: if your computed score or tier differs, your code is wrong. |
| R5 | **The clock is simulated.** On load, "now" is `2026-09-22T10:40:00-07:00`. It then advances in real time. Never read the real clock for display or scoring. All times are shown in the site time zone (America/Los_Angeles), 24 hour format. |
| R6 | Plain English, grade 6 reading level, sentences of 12 words or fewer in the UI. Buttons start with a verb. |
| R7 | Never use color alone. Every tier is shown with an icon shape, a text label, and a color. |
| R8 | Before any commit, set repo-local git identity to the project owner (§10.8). |
| R9 | Do not use Amazon branding (no orange, no smile arrow, no Amazon logo). The product is a fictional internal tool called **Relay**. Mentioning Amazon in the deck as the context of the brief is fine. |

Build order is in §15. Acceptance checks are in §14.

---

## 1. The problem, and the insight that shapes everything

**The brief.** An internal operations app for the fulfillment team. The dashboard shows Recent activity, Tasks (Orders), Notifications, and Team updates. Workers say: "I never know what needs my attention first." Managers say: "I cannot see what each worker is doing." Redesign the dashboard so people can quickly see their work from most critical to least urgent.

**The insight.** The "current" screen in the brief (`research/current-dashboard.png`) **already has one ranked queue** ("Needs Your Attention, ranked by urgency, pulled from every source below"). Users still complain. So the fix is not "add a ranked list". The ranked list fails because:

| # | Why the current ranked list still fails | Our fix |
|---|---|---|
| F1 | **It ranks but never says why.** Rows show a colored dot and a due time. The real drivers in fulfillment, truck cutoffs and how many orders are blocked, are invisible. People don't trust it, so they re-scan everything. | Every row has a short **cause line** ("Blocks 140 orders for UPS 11:30"). The top card says **why it is first**. A "How we sort your work" panel explains the rules in four lines. |
| F2 | **It labels by source, not consequence.** Chips say ORDER, NOTIFICATION, COMMS. | Three groups named by time: **Do now, Up next, Later today**. Source becomes a quiet tag at the end of the row. |
| F3 | **Everything has the same weight.** Four identical rows, four equal "Review" buttons. | One large **"Do this now"** card with one verb-specific primary button. Rows below are quieter. |
| F4 | **No finish line.** The count drops silently and there is no done state. | A "4 of 10 done today" progress line, an 8 second Undo, the next task moving up automatically, and a calm "You're all caught up" state. |
| F5 | **Five regions compete.** Four equal reference cards sit under the queue and repeat the same items. | Reference cards leave the home page. For your info content goes to **Updates**. The home page has one quiet right rail. |
| F6 | **Managers have nothing.** | A **Team** view built on the same priority model: what each person is working on, who may need help, work with no owner, trucks at risk, and reassign in two clicks. |
| F7 | **"Doing" is not data.** There is only "Review", so nobody can tell what anyone is working on. | An explicit **Start** button creates the "Working on it" state that feeds the Team view. |

**Deck one-liner:** *The old screen sorts. It doesn't explain, it doesn't show consequences, and it doesn't route work.*

---

## 2. Decision log (how the advisor conflicts were resolved)

| Topic | Options on the table | Decision | Why |
|---|---|---|---|
| Product name | "Shift" (visual) | **Relay** | "Shift" collides with "your shift ends at 17:00" in the UI copy. Relay also carries the handoff idea. Keep the visual advisor's mark (three ranked bars). |
| Tier names | "Do now / Before shift ends / When you have time" (IA), "Act now / Up next / Later today" (industry), "NOW / NEXT / LATER" (visual) | **Do now / Up next / Later today** plus **For your info** (never ranked) and **Done** | Short enough for eyebrows and chips, time-based, readable on day one. |
| Scoring | Rule list (IA) vs points formula (industry) | **Industry formula** (§4.2) | Deterministic, already verified against all 25 seed items, and it shows the key truth: a big blocker beats a small overdue item. |
| Rationale per row | Always-visible reason (IA) vs a line of 6 words or fewer (visual) | **One cause line per row, 6 words or fewer, always visible.** The tier rule appears once in the tier header. The full "why" sentence goes in the hero card and the drawer. The factor breakdown goes in the drawer. | Both advisors can accept this. The cause is written into the seed as `cause`. |
| Navigation | Old six items plus a role switch (visual) vs job-based (IA) | **My work, Team, Updates, Look up.** Settings moves to the avatar menu. The same nav for everyone. | Nav items become jobs, not data sources. Workers see Team read-only (the transparency mirror, from industry). |
| Role switching | A visible Worker/Manager toggle (visual) vs none (IA) | **No toggle in the product.** The prototype has a clearly labeled **Prototype controls** panel with "Viewing as Priya / Danielle". | In production, role comes from permissions. The demo still needs a switch. |
| Manager layout | Worker cards (visual) vs table (IA, industry) | **Table ("Team board")** | Managers compare 8 to 15 people, and rows compare better. It is also less to build. |
| Idle time | "Idle 9m" (visual) | **Never shown.** Statuses are Working on, Available, On break, and Out today. "May need help" attaches to an **item** that has had no update for 45 minutes. | "See the work, not the worker." Amazon faces public criticism and quota laws about monitoring warehouse workers (see the industry report §4). |
| Shift pace tile | Units vs plan (visual) | **Replaced by a "Next truck" tile.** | It avoids productivity policing and anchors on what actually matters (the cutoff). |
| Time format | "4 PM" (IA) vs 24 hour (visual, industry) | **24 hour.** Under 60 minutes, relative: "in 38 min". Past due: "Late by 25 min" / "Late by 2 h". | Fulfillment runs on 24 hour truck times. The words stay plain. |
| Live timers | Seconds ticking (visual) | **Updates every minute.** No seconds. | Calm beats anxiety. |
| Undo duration | 6 s (visual) vs 8 s (IA) | **8 s** | Slower readers. |
| Row actions | Hover icon buttons (visual) vs one visible button (IA) | **One visible button per row** (Start or Mark done). Everything else is in the drawer. | Hidden hover actions fail touch users and less tech-savvy users. |
| Snoozing Do now items | Allowed with a reason (visual) vs blocked (IA) | **Blocked** for Do now and safety items, with the reason "Do now items cannot be moved. Ask for help instead." | Stops people hiding real risk by accident. |
| Worker overrides | Pin, Not mine, Waiting on, Escalate (industry) | Keep **Ask for help, Waiting on someone, Not mine, Hand off, Move to later**. **Drop Pin** from v1. | Fewer choices for less tech-savvy users. Pin is on the roadmap slide. |
| Dark mode | n/a | **Light only in v1.** | Warehouse glare, and scope. |
| Personas | n/a | Primary: **Priya Raman, Outbound Exception Coordinator** (desk). Secondary: **Danielle Okafor, Shift Operations Manager**. Floor associates are out of scope. | Industry advisor. The brief's examples are desk work. |
| Device | n/a | **Desktop first at 1440.** A responsive handheld layout at 390 is included as secondary. | This is an assumption stated in the deck. |

---

## 3. Personas, assumptions, scope

### 3.1 Personas (use in the deck; details in `research/advisor-industry.md` §2)

**Priya Raman**, Outbound Exception Coordinator, site SEA4, day shift 06:30 to 17:00.
- Works at a shared desk by the ship dock. It is loud, and people interrupt her every few minutes.
- Her day runs on truck cutoffs: UPS 11:30, Amazon Logistics 12:15, FedEx 14:00, USPS 15:30.
- Goal: nothing misses a truck because of her.
- Pain: "Everything says urgent." Alerts come from four or more systems.

**Danielle Okafor**, Shift Operations Manager, 7 people.
- Mostly on the floor. She checks the screen in 30 second glances.
- Her real question: "What is at risk, who owns it, and does anyone need help?"

**Out of scope:** pickers and packers. Their handheld scanners already hand them one task at a time. The same pattern could later move to handhelds for Problem Solve leads (roadmap).

### 3.2 Assumptions (deck slide 9 uses this table verbatim)

| # | Assumption | Confidence | How we would test it |
|---|---|---|---|
| 1 | The "fulfillment team" in the brief is desk based exception coordinators and their shift manager. | Assumed | Shadow two coordinators for a full shift. |
| 2 | Source systems can tell us the due time, the linked truck, and how many orders are blocked. | Assumed | Check the WMS and carrier feeds with engineering. |
| 3 | People mainly use a shared desktop, and read it from up to 2 meters away. | Assumed | Site visit and photos of workstations. |
| 4 | A coordinator handles 5 to 20 actionable items per shift. | Needs research | Pull one week of exception logs. |
| 5 | One shared priority model is acceptable to both workers and managers. | Needs research | Card sort and a ranking exercise with both groups. |
| 6 | Managers want to step in on exceptions, not watch people minute by minute. | Assumed | Manager interviews, plus a trust survey after the pilot. |

### 3.3 Scope framing: "the one hour answer" plus extension

The brief asks for under an hour of work: thinking plus low fidelity wireframes. The deck **opens with the one hour answer** (slides 2 to 14) and clearly labels everything else as **extension** with a small eyebrow "EXTENSION: BEYOND THE ONE HOUR ASK". This shows we listened to the constraint and then chose to go further.

---

## 4. Priority model (single source of truth)

### 4.1 Tiers

| Tier id | UI label | Eyebrow (uppercase) | Helper text in tier header | Lucide icon | Rule |
|---|---|---|---|---|---|
| `now` | Do now | DO NOW | A truck, a person, or many orders are at risk. | `octagon-alert` | `safety == true` OR `score >= 60` |
| `next` | Up next | UP NEXT | Matters today. A clock is running. | `triangle-alert` | `30 <= score < 60` |
| `later` | Later today | LATER TODAY | Real work. Nobody is blocked yet. | `circle-dashed` | `score < 30` |
| `fyi` | For your info | FOR YOUR INFO | No action needed. | `info` | `source == "fyi"`. Never enters the queue, only goes to Updates. |
| `done` | Done | DONE | n/a | `circle-check` | `status == "done"` |

### 4.2 Score (implement exactly; file `src/lib/priority.ts`)

```
minutesLeft = (dueAt - now) in minutes   // negative = overdue

T (time pressure)
  dueAt null           -> 0
  minutesLeft < 0      -> 40
  minutesLeft <= 30    -> 36
  minutesLeft <= 60    -> 30
  minutesLeft <= 120   -> 22
  minutesLeft <= 240   -> 14
  otherwise            -> 8

B (orders blocked)
  0 -> 0 ; 1..9 -> 6 ; 10..49 -> 14 ; 50..199 -> 22 ; 200+ -> 30

I (impact)
  customerImpact high +10, low +4, none 0
  compliance +15 ; escalated +12 ; safety +50 (and tier forced to now)

score = min(100, T + B + I)
fyi items: score null, tier fyi
```

**Sort inside a tier:** score descending, then dueAt ascending, then ordersBlocked descending, then createdAt ascending, then id ascending.

**Status handling:**
- `done`: removed from tiers and counted in "Done today".
- `waiting`: removed from tiers and shown in a collapsed "Waiting on others (n)" group at the bottom until `checkBackAt`, then it returns.
- `snoozed`: shown in a collapsed "Moved to later (n)" group until `snoozeUntil`, then it returns.
- `in_progress`: stays in its tier. It shows the "Working on it" label.
- Only one `in_progress` item per person. Starting another item returns the previous one to `open`, with the toast "Paused {title}." [Undo].

**Recompute** all scores on every simulated minute tick. **Do not reorder visible rows while the user interacted in the last 10 seconds.** Instead, show the bar "1 item changed place. Show it" at the top of the list (§7.6).

**Worked proof (deck slide 13).** Priya's six items at 10:40:

| Sorted by due time (old way) | Sorted by Relay |
|---|---|
| 1. Order 4821 payment mismatch (overdue since 08:40) | 1. Label printer offline at Pack 7 (score 62, blocks 140 orders, UPS 11:30) |
| 2. Reply to vendor about damaged tote count (10:45) | 2. Lithium battery orders missing hazmat labels (61) |
| 3. Danielle asked you to confirm the UPS order count (11:00) | 3. Order 4821 payment mismatch (50) |
| 4. Label printer offline at Pack 7 (11:30) | 4. Reply to vendor about damaged tote count (36) |
| 5. Lithium battery orders missing hazmat labels (11:45) | 5. Danielle asked you to confirm the UPS order count (36) |
| 6. Rush shipping request on order 4796 (tomorrow) | 6. Rush shipping request on order 4796 (12) |

### 4.3 Explanation surfaces (three levels)

1. **Row:** the `cause` field (6 words or fewer), for example "Blocks 140 orders for UPS 11:30".
2. **Hero card:** "Why first:" followed by `whyText`, for example "140 orders need labels before the UPS truck leaves at 11:30."
3. **Drawer, "Why this is ranked here":** a list of plain sentences with a check icon for every factor that scored above 0. Each sentence has a relative weight bar, 64×4 px, with no numbers. Generate the sentences from the factors:
   - T > 0: overdue → "It is late by {rel}." Otherwise → "It is due at {HH:mm}, in {rel}."
   - B > 0 → "{n} orders are waiting on it."
   - cutoffId → "It must be ready for the {carrier} truck at {HH:mm}."
   - customerImpact high → "Customers will feel it." Low → "A customer may notice."
   - compliance → "It is required by law or policy."
   - escalated → "Someone escalated it."
   - safety → "Someone could get hurt. Safety always comes first."
   - Below the list, a collapsed disclosure "Show the score" reveals `Time 36 + Orders 22 + Impact 10 = 68`.
   - Footer link: "How we sort your work".

**"How we sort your work"** is a modal, 480 wide. Title "How we sort your work". Body, verbatim:

> We look at four things. How soon it is due. How many orders are waiting on it. Whether customers will feel it. Whether it is about safety or the law.
>
> **Do now** means a truck, a person, or many orders are at risk. Safety always goes here.
> **Up next** matters today, and a clock is running.
> **Later today** is real work, but nobody is blocked yet.
>
> Inside each group, the most important thing is on top. You can always ask for help or hand something off.

Button: "Got it".

### 4.4 Load (Team view)

`loadPoints = 3 × doNowCount + 1 × upNextCount`. The label is **Light** for 0 to 5, **Busy** for 6 to 11, and **Full** for 12 or more (or when doNowCount is 4 or more). Show it as a word plus a small 3-segment bar. Never show it as a percentage.

### 4.5 "May need help" (item based, never person based)

An item is flagged when `status == in_progress` and the simulated now minus `currentTaskStartedAt` (from the assignee) is 45 minutes or more, OR the item has been handed back with "Not mine" twice. Copy: "{title} has had no update for {n} min." In the seed, this is Tomasz Nowak's it-07.

---

## 5. Information architecture

### 5.1 Navigation (same for everyone)

| Item | Icon (Lucide) | Worker sees | Manager sees | Replaces |
|---|---|---|---|---|
| My work | `list-todo` | Their ranked queue | Their own items (Danielle has none: shows the all clear state with a link "Go to Team") | Dashboard |
| Team | `users` | The team board, **read only** (no reassign, no "Needs you") | The full team view | new; absorbs Reports |
| Updates | `bell` | For your info items, team updates, activity | same | Notifications, Team Comms, Recent Activity |
| Look up | `search` | Search any order, item, or person | same | Orders |

The avatar menu holds: name and role, "Settings" (disabled in the prototype, tooltip "Not part of this prototype"), and "How we sort your work".

In the prototype, the **default landing page** is `/work` when viewing as Priya and `/team` when viewing as Danielle.

### 5.2 Where the four original panels went (deck slide 21 uses this table)

| Original panel | New home |
|---|---|
| Tasks (Orders) | Ranked into My work. Source tag "Order". |
| Notifications | Ranked into My work when they need action. Otherwise in Updates. |
| Team updates (Internal Comms) | Ranked into My work when someone asks you something. Otherwise in Updates. |
| Recent activity | Updates, under "Activity". Never ranked. |

### 5.3 Screen inventory

| Route | Screen | Core or extension |
|---|---|---|
| `/work` | My work (worker home) | Core |
| `/work?item=it-01` | Item drawer open | Core |
| `/work` (state) | All caught up | Core |
| `/team` | Team view (manager) / Team board (worker, read only) | Core |
| `/team?person=u4` | Person drawer: that person's queue, read only, with Reassign per item (manager) | Core |
| `/updates` | Updates | Extension |
| `/lookup` | Look up | Extension (simple) |
| `/system` | Design system documentation | Deliverable |
| `/deck` | Slide deck | Deliverable |
| `/deck/print` | All slides stacked for PDF export | Deliverable |

---

## 6. Screen specifications

Layout grid (from the visual advisor, §6.1): left nav **248**, content padding **32**, inner width **1128**, 12 columns of 72 with 24 gutters. The main column is cols 1 to 8 (**744**), and the right rail is cols 9 to 12 (**360**). The top bar is 56 tall.

### 6.1 Left nav

- Width 248, background `--n-50`, padding 12.
- Wordmark row, 56 tall: a 20×20 mark plus "Relay" in Inter 600 17px, tracking -0.02em.
  - The mark is a 20×20 square, radius 6, fill `--n-900`, holding three white bars. The bars are left aligned at x=5, each 2px tall with rounded ends and a 3px gap. From the top, their widths are 10, 7, and 4.
- Nav items: 40 tall, radius 8, icon 20 plus label 14/20 500.
  - Active item: background `--n-0` with `--e-1`, label weight 600.
  - The My work item shows a count badge in the Do now style when the Do now count is above 0 (solid `--now-solid`, white text).
- Bottom: a user chip (avatar 28, name, role), then the shift line "Day shift · 6h 20m left" in 12px tabular numbers.

### 6.2 My work (worker home, 1440)

Top bar (sticky, 56 tall): the page title "My work" on the left. On the right: a search field (240×32, placeholder "Search orders, people, tickets"), then the avatar.

Main column, top to bottom:

1. **Greeting line** (24/32 600): "Good morning, Priya." Below it, a meta line (14/20 `--n-600`): "2 things need you now. 4 of 10 done today." Variants:
   - No Do now items, but Up next or Later items remain: "Nothing urgent. {n} left before your shift ends."
   - Nothing left: the all caught up state replaces the hero (§6.4).
   - Right aligned on the same line: a "How we sort your work" text link (icon `list-ordered`).
2. **Hero card, "Do this now"** (744 wide, radius 16, `--e-2`, padding 24). It holds the top item of the highest non-empty tier.
   - **Eyebrow row:** tier icon 20 plus the eyebrow "DO THIS NOW" in the tier's foreground color, then " · 1 of 6" in `--n-500`.
     - For an Up next hero, the eyebrow is "DO THIS NEXT". For a Later today hero, it is "UP NEXT WHEN YOU ARE READY".
     - The time pill is right aligned (large variant, §8.3).
   - **Title** (22/30 600, max 2 lines).
   - **Why line** (15/22): "Why first:" in 600 `--n-900`, then `whyText` in `--n-600`.
   - **Next step line** (14/20 `--n-600`, icon `arrow-right`): "Next step: {primaryAction}".
   - **Context line** (13/18 `--n-500`): the source tag, then "{carrier} truck {HH:mm}" when cutoffId is set, then "{ordersBlocked} orders waiting" when above 0.
   - **Status line** (only when in_progress): the chip "Working on it · {n} min" (accent-bg, accent text).
   - **Divider**, then the **action row:**
     - Primary lg, 48 tall: **"Start"** if open, **"Mark done"** if in_progress.
     - Secondary md, 40 tall: **"Ask for help"** (icon `hand`).
     - Ghost md: **"More"** (icon `ellipsis`). It opens a menu with "Waiting on someone", "Not mine", "Hand off to a teammate", and "Move to later" (disabled for Do now and safety items, with the reason as helper text).
   - **Tier styling:**
     - Do now: border 1px `--now-border`, inset left rail 4px `--now-solid`.
     - Up next: border `--next-border`, rail `--next-rail`.
     - Later today: border `--n-200`, no rail.
   - The hero item is **not repeated** in the list below.
3. **Queue list** (margin-top 32): one white container, radius 12, `--e-1`, with tier sections in order.
   - **Tier header** (40 tall, background `--n-25`): icon 16, eyebrow label in the tier's foreground color, the count, and right aligned helper text (§4.1) in `--n-500`.
     - Do now and Up next are always expanded.
     - Later today is **collapsed by default** when the other two tiers hold 4 or more rows. Its header then shows a chevron and "Show {n}".
     - When a tier is empty it still shows, with the row "Nothing here." This is reassuring, from the Plane reference.
   - **Row** (min height 64, padding 12 16, grid `24px 1fr auto auto`, gap 12):
     - Tier icon 16.
     - Text block: title (15/22 500, 1 line with ellipsis), then the cause line (13/18 `--n-500`, 1 line).
     - Time pill.
     - One button: secondary sm **"Start"**, or **"Mark done"** if in_progress.
     - The source tag sits under the time pill in the text block's second line, on the right. Keep it quiet: 12px, `--n-500`, with its icon.
     - Do now rows: background `--now-bg` and an inset 3px rail `--now-solid`. Up next rows: white with an inset 3px rail `--next-rail`. Later today rows: white, no rail, title weight 400.
     - The whole row is clickable and opens the drawer (except the button).
     - An in_progress row shows the chip "Working on it" after the title.
     - Waiting items appear in the collapsed group "Waiting on others ({n})" at the end, with the cause replaced by "Waiting on {waitingOn}. Back at {HH:mm}."
   - **Max visible rows** on first load: hero plus 3 per tier. Beyond that, the tier shows the button "Show {n} more".
4. **Done today group** (collapsed, below the list): "Done today ({n})". Expanded, it lists completed items with their times.
   - Seed: Priya starts with 4 done today, from `seed.json` → `doneToday` (display only, with the title and doneAt time).
   - **Progress math:** done = doneToday count for the person plus items they completed in this session. total = done plus their open, in progress, waiting, and snoozed actionable items (not fyi). At 10:40 Priya reads **"4 of 10 done today"**.

Right rail (360), all cards are for your info styling (no tier colors except the truck risk text):

- **Next trucks** card. Eyebrow "NEXT TRUCKS". Four rows: carrier, door, departs HH:mm, "in {rel}", then "{ordersAtRisk} orders at risk" (in the now foreground color when above 50, in the next foreground color when 1 to 50, and "On track" in the done foreground color when 0). This is the fulfillment clock the old screen lacked.
- **My shift** card. A 40px ring plus "4 of 10 done", then "Shift ends 17:00".
- **Updates** card. Eyebrow "UPDATES". The 3 latest updates relevant to Priya: author initials, text, relative time. Then the link "See all updates".

Footer strip, centered, 32 tall, 12px `--n-500`, hidden on touch devices: "J K move · Enter open · E mark done · Z undo · ? all shortcuts".

### 6.3 Item drawer

Right side, 480 wide, below the top bar, with no scrim. Slides in from x+24 with opacity 0 → 1 over 320ms. Esc closes it. Sections in order:

1. **Header** (56): tier icon plus eyebrow, then prev/next buttons (K/J), then close.
2. **Title** (20/28 600). Then the time pill (large) and source tag.
3. **"Why this is ranked here"** block (background `--n-25`, radius 12, padding 16): the factor sentences (§4.3), "Show the score", and the "How we sort your work" link.
4. **Details:** a 2 column property list. Assigned to, Orders waiting, Units affected, Truck, Created, Item ID.
5. **Activity:** 2 or 3 generated lines. "Created {HH:mm} by {source system}". "Started by {name} at {HH:mm}" if in_progress.
6. **Sticky footer** (72): the primary button (Start or Mark done), "Ask for help", and "More".

For a manager viewing someone else's item, the footer is "Reassign" (primary) and "Message {first name}" (secondary; opens a toast "Messaging is not part of this prototype.").

### 6.4 All caught up state

It replaces the hero and the list. Centered, padding 80 0.
- A 48px circle in `--done-bg` with `circle-check` 24 in `--done-solid`.
- Headline (24/32 600): "You're all caught up."
- Body: "Nothing needs you right now. New work will show up here, already sorted."
- Meta: "{n} done today."
- Two ghost buttons: "Help your team" (goes to `/team`) and "See updates".
- No confetti.

Variant, when only Later today items remain: the hero shows the top Later item with the eyebrow "UP NEXT WHEN YOU ARE READY". The greeting reads "Nothing urgent. {n} left before your shift ends."

### 6.5 Team view (manager, 1440)

1. **Top bar title** "Team". Below it, a status line (14/20): "Day shift · Outbound · 5 working, 1 on break, 1 out today." On the right: "Live · updated {HH:mm}" with a 6px green dot. The dot pulses, and stays static under reduced motion.
2. **Risk strip:** 4 tiles, each 264×104, radius 12, `--e-1`. Each tile is a button that filters the board and the "Needs you" list.
   - **DO NOW ACROSS TEAM:** the count of Do now items team wide (seed: 4). The number is in the now foreground color, with its icon. Sub-line: "3 due by 11:30".
   - **MAY NEED HELP:** the count of flagged items (seed: 1). Sub-line: "Order 4833 escalation, no update 80 min".
   - **NO OWNER:** the count of unassigned actionable items (seed: 2). Sub-line: "Kwame is out today". Includes the inline link "Assign".
   - **NEXT TRUCK:** "UPS 11:30". Sub-line: "236 orders at risk · in 50 min". Solid now style when more than 50 orders are at risk.
3. **Two columns.**
   - **Left (744): "Team board"** table, radius 12, `--e-1`. Header row 40, body rows 64. Columns:
     - Person (200): avatar 32 with initials, then name 15/22 600 and role 13/18 `--n-500`.
     - Right now (1fr), with variants:
       - "Working on: {title} · {n} min" (tier icon of that item).
       - "Available" (dot `--done-solid`).
       - "On break" (icon `coffee`, no timer).
       - "Out today" (hollow dot, `--n-500`).
       - If the current item is flagged, append the chip "May need help" (next style, icon `hand`).
     - Load (140): the word Light, Busy, or Full, plus tiny counts in tabular numbers with tier icons, "2 · 3 · 1".
     - Action (104): ghost sm **"See work"**. It opens the person drawer.
     - **Sort:** people with a flagged item first, then Full, then Busy, then Light, then On break, then Out today. Names alphabetical within each group. The manager's own row is not listed.
   - **Right (360): "Needs you"** card. Eyebrow "NEEDS YOU". Compact rows (min 56), each with one button:
     - "Oversize parcel needs a manual rate, order 4790. No owner. Due 11:20." [Assign]
     - "Wrong item claim on order 4755. No owner. Due 15:00." [Assign]
     - "Escalation: medical supplies order 4833 not shipped. No update for 80 min." [Check in]. This opens the person drawer for Tomasz, scrolled to it-07.
     - Empty state: "Nothing needs you right now."
   - Below it, a **Trucks today** card: the same component as the worker "Next trucks" card.
4. **Person drawer** (480): the header shows the avatar, name, role, and load word. The body shows **exactly the worker's queue, read only**, using the same row component, with the row button replaced by ghost sm "Reassign". It carries the note "This is what {first name} sees."
5. **Worker read-only Team board.** Same table. No risk strip, no Needs you, and no Reassign. The top note: "Everyone on the team sees this same board."

### 6.6 Reassign popover

320 wide, radius 8, `--e-3`. Header: the item title in 12px `--n-500`. Then a search input "Find a teammate". Then a "Suggested" group: people on shift, not on break, sorted Light first, then by the same area. Each row is 48 tall: avatar 24, name, area, and right aligned load word plus the Do now count. People who are Out today are listed last and disabled, with "Out today". One click commits (no confirm). Toast: "Moved to {first name}." [Undo].

Recipient effect: the item's `assigneeId` changes, `escalated` becomes true (+12), and its cause becomes "From Danielle: {original cause}". Keep it 6 words or fewer by using "From Danielle" plus the first 3 words of the original.

### 6.7 Updates

Title "Updates". Three groups:
- **For you:** fyi items plus updates that mention the user.
- **Your team:** team updates, including announcements and the handoff.
- **Activity:** activity and system entries.

Rows show the author avatar or a system icon, the text, and the relative time. FYI items have the ghost button "Mark as read". Empty state: "No updates. When something changes, it will show up here."

### 6.8 Look up

A search input (autofocus, placeholder "Search orders, people, tickets"). The result list filters items by title, order number, and person name, using the standard row component read only. Empty state before typing: "Type an order number, a name, or a word like printer."

### 6.9 Handheld (below 768 wide; design at 390×844)

- Side padding 16. A top bar (56) with the wordmark, then "{n} need you", then the avatar.
- A bottom tab bar (64 plus safe area) with the 4 nav items, icon 24 over a 12px label.
- The hero card is full width. The time pill sits on its own line. The action buttons move to a **sticky action bar** above the tab bar:
  - Row 1: the primary button, full width, 48 tall.
  - Row 2: "Ask for help" and "More", each 48 tall.
- Rows are at least 72 tall. The time pill moves to line 2, right aligned.
- The drawer becomes a full screen sheet sliding up.
- No right rail. The trucks show as a horizontal scroll of chips above the hero: "UPS 11:30 · 236 at risk".
- The Team board becomes a card list: one card per person with name, right now, and load.
- Every target is at least 48×48.

### 6.10 Prototype controls (demo only)

A floating pill at the bottom right, "Prototype controls" (icon `sliders-horizontal`), with dashed border `--n-400`, so it is clearly not product UI. It opens a 300 wide panel:
- **Viewing as:** a segmented control, "Priya (coordinator)" / "Danielle (manager)". Switching navigates to that persona's landing page.
- **Clock:** "Now {HH:mm}", then the buttons "Jump 15 min" and "Reset to 10:40".
- **Send a new urgent item:** injects `demoInjections[0]` (it-25) into Priya's queue.
- **Wireframe mode:** a toggle. It applies grayscale to the whole app plus a class that replaces Inter with a system font and removes shadows. This doubles as the "still works without color" proof.
- **Reset demo:** restores seed.json and clears saved state.

Persist the demo state in `localStorage` under `relay-demo-v1`. Wrap every read and write in try/catch, and fall back to the seed if storage fails.

---

## 7. Interaction specifications

Timings and easing come from the visual advisor §3.9. Always honor `prefers-reduced-motion`: transforms off, opacity only at 120ms.

### 7.1 Start

The "Start" button on the hero or a row sets the item to `in_progress` and sets the assignee's currentTaskId and startedAt to now. If another item was in progress, it returns to open, with the toast "Paused {title}." [Undo]. The hero button morphs to "Mark done" (120ms crossfade). The Team board updates (shared state).

### 7.2 Mark done → next task moves up

| t (ms) | Event |
|---|---|
| 0 | The button presses (scale 0.98, 80ms). |
| 0 to 160 | The button background crossfades to `--done-fg-strong` and its label swaps to "Done" with a check. |
| 120 to 480 | The hero eyebrow icon morphs to `circle-check` with a pop (scale 0.6 → 1, overshoot curve). The rail turns `--done-solid`. |
| 480 to 720 | The hero content fades out and moves up 8px. |
| 480 | Toast: "Done. {n} of {total} done today." [Undo], for 8 s. |
| 600 to 920 | The first row of the list moves into the hero (framer-motion `layoutId`) and adopts its tier style. The remaining rows shift up (240ms, 20ms stagger, max 5 rows). The counts crossfade. |
| 920 | Focus moves to the new hero's primary button. The live region says: "Done. Next: {title}." |

The last item crossfades into the all caught up state. **Undo** reverses this: the restored item returns to the hero, and the toast reads "Restored." for 2 s.

### 7.3 Ask for help

A popover, 300 wide, titled "What's stopping you?".
- Radio options: "I need information", "Something is broken", "I need another person", "Other".
- An optional note, "Add a note (optional)".
- A primary button, "Send to Danielle".

Result: the item stays in place with the chip "Help asked" (next style). On the Team view it appears at the top of "Needs you" as "{name} asked for help on {title}." [Check in]. Toast for the worker: "Sent to Danielle. She will check in."

### 7.4 Waiting on someone

A popover with:
- "Who are you waiting on?" (a text input with suggestions: "Carrier", "Maintenance", "Customer service", "Vendor").
- "Check back at" (options: "In 30 min", "In 1 hour", "At {next truck time minus 30 min}").

The item moves to the "Waiting on others" group. Toast: "Waiting on {who}. Back at {HH:mm}." [Undo]. When the time comes, the item returns with the cause "Back from waiting".

### 7.5 Not mine / Hand off / Move to later

- **Not mine:** reason radios "Wrong area", "I don't have access", "Duplicate", "Other". The item leaves the queue and becomes unassigned, so it shows in the manager's "Needs you". Toast: "Sent back to the team." [Undo].
- **Hand off to a teammate:** the reassign popover (§6.6) titled "Who should do this?". The toast is the same.
- **Move to later:** options "In 1 hour", "After lunch (12:30)", and "Pick a time". Disabled for Do now and safety items.

### 7.6 New urgent item arrives (Prototype controls → Send a new urgent item)

it-25 scores 68. That is higher than it-01 (62, the current hero) and it-03 (61), so it outranks the current hero.

- If the user interacted in the last 8 seconds, **the hero does not change.** A 40 tall band slides down inside the top of the hero:
  - Background `--now-bg`, icon `octagon-alert`, text "New and more urgent: Conveyor stopped at Pack 9 merge."
  - Buttons "Show me" (secondary sm) and "Stay here" (ghost sm).
  - "Show me" demotes the current hero into the list and promotes it-25 (320ms FLIP).
  - If the current hero is in progress, "Show me" does not pause it. It stays "Working on it" in the list.
- If the user was idle for 8 seconds or more, the swap happens automatically, and the tab title gets the prefix "(1) ".
- A lower-rank arrival inserts at its position: height 0 → 64 in 240ms, a 6px accent "new" dot for 3 s, and the `--now-bg` flash for Do now arrivals.
- The live region (polite) says: "New urgent item: {title}."

### 7.7 Manager reassign

"Assign" from "Needs you", or "Reassign" in the person drawer, opens the popover (§6.6). On commit:
- The row leaves "Needs you" (240ms collapse).
- The two people's load words and counts update, with a crossfade.
- Toast: "Moved to {first name}." [Undo], for 8 s.
- The NO OWNER tile decrements.

### 7.8 Keyboard

| Key | Action |
|---|---|
| J or ↓ | Move to the next row (the hero is index 0) |
| K or ↑ | Move to the previous row |
| Enter | Open the drawer |
| Esc | Close the drawer or popover |
| E | Mark the selected item done (the hero if nothing is selected) |
| Z | Undo while the toast is visible |
| ? | Shortcut sheet |

Ignore these keys while focus is in an input. Keep a single selection state (background `--accent-bg`, 2px left bar `--accent`).

### 7.9 Toast

Bottom left of the content area (x = 248 + 24, 24 from the bottom). 48 tall, radius 12, background `--n-900`, text `--n-50` 14/20.
- A check icon in `--done-on-ink`.
- The Undo text button in `--accent-on-ink` 600.
- A close button (32×32).
- A 2px progress hairline that shrinks over 8 s and pauses on hover or focus.
- `role="status"`. Only one toast at a time.

---

## 8. Design system

Direction: **"Paper and Ink"** (visual advisor §2). A warm off-white canvas, white cards, near-black ink text and primary buttons. Color is reserved for priority and status. The font is Inter (Google Fonts).

### 8.1 `src/styles/tokens.css` (paste as is)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@600&display=swap');

:root {
  /* neutrals (stone) */
  --n-0:#FFFFFF; --n-25:#FAFAF9; --n-50:#F6F6F4; --n-75:#F1F1EE; --n-100:#E8E8E4;
  --n-200:#DAD9D4; --n-300:#C9C7C0; --n-400:#8F8D85; --n-500:#6B6961; --n-600:#57554F;
  --n-800:#2E2D2A; --n-900:#1C1B19;

  /* accent: selection, focus, links only (never a tier) */
  --accent:#4338CA; --accent-bg:#EEF2FF; --focus:#4F46E5; --accent-on-ink:#A5B4FC;

  /* tiers */
  --now-fg:#B42318;  --now-bg:#FEF3F2;  --now-border:#FDA29B;  --now-solid:#D92D20;
  --next-fg:#93370D; --next-bg:#FFFAEB; --next-border:#FEC84B; --next-icon:#B54708; --next-rail:#DC6803;
  --later-fg:#475467;--later-bg:#F2F4F7;--later-border:#D0D5DD;--later-icon:#667085;
  --done-fg:#067647; --done-bg:#ECFDF3; --done-border:#ABEFC6; --done-solid:#079455; --done-fg-strong:#067647; --done-on-ink:#4ADE80;
  --fyi-fg:#57554F;  --fyi-bg:#F1F1EE;  --fyi-border:#DAD9D4;  --fyi-icon:#8F8D85;

  /* spacing (4px base) */
  --s-1:2px; --s-2:4px; --s-3:8px; --s-4:12px; --s-5:16px; --s-6:20px; --s-7:24px;
  --s-8:32px; --s-9:40px; --s-10:48px; --s-11:64px; --s-12:80px;

  /* radius */
  --r-xs:4px; --r-sm:6px; --r-md:8px; --r-lg:12px; --r-xl:16px; --r-full:999px;

  /* elevation */
  --e-1:0 1px 2px rgba(28,27,25,.05),0 0 0 1px rgba(28,27,25,.06);
  --e-2:0 1px 2px rgba(28,27,25,.06),0 6px 16px -4px rgba(28,27,25,.10);
  --e-3:0 2px 6px rgba(28,27,25,.08),0 12px 28px -6px rgba(28,27,25,.16);
  --e-4:0 24px 48px -12px rgba(28,27,25,.24);

  /* motion */
  --ease-out:cubic-bezier(.22,1,.36,1); --ease-in:cubic-bezier(.4,0,1,1);
  --ease-std:cubic-bezier(.2,0,0,1);    --ease-pop:cubic-bezier(.34,1.56,.64,1);
  --m-press:80ms; --m-hover:120ms; --m-enter:180ms; --m-exit:140ms;
  --m-list:240ms; --m-hero:320ms; --m-check:360ms; --m-flash:1600ms;

  --font:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  --font-display:'Inter Tight','Inter',system-ui,sans-serif;
}

html { color-scheme: light; }
body { margin:0; background:var(--n-50); color:var(--n-900); font-family:var(--font);
       font-feature-settings:"cv11" 1,"ss01" 1; -webkit-font-smoothing:antialiased; }
.tnum { font-variant-numeric: tabular-nums; }
:focus-visible { outline:none; box-shadow:0 0 0 2px #fff,0 0 0 4px var(--focus); }

@media (prefers-reduced-motion: reduce) {
  *,*::before,*::after { animation-duration:1ms !important; transition-duration:120ms !important;
    transition-property:opacity,background-color,color,border-color !important; }
}
.wireframe { filter: grayscale(1); }
.wireframe * { font-family: ui-sans-serif, system-ui, sans-serif !important; box-shadow:none !important; }
```

Contrast ratios are verified in `research/advisor-visual.md` §3.3. All text pairs pass WCAG AA.

### 8.2 Type scale (desktop; on handheld, add 2px to size and 2 to 4px to line height)

| Role | Size/LH | Weight | Tracking |
|---|---|---|---|
| page-title | 24/32 | 600 | -0.015em |
| hero-title | 22/30 | 600 | -0.01em |
| stat-number | 28/32 | 600 | -0.02em, tnum |
| section | 15/22 | 600 | -0.005em |
| row-title | 15/22 | 500 | 0 |
| body | 14/20 | 400 | 0 |
| meta | 13/18 | 400 | 0 |
| label (buttons) | 14/20 | 500 | 0 |
| eyebrow | 12/16 | 600 | +0.06em uppercase |
| micro | 12/16 | 500 | 0 |

Minimum text size: 12px on desktop, 13px on handheld. All times, counts, and IDs use `.tnum`.

### 8.3 Components (build each in `src/components/`, document each on `/system`)

The anatomy and states come from `research/advisor-visual.md` §5 unless overridden here.

| Component | Props / variants | Notes and overrides |
|---|---|---|
| `Wordmark` | size | §6.1 |
| `PriorityIcon` | tier: now/next/later/done/fyi; size 16/20/24 | The only place that maps tier to icon and color. |
| `TimePill` | dueAt, tier, size sm (22 tall)/lg (28 tall) | Overdue: solid `--now-solid` with white text, "Late by 25 min" or "Late by 2 h". Due within 60 min: "Due in 38 min" (now style if Do now, next style otherwise). Later: neutral `--n-75`/`--n-600`, "Due 15:00". Tomorrow: "Tomorrow 09:00". Leading `clock` icon. Updates every simulated minute. |
| `SourceTag` | source | Quiet: 12px, `--n-500`, with icon. Label map: order→"Order" `package`, system→"System" `cpu`, comms→"Message" `message-square`, carrier→"Carrier" `truck`, customer→"Customer" `user-round`, inventory→"Inventory" `boxes`, safety→"Safety" `shield-alert`, compliance→"Compliance" `clipboard-check`, floor→"Floor" `hard-hat`, fyi→"Info" `info`. |
| `Button` | variant primary/secondary/ghost; size sm 32/md 40/lg 48 | The primary is ink (`--n-900`), never accent. Minimum target 44 on desktop, 48 on handheld. See the visual advisor §5.9 for states. |
| `HeroCard` | item, variant now/next/later, state open/in_progress/completing | §6.2 |
| `NewUrgentBand` | item | §7.6 |
| `TierHeader` | tier, count, collapsible | §6.2 |
| `PriorityRow` | item, readOnly, actionSlot | §6.2. States: default, hover (`--n-25`; Do now rows `#FDECEA` via the token `--now-bg-hover:#FDECEA`, add it to tokens.css), selected, focus, in progress, help asked, waiting, done (transient), new. |
| `Drawer` | item or person | §6.3 and §6.5 |
| `WhyList` | factors | §4.3 |
| `Toast` | message, onUndo | §7.9 |
| `Popover` + `Menu` | | radius 8, `--e-3`, enter 180ms from y+4 |
| `AllClear` | | §6.4 |
| `RiskTile` | label, value, sub, tone | §6.5 |
| `TeamTable` / `TeamRow` | person, readOnly | §6.5 |
| `LoadLabel` | loadPoints, counts | §4.4 |
| `TruckList` | cutoffs | §6.2 rail |
| `ReassignPopover` | item | §6.6 |
| `Chip` | tone now/next/accent/done/neutral | 22 tall, radius 4, 12px 500 |
| `Avatar` | initials, status | 24/28/32, initials on `--n-100` |
| `Segmented` | options | Prototype controls |
| `EmptyState` | | |
| `Skeleton` | hero/row | Show only after 300ms of loading. The pulse is off under reduced motion. |
| `Kbd` | | |

### 8.4 `/system` page (living design system)

One long page with a left anchor nav. Sections: Principles (the 5 from deck slide 10), Color (swatches with hex and a contrast note), Type (specimen of each role), Spacing, Radius, Elevation, Motion (a demo button that plays the done sequence), Iconography (tier icons with meaning), Components (each component rendered in every state), Priority model (the tier table and formula), Voice and copy rules (R1, R6, and the verb list), Accessibility checklist (§14.3).

---

## 9. UI copy (put in `src/copy.ts`)

The IA advisor's copy deck (`research/advisor-ia.md` §8) is the base. Apply these overrides:
- Tier names are **Do now / Up next / Later today** (not "Before shift ends" or "When you have time").
- Nav is **My work / Team / Updates / Look up**.
- Times are 24 hour.
- The manager is Danielle, the worker is Priya.

Required strings (verbatim):

```ts
export const copy = {
  appName: 'Relay',
  nav: { work: 'My work', team: 'Team', updates: 'Updates', lookup: 'Look up' },
  search: 'Search orders, people, tickets',
  greeting: { morning: 'Good morning, {name}.', afternoon: 'Good afternoon, {name}.' },
  status: {
    needYou: '{n} things need you now.', needYouOne: '1 thing needs you now.',
    nothingUrgent: 'Nothing urgent. {n} left before your shift ends.',
    progress: '{done} of {total} done today.',
  },
  hero: { now: 'Do this now', next: 'Do this next', later: 'Up next when you are ready',
          of: '{i} of {n}', whyFirst: 'Why first:', nextStep: 'Next step: {action}',
          working: 'Working on it · {n} min' },
  actions: { start: 'Start', done: 'Mark done', help: 'Ask for help', more: 'More',
             waiting: 'Waiting on someone', notMine: 'Not mine', handOff: 'Hand off to a teammate',
             later: 'Move to later', reassign: 'Reassign', assign: 'Assign', seeWork: 'See work',
             checkIn: 'Check in', showMore: 'Show {n} more', showLess: 'Show less', undo: 'Undo',
             gotIt: 'Got it', showMe: 'Show me', stay: 'Stay here' },
  tiers: {
    now:   { label: 'Do now',       helper: 'A truck, a person, or many orders are at risk.' },
    next:  { label: 'Up next',      helper: 'Matters today. A clock is running.' },
    later: { label: 'Later today',  helper: 'Real work. Nobody is blocked yet.' },
    fyi:   { label: 'For your info',helper: 'No action needed.' },
    done:  { label: 'Done today' },
    empty: 'Nothing here.',
    waitingGroup: 'Waiting on others ({n})', laterGroup: 'Moved to later ({n})',
  },
  time: { dueIn: 'Due in {n} min', due: 'Due {hhmm}', lateMin: 'Late by {n} min', lateHr: 'Late by {n} h',
          tomorrow: 'Tomorrow {hhmm}' },
  why: { title: 'Why this is ranked here', showScore: 'Show the score', howLink: 'How we sort your work' },
  toast: { done: 'Done. {done} of {total} done today.', restored: 'Restored.', paused: 'Paused {title}.',
           moved: 'Moved to {name}.', sentBack: 'Sent back to the team.', helpSent: 'Sent to Danielle. She will check in.',
           waiting: 'Waiting on {who}. Back at {hhmm}.', notInPrototype: 'This is not part of the prototype.' },
  help: { title: "What's stopping you?", options: ['I need information','Something is broken','I need another person','Other'],
          note: 'Add a note (optional)', send: 'Send to Danielle', chip: 'Help asked' },
  laterDisabled: 'Do now items cannot be moved. Ask for help instead.',
  allClear: { title: "You're all caught up.", body: 'Nothing needs you right now. New work will show up here, already sorted.',
              meta: '{n} done today.', team: 'Help your team', updates: 'See updates' },
  newUrgent: 'New and more urgent: {title}.',
  changedPlace: '1 item changed place.', showIt: 'Show it',
  team: {
    status: 'Day shift · Outbound · {on} working, {brk} on break, {out} out today.',
    live: 'Live · updated {hhmm}',
    tiles: { now: 'Do now across team', help: 'May need help', noOwner: 'No owner', truck: 'Next truck' },
    board: 'Team board', needsYou: 'Needs you', needsYouEmpty: 'Nothing needs you right now.',
    rightNow: { working: 'Working on: {title} · {n} min', available: 'Available', onBreak: 'On break', out: 'Out today' },
    mayNeedHelp: 'May need help', load: { light: 'Light', busy: 'Busy', full: 'Full' },
    mirror: 'Everyone on the team sees this same board.', personNote: 'This is what {name} sees.',
    reassignTitle: 'Who should do this?', findTeammate: 'Find a teammate', suggested: 'Suggested',
  },
  trucks: { title: 'Next trucks', atRisk: '{n} orders at risk', onTrack: 'On track' },
  updates: { title: 'Updates', forYou: 'For you', team: 'Your team', activity: 'Activity', markRead: 'Mark as read',
             empty: 'No updates. When something changes, it will show up here.', seeAll: 'See all updates' },
  lookup: { empty: 'Type an order number, a name, or a word like printer.' },
  shortcuts: 'J K move · Enter open · E mark done · Z undo · ? all shortcuts',
  demo: { pill: 'Prototype controls', viewingAs: 'Viewing as', priya: 'Priya (coordinator)', danielle: 'Danielle (manager)',
          clock: 'Now {hhmm}', jump: 'Jump 15 min', reset: 'Reset to 10:40', inject: 'Send a new urgent item',
          wireframe: 'Wireframe mode', resetAll: 'Reset demo' },
}
```

---

## 10. Technical implementation

### 10.1 Stack (pin these)

- Vite 5, React 18, TypeScript 5.
- Tailwind CSS **3.4** (`tailwind.config.ts` extends colors, spacing, radius, and shadows from the CSS variables. Never write raw hex in classes).
- `framer-motion` 11 (layout, `layoutId`, AnimatePresence, `useReducedMotion`), `lucide-react`, `react-router-dom` 6.
- `vitest` for tests, and `playwright` (dev dependency) for deck export.
- No backend. State lives in a React context plus a reducer, persisted to localStorage (§6.10).

### 10.2 Repo layout (the repo root is `/Users/Shared/Projects/Archive/foundey`)

```
foundey/
  brief/                      (existing, keep)
  plan/                       (this plan, research, seed.json)
  index.html
  package.json
  vercel.json                 { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  tailwind.config.ts, postcss.config.js, tsconfig.json, vite.config.ts
  public/  favicon.svg (the mark), og.png
  scripts/
    check-copy.mjs            (R1 enforcement)
    export-deck.mjs           (Playwright: PNG per slide + PDF)
  src/
    main.tsx, App.tsx, routes.tsx
    copy.ts
    styles/tokens.css, styles/app.css
    data/seed.ts              (imports ../../plan/seed.json, typed)
    lib/priority.ts           (score, tier, sort, cause, factors, load, mayNeedHelp)
    lib/priority.test.ts      (asserts _expected for all 25 items at 10:40)
    lib/time.ts               (sim clock, formatting: HH:mm, relative, 24h, America/Los_Angeles)
    state/store.tsx           (context, reducer, actions: start, done, undo, help, waiting, notMine, handOff, reassign, inject, jump, reset, setPersona)
    components/…              (§8.3)
    pages/Work.tsx, Team.tsx, Updates.tsx, Lookup.tsx, System.tsx
    deck/Deck.tsx, deck/slides.tsx, deck/SlideFrame.tsx, deck/Print.tsx, deck/wireframes/*.tsx
```

### 10.3 Types

```ts
type Tier = 'now'|'next'|'later'|'fyi'|'done'
type Status = 'open'|'in_progress'|'waiting'|'snoozed'|'done'
interface Item { id:string; title:string; source:string; assigneeId:string|null; dueAt:string|null; createdAt:string;
  cutoffId:string|null; ordersBlocked:number; unitsAffected:number; customerImpact:'none'|'low'|'high';
  safety:boolean; compliance:boolean; escalated:boolean; cause:string; whyText:string; primaryAction:string;
  status:Status; waitingOn?:string; checkBackAt?:string; snoozeUntil?:string; helpAsked?:boolean;
  notMineCount?:number; _expected?:{score:number|null; tier:string} }
```

Map the seed tier strings to ids: "Act now"→now, "Up next"→next, "Later today"→later, "For your info"→fyi.

### 10.4 Simulated clock

`simNow = seedNow + (Date.now() - loadedAt) + jumpOffsetMs`. A `useNow(60000)` hook re-renders on every simulated minute. "Jump 15 min" adds to `jumpOffsetMs`. Store `jumpOffsetMs` and the action log in localStorage; do not store `loadedAt`.

### 10.5 Deck implementation

- `/deck`: a single slide at 1920×1080, scaled to fit the viewport (CSS transform, letterboxed on `--n-50`). Navigate with ← → keys, click, and swipe. `F` toggles fullscreen. `N` toggles speaker notes in a bottom drawer. The URL hash holds the slide number (`/deck#7`).
- `/deck/print`: every slide stacked at exactly 1920×1080 with `@page { size: 1920px 1080px; margin: 0 }`.
- Product screenshots inside slides are **live React renders** of the real components with seeded state (`<WorkScreen frozen persona="priya" />` scaled down inside a frame). No PNGs are needed, and the deck always matches the prototype. Give each page component a `frozen` prop that disables timers and interaction.
- **Fallback:** if the scaled live render misbehaves (layout breaks, timers run, fonts missing), use Playwright to screenshot `/work` and `/team` (and the needed states) from the running prototype at 1440×1024 into `public/deck-shots/`, and place those PNGs in the frames instead. Say so in the final report.
- `scripts/export-deck.mjs`: start `vite preview`, open `/deck/print` in Playwright Chromium, save `exports/relay-deck.pdf`, and save one PNG per slide to `exports/slides/slide-XX.png` (these feed Figma, §13).

### 10.6 Tests (must pass before deploy)

1. `priority.test.ts`: for all 24 seed items plus it-25, `score()` and `tier()` at `2026-09-22T10:40:00-07:00` equal `_expected`.
2. Priya's sorted order at 10:40 is `it-01, it-03, it-04, it-05, it-13, it-11`.
3. Load labels at 10:40: Priya Busy, all others Light (Kwame is Out today).
4. `mayNeedHelp` flags only it-07 at 10:40.

### 10.7 `scripts/check-copy.mjs`

Read `src/copy.ts`, `src/deck/slides.tsx`, and `plan/seed.json`. Fail (exit 1) if any string literal or JSX text contains `—`, `–`, or ` - `. For `slides.tsx` only, also fail on a hyphenated word (`[A-Za-z]-[A-Za-z]`) **inside JSX text nodes only** (text between `>` and `<`). **Exempt** `className`, `style`, `id`, `key`, and `data-*` attribute values, import paths, and CSS custom properties. The simplest reliable approach: keep all deck prose in plain data objects (`{ title, body, notes, callouts }`) at the top of `slides.tsx`, and scan only the values of those objects. Print the offending line. Add `"check:copy": "node scripts/check-copy.mjs"` and run it in `"build": "npm run check:copy && vitest run && vite build"`.

### 10.8 Git, GitHub, Vercel (owner is izaias, GitHub `iziuqo`)

```bash
cd /Users/Shared/Projects/Archive/foundey
git init -b main
git config user.name "izaias"
git config user.email "iz.iuqo@gmail.com"
```

- `.gitignore`: node_modules, dist, exports/slides, .vercel, .DS_Store.
- Work on the branch `build/relay`, then merge to main locally (a solo repo, so this is fine per the workspace rules).
- The first commit contains the plan and scaffold. Commit after each milestone in §15.
- End commit messages with `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

```bash
gh repo create iziuqo/foundey-relay --private --source=. --remote=origin --push
```

(Keep the repo private, because it contains the brief PDF. The Vercel URL is public and shareable.)

```bash
vercel whoami
vercel link --yes --project foundey-relay
vercel --prod
```

- If `vercel whoami` fails, stop and ask the user to run `vercel login` themselves.
- `vercel link` and `vercel --prod` can prompt interactively on a new project. Always pass `--yes`. If a command still waits for input, stop and tell the user what it asked instead of letting it hang.
- Record the production URL in `README.md` and in deck slide 27.
- Optionally connect the GitHub repo in the Vercel dashboard for auto deploys. The commit author must be izaias for Hobby deploys (the workspace rule).

`README.md`: what this is, the links (prototype, deck, system, Figma), how to run it (`pnpm i && pnpm dev`), and a demo script (§12.3).

---

## 11. Visual references (Mobbin, curated)

The full lists with notes are in the three research files. The ten that matter most:

| Pattern | Reference | Use it for |
|---|---|---|
| Shape carries rank | [Linear priority icons](https://mobbin.com/screens/be6c4ee4-aa93-42b4-89b3-dcfc8386f022) | Tier icons |
| Tint only the top group | [Programa overdue group](https://mobbin.com/screens/079d676e-8012-4f1d-b29a-a20bfb05a015) | Only Do now gets a tint |
| "Why am I seeing this" | [Linear Pulse](https://mobbin.com/screens/b4daf53d-35b6-4c7c-a237-91793e4e241d) | The why surfaces |
| Split by consequence | [Slite "Where you're needed / Nice to see"](https://mobbin.com/screens/5da0de72-bedb-4c86-9cc9-905eb129b95d) | My work vs Updates |
| One next thing | [Trello "Up next"](https://mobbin.com/screens/2c5ee210-5a6a-47b0-add5-5e65dcbc7113) | The hero card |
| Consequence callout | [Deel "For you today"](https://mobbin.com/screens/403abcf1-892f-4036-9cbd-ba951c6dce7e) | The why-first line |
| Countdown plus one action | [Instacart approvals](https://mobbin.com/screens/a432ea07-74c5-4335-bdf8-189d0ba429e4) | The hero time pill and primary button |
| Undo, not confirm | [Todoist toast](https://mobbin.com/screens/75c4093b-73e7-4344-b2e7-54e90d94e58c) | The toast |
| Risk chips over a roster | [7shifts conflicts](https://mobbin.com/screens/5d4b06e8-8215-48f7-ae27-58e7a2419b25) | The Team risk strip |
| Surveillance anti-pattern | [Toggl team activity](https://mobbin.com/screens/37dcf4b6-465d-485f-b08b-8f858fc6dd28) | Deck slide 20 (what we won't build) |

Also worth citing on the "Why widget dashboards fail" point (deck slide 5 speaker notes): [Wrike dashboard](https://mobbin.com/screens/f47348fb-274b-4014-83d0-2b3dc5bdf53a) and [ClickUp dashboard](https://mobbin.com/screens/14dda24d-2d82-4f15-95cf-5793ebbe81fc), which are many equal widgets with no single next action.

The advisors noted that Mobbin has no real warehouse, WMS, or scanner apps. Our fulfillment-specific choices come from the industry advisor, not from precedent. The deck says so on slide 9 or in its notes.

---

## 12. The deck

### 12.1 Visual system

Use the visual advisor §8 exactly: 1920×1080, margins 140/100, 12 columns of 100 with 40 gutters, Inter Tight for 44px and up, Inter below. Default background `--n-50`. Statement slides use a `--n-900` background with `--n-50` text. The footer on every slide except the cover reads "Relay · Foundey challenge" on the left and the slide number on the right, in 16px `--n-500`.

Every product visual is a live component render in a frame (radius 16, `--e-2`, 1px `--n-200`). Numbered callouts are 36px ink circles with white numerals, with 1.5px leader lines to 22/30 captions.

Low fidelity wireframes (slides 14 and 18) are separate components in `src/deck/wireframes/`: grayscale boxes, 2px `--n-400` strokes, labels in a system font, no color and no icons. They look deliberately sketched, drawn in the same layout as the hi-fi screens.

### 12.2 Slides (copy verbatim; `notes` are speaker notes)

Eyebrow labels: slides 2 to 14 carry "THE ONE HOUR ANSWER" (thinking, assumptions, priorities, and the low fidelity wireframe, which is exactly what the brief asks for). Slides 15 to 25 carry "EXTENSION: BEYOND THE ONE HOUR ASK". Slides 1, 26, and 27 have no eyebrow.

1. **Cover.** The mark at 96px plus the display text "Relay". Sub: "Making the next right action obvious, for the people doing the work and the people leading it." Bottom left: "Foundey Senior Product Designer challenge · Izaias · September 2026".
   *Notes:* "This is a redesign of an internal fulfillment dashboard. I'll give the short answer first, then show how far I took it."

2. **The short answer.** Title: "If you only see one slide". Three rows, each a big number and a line:
   - "1. People don't need a longer list. They need to know what to do first, and why."
   - "2. We sort work into three groups by time, show one task at the top, and explain every rank in plain words."
   - "3. Managers see the same work, so they can spot risk and move work. They never see a stopwatch on people."
   To the right, a small low fidelity wireframe thumbnail of the worker home.
   *Notes:* "Everything after this slide supports these three sentences."

3. **The brief.** Title: "Two complaints, one screen". Two large quote cards: "I never know what needs my attention first." (label: Workers) and "I cannot see what each worker is doing." (label: Managers). Caption: "The challenge asks us to rank individual work from most critical to least urgent."
   *Notes:* "Notice the second quote. The challenge sentence only mentions the first. I treated both as the brief."

4. **What the screen does today.** Title: "It already has a ranked list". A frame showing `research/current-dashboard.png` (import it as an asset). Three callouts: "1. Ranked by urgency, but it never says why." "2. Every row is labeled by where it came from." "3. Four equal cards below repeat the same work."
   *Notes:* "This was the surprise. The obvious answer is already on screen, and people still feel lost. So the problem is deeper than sorting."

5. **Statement (dark).** "Sorting is not the same as knowing what to do."
   *Notes:* "Dashboards full of equal widgets are the usual answer. They show everything and decide nothing." (Mention the Wrike and ClickUp references.)

6. **Why it fails.** Title: "Five reasons people still feel lost". A 5 row list, each with a bold phrase and a plain explanation:
   - "No reason. The list is ranked, but nobody can see why, so nobody trusts it."
   - "Wrong labels. Order, Notification, and Comms say where work came from, not what happens if you ignore it."
   - "No first thing. Four rows, four equal buttons."
   - "No finish line. Work disappears silently. There is no done."
   - "Nothing for managers. They walk the floor and ask."
   *Notes:* "Each of these maps to one design decision later in the deck."

7. **Who we designed for.** Title: "Two people, one shift". Two persona cards: "Priya Raman. Outbound Exception Coordinator. Fixes the problems that stop orders reaching a truck. Works at a shared desk by the dock, interrupted every few minutes." and "Danielle Okafor. Shift Operations Manager. Seven people. Lives on the floor, checks the screen in thirty second glances." A small line below: "Out of scope for now: pickers and packers. Their scanners already give them one task at a time."
   *Notes:* "The examples in the brief, like payment mismatches and compliance filings, are desk work. So I designed for the desk first."

8. **The clock that runs the day.** Title: "In fulfillment, trucks set the deadlines". A horizontal timeline 06:30 to 17:00 with a "Now 10:40" marker and four truck markers: UPS 11:30, Amazon Logistics 12:15, FedEx 14:00, USPS 15:30. Caption: "A truck does not wait. Missing it means a whole wave of customers gets their orders late."
   *Notes:* "This is the missing input in the old ranking. Due dates are personal. Truck cutoffs are shared and hard."

9. **Assumptions.** Title: "What we assumed, and how we would check". The table from §3.2, with confidence chips (Validated in done colors, Assumed in next colors, Needs research in fyi colors).
   *Notes:* "None of these are validated yet. The pilot on slide 24 is designed to test them. I also found no real warehouse apps in public pattern libraries, so the fulfillment details come from industry knowledge, not precedent."

10. **Principles.** Title: "Five rules we designed by". A numbered list: "1. One thing first." "2. Always say why." "3. Group by time, not by source." "4. See the work, not the worker." "5. Undo instead of are you sure."
    *Notes:* "When the team disagreed, we came back to these."

11. **Three groups.** Title: "Every task lands in one of three groups". Three columns, each with its tier icon, label, and helper: Do now, "A truck, a person, or many orders are at risk." Up next, "Matters today. A clock is running." Later today, "Real work. Nobody is blocked yet." Below: "For your info never enters the list. It goes to Updates."
    *Notes:* "Named by time because workers think in when, not in severity words like critical or high."

12. **What makes something urgent.** Title: "Four questions decide the order". Four icons with text: "How soon is it due?" "How many orders are waiting on it?" "Will customers feel it?" "Is it about safety or the law?" A highlighted band: "Safety always goes first, no matter what the numbers say."
    *Notes:* "The formula is simple points, and we can explain it in one sentence. That matters more than being clever. Machine learning can come later, once we have data on when people disagree with the ranking."

13. **The proof.** Title: "Same six tasks, different first move". Two columns from §4.2: "Sorted by due time" and "Sorted by Relay". The printer row is highlighted in both columns with a connecting line. Caption: "The printer is not due first, but it blocks 140 orders for the 11:30 truck. It should come first."
    *Notes:* "This is the heart of the design. A small late task should not beat a big blocker that is about to miss a truck."

14. **Low fidelity wireframe: My work.** Title: "The shape of the answer". The low fidelity wireframe of the worker home with 4 callouts: "1. One task at the top, with the reason it is first." "2. Three groups, named by time." "3. A short reason on every row." "4. Trucks and progress on the side, never competing."
    *Notes:* "This is the deliverable the brief asked for. Everything after this is extension."

15. **My work, high fidelity.** Title: "My work". A live frame of `/work` (Priya, 10:40). Callouts: "1. Do this now, and why." "2. Start tells the team what you are working on." "3. Only Do now is tinted red. Color stays rare, so it keeps its meaning." "4. The next trucks are always visible."
    *Notes:* "Paper and ink. Calm by default. Color only where the ranking says so."

16. **Finishing work.** Title: "Finish one thing, the next one is ready". Three small frames in sequence: the hero with "Mark done" pressed; the toast "Done. 5 of 10 done today. Undo"; the next task in the hero. Caption: "No confirm dialogs. Undo is always there for eight seconds."
    *Notes:* "Closure was missing. People need to feel progress during a ten hour shift."

17. **When something new arrives.** Title: "Urgent work never jumps under your cursor". A frame showing the new urgent band inside the hero. Caption: "If you are busy, we tell you and let you choose. If you are away, we move it to the top for you."
    *Notes:* "Lists that reorder while you click cause mistakes. This protects the thing you are about to press."

18. **Low fidelity wireframe: Team.** Title: "The manager's view, in shape". The low fidelity wireframe of Team with callouts: "1. Four numbers that matter right now." "2. What each person is working on." "3. What needs the manager, with one button each."
    *Notes:* "Same priority model, same groups, seen from above."

19. **Team, high fidelity.** Title: "Team". A live frame of `/team` (Danielle, 10:40). Callouts: "1. Kwame is out, and two tasks have no owner." "2. Tomasz's escalation has had no update for 80 minutes. It is flagged as may need help." "3. Assign in two clicks, with undo." "4. Each person's load in words: light, busy, or full."
    *Notes:* "This answers the manager's complaint in a way that helps rather than polices."

20. **See the work, not the worker.** Title: "What managers see, and what they never see". Two columns. "We show": "What each person is working on", "Work that is late or has no owner", "Tasks that may need help", "Trucks at risk". "We never show": "Idle time or time off task", "Keystrokes or screen activity", "Rankings of people", "Break timers". Bottom band: "Everyone sees the same team board. Nothing about people is hidden from them."
    *Notes:* "Warehouse monitoring has faced real public criticism, and several US states now regulate quotas. A dashboard that times people would be risky, and people would game it. Flags attach to tasks, not to people."

21. **Where did my panels go?** Title: "Nothing was removed. It was sorted." The table from §5.2.
    *Notes:* "A common worry in redesigns. Every old panel has a clear new home."

22. **Tradeoffs.** Title: "What we chose, and what we gave up". Two columns, "We chose" and "We gave up":
    - "Three simple groups" / "Fine grained ranking of every item"
    - "A rule we can explain in one sentence" / "The extra accuracy of machine learning, for now"
    - "One big task at the top" / "Seeing more rows without scrolling"
    - "Work visibility for managers" / "Minute by minute tracking of people"
    - "A Start button" / "One extra click per task"
    Bottom band: "Why it is worth it: people act faster on a list they understand and trust."
    *Notes:* "The Start click is the most debatable. Without it, the manager view would be guessing."

23. **Risks.** Title: "What could go wrong". Four rows, a risk and its answer:
    - "Everything becomes Do now." / "High thresholds. We flag anyone with more than three Do now tasks so the manager can rebalance."
    - "People game the ranking." / "Only set roles can escalate. Waiting needs a person and a time. Managers see overrides."
    - "People stop trusting it." / "Every rank has a reason. People can ask for help, say not mine, or hand off, and we review those signals weekly."
    - "Data goes stale." / "An updated time is always visible, with a warning when a feed is late."
    *Notes:* "Overrides are also our best data. If people often push a type of task down, the model is wrong about it."

24. **How we will know it works.** Title: "A four week pilot on one shift". Big numbers with labels: "Under 5 min to first action on Do now tasks", "Fewer orders missing their truck because of an exception", "Under 10 min for work with no owner to find one", "Under 10 s for a manager to say what is at risk". A line below: "Plus a short trust survey: do I understand why tasks are ranked, and do I feel watched?"
    *Notes:* "Run against a control shift at the same site."

25. **Design system.** Title: "A small system, built to stay calm". Left: color swatches (neutrals, the three tiers, the accent). Middle: a type specimen. Right: component thumbnails (hero card, row, time pill, toast, team row), all live renders.
    *Notes:* "Every color has a job. Red appears only where something is truly at risk."

26. **What's next.** Title: "What we would build next". Four items: "Shift handoff that writes itself, so nothing is lost at 17:00." "A handheld version for Problem Solve leads on the floor." "Pinning, once we know how people want to override the order." "Learning from overrides to tune the ranking every week."
    *Notes:* "The handoff one is backed by the data. The printer was flagged at night handoff and nobody acted until it blocked 140 orders."

27. **Try it.** Title: "Try it yourself". The production URL in large tabular type, with a QR code (generate it with the `qrcode` npm package at build time). Small lines: "Tip: open Prototype controls to switch between Priya and Danielle, send an urgent task, or see it in wireframe mode." "Design system: {url}/system".
    *Notes:* "Thank you."

### 12.3 Demo script (README and speaker notes for slide 27)

1. As Priya: read the hero and open "How we sort your work".
2. Mark the printer done. Watch the hazmat task move up, then press Undo, then mark it done again.
3. Prototype controls, "Send a new urgent item". Notice the band. Press "Show me".
4. Switch to Danielle. See NO OWNER 2. Assign order 4790 to Luis (Light). Watch the tile drop to 1.
5. "Check in" on Tomasz. See his queue exactly as he sees it.
6. Turn on Wireframe mode. The ranking is still readable in grayscale.

---

## 13. Figma deliverables

**Blocker to resolve first:** the Figma MCP connector is **not authorized** in this environment. Before starting this section, ask the user to authorize it (claude.ai connector settings, or `/mcp` in an interactive Claude Code session). If it is still not authorized when everything else is done, say so clearly in the final report instead of skipping silently.

Once authorized, load the skills in this order and follow them exactly: `figma:figma-use` (mandatory before any `use_figma` call), then `figma:figma-create-new-file`, `figma:figma-generate-library`, `figma:figma-generate-design`, and `figma:figma-use-slides`.

1. **File "Relay: Design System"** (design file).
   - Variables: collections Color (all tokens from §8.1, grouped neutrals / accent / tiers), Spacing, Radius. Text styles from §8.2. Effect styles e-1 to e-4.
   - Components with variants bound to the variables: Button (variant × size × state), PriorityIcon (tier × size), TimePill (state × size), SourceTag, Chip, TierHeader, PriorityRow (tier × state), HeroCard (tier × state, including the new urgent band), Toast, RiskTile, TeamRow (status), LoadLabel, Avatar, Drawer shell.
   - Pages: Cover, Foundations, Components, Patterns (priority model table).
2. **File "Relay: Prototype"** (design file), built from those components.
   - Frames at 1440×1024: Work (10:40), Work drawer open, Work after done (toast), Work new urgent band, Work all caught up, Team (Danielle), Team person drawer, Reassign popover, How we sort modal.
   - Frames at 390×844: Work handheld, Team handheld.
   - Also the two low fidelity wireframes.
   - Add prototype links for the done flow and the reassign flow. Put the live URL in the cover frame.
3. **File "Relay: Deck"** (Figma Slides, 1920×1080), rebuilt with native text using the copy from §12.2 and the same styles. For product visuals, use the frames from file 2. Fallback if time runs out: import `exports/slides/slide-XX.png` as full-bleed images and state that in the report.
4. Put all three Figma links in `README.md` and on the `/system` page.

---

## 14. Acceptance checklist

### 14.1 Functional
- [ ] All tests in §10.6 pass. `npm run build` passes (copy check, tests, build).
- [ ] At 10:40 as Priya, the hero is "Label printer offline at Pack 7", with the button "Mark done" and "Working on it · 16 min".
- [ ] The greeting meta line reads "2 things need you now. 4 of 10 done today." The My shift ring reads "4 of 10 done".
- [ ] The Do now list shows the it-03 row. The Up next list shows the it-04, it-05, and it-13 rows. Later today is collapsed by default (the other tiers hold 4 rows), and its header reads "Later today" with count 1. Expanding it shows it-11.
- [ ] Mark done promotes it-03, the toast shows, Undo restores, and focus moves correctly.
- [ ] "Send a new urgent item" shows the band while the user is active, and auto-promotes after 8 s idle.
- [ ] As Danielle: tiles read 4 / 1 / 2 / UPS 11:30 with 236 at risk. Board sort: Tomasz (flagged) first. Assigning it-10 to Luis updates the tiles, board, and Needs you, and Undo works.
- [ ] The worker Team board is read only and shows the mirror note.
- [ ] Reload keeps the state. "Reset demo" restores the seed.
- [ ] The deck: arrow keys work, `/deck/print` renders 27 pages, and `exports/relay-deck.pdf` exists.

### 14.2 Visual
- [ ] No raw hex outside tokens.css (`grep -rn "#[0-9A-Fa-f]\{6\}" src --include=*.tsx` returns nothing).
- [ ] In Wireframe mode, every tier is still distinguishable by icon and label.
- [ ] The 3 second test: a screenshot of `/work` answers "what first, and why" without reading a second row.
- [ ] 1440, 1280, and 390 widths have no horizontal scroll. At 390 every target is at least 48px.

### 14.3 Accessibility
- [ ] Tier headers are `h2`. The queue is a `ul` of `li`. The cause line is part of the row's accessible name.
- [ ] The full done flow works with the keyboard only (Tab, J, K, E, Z).
- [ ] The toast uses `role="status"`. The new urgent live region is polite.
- [ ] Reduced motion is honored (test with emulation).
- [ ] Text contrast is AA or better (use the token pairs as given).

### 14.4 Copy
- [ ] `npm run check:copy` passes. No dashes in the UI or the deck.
- [ ] Buttons start with a verb. No "Review", "OK", or "Submit".

---

## 15. Build order (milestones, commit after each)

1. **Scaffold:** git init with the owner config, Vite + React + TS + Tailwind, tokens.css, copy.ts, seed.ts, and the `vercel.json` rewrite. Commit.
2. **Priority engine:** `priority.ts`, `time.ts`, and the tests green. Commit.
3. **State:** the store with all actions, persistence, and the sim clock. Commit.
4. **Components:** §8.3 in isolation, plus the `/system` page. Commit.
5. **My work:** hero, list, drawer, all clear, the done flow, the new urgent band, the rail. Commit.
6. **Team:** tiles, board, Needs you, person drawer, reassign. The worker read-only board. Commit.
7. **Updates, Look up, handheld layout, Prototype controls, Wireframe mode.** Commit.
8. **Deploy v1:** `gh repo create`, `vercel --prod`. Record the URL. Commit.
9. **Deck:** slides, wireframes, print route, export script, QR with the prod URL. Redeploy. Commit.
10. **QA:** run §14 fully and fix everything. Redeploy. Commit.
11. **Figma:** §13 (needs authorization).
12. **Final report to the user:** the URLs (prototype, deck, system, GitHub, Figma x3), what was verified, and anything skipped with its reason.
