# IA and Cognitive Accessibility Advisory: Fulfillment Ops Dashboard

Advisor lens: information architecture, priority modelling, cognitive accessibility.
Audience: lead designer, then a low cost model that will implement the prototype. Everything below is meant to be implemented literally.

---

## 0. The one line answer

The current screen already has "one ranked queue", and people still say "I never know what needs my attention first." So ranking is not the missing piece. What is missing is **trust, chunking and closure**: the queue does not say *why* something is first, it groups by *where the item came from* instead of *what happens if I ignore it*, it offers four equal "next" buttons instead of one, it never tells you that you are done, and managers get nothing at all.

Our answer: **one priority model, three plain time tiers, one "next task" card, a visible reason on every row, a real done state, and a Team view that reads the same data the worker produces by pressing Start.**

---

## 1. Why the existing "Needs your attention" panel fails (hypothesis to fix map)

This table is the core of the "we clear the existing bar" argument. Put it on a slide.

| # | Problem in current screen | Evidence in the screenshot | Our fix |
|---|---|---|---|
| H1 | Ranking is unexplained, so nobody trusts it | Label says "ranked by urgency" but rows show only a colored dot and a due chip | Every row carries a one line reason ("Holding up 12 orders"). A "How we sort your work" link explains the rules in 4 lines (pattern: Linear "Why am I seeing this?") |
| H2 | Labels by SOURCE, not CONSEQUENCE | Chips say ORDER, NOTIFICATION, COMMS | Tiers are named by time and consequence: **Do now / Before shift ends / When you have time**. Source becomes a small secondary label at row end |
| H3 | No single clear "do this now" | 4 rows, each with its own Review or Open button of equal weight | One **Next task** card at the top with one big primary button. The list below has quieter buttons |
| H4 | No progress or done state | Count "(6)" only goes down silently; no end | "4 of 11 done today" progress line, completed items move to a collapsed "Done today" group, and a real all clear screen |
| H5 | Overwhelm from 5 competing regions | Queue plus 4 equal "reference" cards of the same visual weight | The 4 cards are removed from home. FYI content is merged into one **Updates** page, summarised on home as one line: "5 updates. Nothing needs action." |
| H6 | Navigation duplicates the dashboard | Nav has Orders, Notifications, Team Comms that repeat the cards | Nav cut from 6 to 3 items for workers (4 for managers). See section 4 |
| H7 | Red and amber only differ by color | Dots are the only tier signal | Tier is always shown as header text plus icon plus color. Never color alone |
| H8 | Zero manager surface | Nothing about other people anywhere | **Team** view: who is doing what right now, who is blocked, what is late, reassign in two taps |
| H9 (new) | "Doing" does not exist as data, so managers cannot see it | No Start action, only Review | Explicit **Start** button creates the "Working on it" state that feeds the manager view |

---

## 2. Priority model

### 2.1 Principle
Tiers are the primary grouping. The score only orders items *inside* a tier. The existing design failed with a flat ranked list of 6; the accessibility win is **3 small groups of 2 to 3 items**, not a smarter sort. People can hold 3 groups in mind; they cannot hold a ranked list of 11.

### 2.2 The three tiers (plus two non tiers)

| Tier | Exact name in UI | Icon | Color token | Plain definition shown in "How we sort your work" |
|---|---|---|---|---|
| 1 | **Do now** | filled circle with exclamation | red (`--tier-now`) | "Late, or holding other people up, or due within the hour." |
| 2 | **Before shift ends** | clock | amber (`--tier-today`) | "Needs to be done before you leave today." |
| 3 | **When you have time** | open circle | neutral gray (`--tier-later`) | "No rush. Nothing is waiting on it today." |
| none | **Done today** | check | green | Completed this shift. Collapsed by default. |
| none | **Updates** | bell | neutral | For your information. Never needs action. Lives on its own page. |

Rationale for names: they answer the only question the worker has ("when?") in words a new hire understands on day one. "Critical / High / Medium / Low" was rejected because it asks the reader to interpret severity; "Urgent" was rejected because everything in fulfillment feels urgent. Tier 2 references the shift because fulfillment work is shift bound.

### 2.3 Tier entry rules (deterministic, evaluated in this order, first match wins)

Assume every item has: `dueAt`, `now`, `shiftEndsAt`, `blocksCount` (number of orders or people waiting on it), `isSafetyOrCompliance`, `isEscalated` (a manager or lead pushed it), `customerPromiseToday` (carrier cutoff or promised ship date is today), `mentionedMe`, `createdAt`, `state`.

1. `state == done` → **Done today** (if completed this shift), otherwise hidden.
2. `state == snoozed` and `snoozeUntil > now` → hidden from tiers, shown in "Moved to later" count at the bottom of tier 3.
3. `dueAt < now` (late) → **Do now**
4. `dueAt - now <= 60 min` → **Do now**
5. `blocksCount >= 5` → **Do now**
6. `isSafetyOrCompliance && dueAt <= shiftEndsAt` → **Do now**
7. `dueAt <= shiftEndsAt` → **Before shift ends**
8. `isEscalated` → **Before shift ends**
9. `blocksCount >= 1` → **Before shift ends**
10. everything else → **When you have time**

Items with no action for this user (FYI comms, status notifications, activity logs) never enter tiers. They go to **Updates**.

### 2.4 Score (orders items inside a tier only)

Integer points, summed:

| Input | Points |
|---|---|
| Late (past `dueAt`) | 50, plus 5 per full 30 min late, capped at +20 extra |
| Due within 60 min | 30 |
| Due before shift ends (and not the above) | 15 |
| Safety or compliance | 40 |
| Blocks others | 6 per blocked order or person, capped at 30 |
| Customer promise is today (carrier cutoff) | 15 |
| Escalated by a manager or lead | 20 |
| Someone asked me directly (mention, question) | 5 |
| Waiting age | 1 per 30 min since created, capped at 10 |

**Tie break order:** higher score, then earlier `dueAt`, then earlier `createdAt`, then lower item ID. Always stable; never random.

### 2.5 The "why" line (one per row, always visible)

Pick the single input that contributed the most points and render its template. If two inputs tie, use the order in the table above. Max 45 characters. No jargon, no dashes.

| Winning input | Template | Example |
|---|---|---|
| Late | `Late by {relative}. {promise clause}` | "Late by 2 hours. Customer was promised today." |
| Due within 60 min | `Due in {minutes} min` | "Due in 40 min" |
| Safety or compliance | `Safety check. Due by {clock}` / `Required by law. Due {day}` | "Safety check. Due by 3 PM" |
| Blocks others | `Holding up {n} orders` / `{name} is waiting on you` | "Holding up 12 orders" |
| Customer promise today | `Must ship before the {clock} truck` | "Must ship before the 4 PM truck" |
| Escalated | `{name} asked for this today` | "Priya asked for this today" |
| Mentioned me | `{name} asked you a question` | "Jon asked you a question" |
| Due before shift ends | `Due by {clock}` | "Due by 5 PM" |
| Nothing notable | `No deadline` | "No deadline" |

The full breakdown ("Why is this here?") opens on tap: a small panel listing every contributing reason as plain sentences with check marks, no numbers. Points are an implementation detail; never show scores to workers.

### 2.6 Worked example (now = 1:00 PM, shift ends 6:00 PM)

| Item | Inputs | Tier (rule) | Score | Why line |
|---|---|---|---|---|
| Order 4821 payment mismatch | due 11:00 AM (2h late), blocks 12 orders, promise today | Do now (rule 3) | 50+20+30+15+4 = **119** | "Holding up 12 orders" (30) loses to Late (70) → "Late by 2 hours. Customer was promised today." |
| Dock 3 safety check | due 3:00 PM, safety | Do now (rule 6) | 15+40+1 = **56** | "Safety check. Due by 3 PM" |
| Order 4830 relabel | due 1:40 PM, promise today | Do now (rule 4) | 30+15+1 = **46** | "Due in 40 min" |
| Order 4796 rush shipping | due 4:00 PM, promise today, escalated | Before shift ends (rule 7) | 15+15+20+2 = **52** | "Priya asked for this today" |
| Client escalation thread | Jon mentioned me, no due, blocks 1 person | Before shift ends (rule 9) | 6+5+6 = **17** | "Jon is waiting on you" |
| Cycle count aisle 12 | due 5:30 PM | Before shift ends (rule 7) | 15+3 = **18** | "Due by 5:30 PM" |
| Annual compliance report | due in 9 days, compliance | When you have time (rule 10) | 40+2 = **42** | "Required by law. Due Oct 1" |
| Update packing notes | no due | When you have time | **4** | "No deadline" |

Resulting screen order: Do now = 4821, Dock 3, 4830. Before shift ends = 4796, Cycle count, Client thread. When you have time = Compliance report, Packing notes. Note: the brief's "Compliance alert, annual report filing due today" would land in Do now via rule 6 if truly due today; the model handles both.

---

## 3. One shared state machine (both personas read it)

Every actionable item has exactly one `state`:

| State | UI label (worker) | UI label (manager) | How it is entered |
|---|---|---|---|
| `open` | (no label) | Not started | Default |
| `in_progress` | Working on it | Working on it for {n} min | Worker presses **Start**. Opening or reading an item does NOT count |
| `waiting` | Waiting on {name or team} | Blocked: waiting on {name} | Worker presses **I'm stuck** and picks a reason |
| `snoozed` | Moved to {time} | Moved to later by {name} | Worker presses **Move to later** |
| `done` | Done | Done at {clock} | Worker presses **Mark done** |

Rules:
- A worker can have **only one** `in_progress` item. Pressing Start on another item returns the previous one to `open` and shows "Paused Order 4821" with Undo.
- `waiting` items stay in their tier but sink to the bottom of it, dimmed, with the waiting label. They count as blocked on the manager view.
- Manager "Idle" is derived: worker on shift, no `in_progress` item for 15 min or more. It is shown neutrally ("Not on a task for 20 min"), never as "Idle" or red, to avoid a surveillance tone.
- Snooze is not allowed on items that are late or safety (rules 3 and 6). The option is shown disabled with the reason "Late items can't be moved. Ask for help instead."

---

## 4. Navigation and screen inventory

### 4.1 Decision: one app, role aware, no toggle
One app. Everyone gets **My work** as home. Managers and leads additionally get a **Team** item. No role switcher: a toggle hides one view behind the other, and managers also have their own tasks. Both views render the same item component and the same tiers, so a manager looking at a worker sees exactly what that worker sees.

### 4.2 New nav (replaces Dashboard, Orders, Notifications, Team Comms, Reports, Settings)

| Worker nav | Manager nav | What it replaces |
|---|---|---|
| **My work** | **My work** | Dashboard |
| | **Team** | new; absorbs Reports (as a "This week" tab inside Team) |
| **Updates** | **Updates** | Notifications + Team Comms + Recent Activity, merged, FYI only |
| **Look up** | **Look up** | Orders (reference lookup of any order, person, ticket) |

- Settings moves to the avatar menu (top right). It is rarely used and should not compete with work.
- The global search bar stays in the header on every page ("Search orders, people, tickets").
- Rationale: nav items are now *jobs* (do my work, watch my team, catch up, look something up), not *data sources*. Anything actionable from Notifications or Comms is already in My work; the nav no longer offers a second path to the same item.
- Handheld (iOS) worker app: bottom tab bar with the same 3 items. Managers get 4.

### 4.3 Screen inventory

| Screen | Persona | Purpose | Priority for 1 hour answer |
|---|---|---|---|
| My work (home) | Worker, manager | Ranked, tiered personal queue with Next task card | Core |
| Item detail (side panel) | Both | Full info, why breakdown, actions, history | Core (simple) |
| All clear state | Worker | Closure | Core |
| "How we sort your work" panel | Both | Trust | Core |
| Team | Manager | Live status per person, team risk, reassign | Core |
| Person panel (from Team) | Manager | That worker's queue, read only, plus Move task | Core |
| Give to someone (reassign sheet) | Manager, worker handoff | Pick a teammate by load | Extension |
| I'm stuck sheet | Worker | Ask for help with reason | Extension |
| Move to later sheet | Worker | Snooze with plain times | Extension |
| Updates | Both | Batched FYI | Extension |
| Where you left off banner | Worker | Interruption recovery | Extension |
| End of shift handoff | Worker | Pass open items to next shift | Extension |
| This week (inside Team) | Manager | Trends, replaces Reports | Extension |

---

## 5. Worker home ("My work"), top to bottom

Desktop width reference 1280. Everything above the fold at 800px height must fit: header, greeting line, Next task card, Do now group.

1. **Header** (existing): logo, search, avatar. Keep.
2. **Greeting and status line** (one line, 20px): "Good afternoon, Ana. 3 things need you now." Right side: progress "4 of 11 done today" with a thin bar. The sentence changes with state:
   - Do now count > 0: "{n} things need you now."
   - Do now = 0, today > 0: "Nothing urgent. {n} left before your shift ends."
   - All zero: all clear state (below).
3. **Next task card** (the single most important element). Always the top item of the highest non empty tier. Contains:
   - Tier label with icon ("Do now")
   - Title, max 60 characters ("Order 4821 payment mismatch")
   - Why line, larger than normal (18px) ("Late by 2 hours. Customer was promised today.")
   - Primary button, 48px tall: **Start** (becomes **Mark done** once in progress; shows "Working on it for 12 min")
   - Secondary text buttons: **I'm stuck**, **More** (menu: Move to later, Give to someone, Open details)
   - Source label small and last: "From: Orders"
4. **Do now** group: header "Do now (3)" with icon. Shows remaining items (the Next task card counts as item 1 and is not repeated). Max **3 rows visible**; more collapse behind "Show 2 more".
5. **Before shift ends** group: max **3 rows visible**, rest behind "Show {n} more".
6. **When you have time** group: **collapsed by default**, header shows count: "When you have time (4)". Includes "Moved to later (2)" line at its bottom.
7. **Done today** group: collapsed, "Done today (4)". Expanding shows completed items with time and an Undo for the last 5 minutes.
8. **Updates line** (one row, not cards): "5 updates for you. Nothing needs action. See updates". Links to Updates page.

Budgets:
- Max **7 actionable rows visible** on first load including the Next task card (1 + 3 + 3).
- Each row: tier icon, title (1 line, truncate at 60 chars), why line (1 line), one button on the right (**Start** or **Open**), row min height 64px, whole row clickable to open details.
- One primary button on the whole page (Next task card). Row buttons are secondary style.

### 5.1 List stability (important and often missed)
Rows must never move under the user's cursor or finger. When the model re ranks (new item arrives, time passes):
- Do not reorder while the page is in focus and the user acted in the last 10 seconds.
- Show a quiet bar at the top of the affected group: "1 new item. Show it" and announce via `aria-live="polite"`.
- Exception: a new **Do now** item that outranks the Next task card shows a banner above the card: "New: Dock 3 safety check moved to the top." with **Show me**. It never replaces the card silently while the user is working on something.

### 5.2 After completing an item
1. User presses **Mark done**.
2. Row animates out (200ms), toast appears bottom left for **8 seconds**: "Done. Order 4821 moved to Done today. Undo"
3. The next item slides into the Next task card. Focus (keyboard and screen reader) moves to its primary button.
4. Progress line updates ("5 of 11 done today").
5. No confirm dialog, ever, for completion. Undo replaces confirm.

### 5.3 All clear state
Replaces the Next task card area. Calm, not confetti.
- Heading: "You're all caught up"
- Body: "Nothing needs you right now. We'll show new work here as soon as it comes in."
- Secondary: "Done today: 11 tasks" and a link "Help your team" (shows unassigned items the manager has opened to anyone) and "See updates".
- If only tier 3 remains: heading "Nothing urgent", body "You have 4 tasks with no rush. Pick one when you're ready." with the tier 3 group expanded.

### 5.4 Snooze, hand off, ask for help
- **Move to later** sheet options: "In 1 hour", "Later this shift (4 PM)", "Next shift", "Pick a time". Disabled for late or safety items with reason.
- **I'm stuck** sheet: "What's stopping you?" choices: "I need information", "Something is broken", "I need another person", "Other". Optional note. Button: **Send to Priya** (manager name). Item becomes `waiting`. Manager gets it in their Team "Needs you" list.
- **Give to someone** (worker handoff): only allowed to teammates on shift; shows each person's load in words ("Light", "Busy", "Full"). Requires a note for items in Do now.

### 5.5 Interruption recovery ("Where you left off")
Trigger: returning to the tab after 5 min away, reload, or logging back in on a shared terminal while an item is `in_progress`.
Banner above Next task card: "Welcome back. You were working on Order 4821." Buttons: **Keep going** (primary) / **Pick something else**.

---

## 6. Manager view ("Team")

Principle: answer "what is each person doing, and where do I need to step in" in one screen, using the same tiers.

Top to bottom:

1. **Team status line**: "Afternoon shift. 9 people on shift. 3 late items. 2 people stuck."
2. **Risk chips** (clickable filters, each text plus icon plus count; zero chips hidden):
   - "3 late items"
   - "2 people stuck"
   - "1 person has too much"
   - "4 items with no one on them"
   - "2 at risk of missing the truck"
3. **Needs you** (manager's own actionable queue, same row component, same tiers applied to team level items): stuck requests, escalations, unassigned Do now items, suggested moves. Example rows:
   - "Sam is stuck on Order 4790. Waiting 25 min." button **Help Sam**
   - "Order 4833 has no one on it. Late by 20 min." button **Give to someone**
   - "Ana has 5 items in Do now." button **Balance load**
4. **Roster** (one row per person, default sort by risk: stuck, then most Do now items, then not on a task, then others alphabetically). Columns:
   - Person (name, photo or initials, role or zone)
   - **Right now**: "Working on Order 4821 for 12 min" / "Stuck: waiting on IT" / "Not on a task for 20 min" / "On break" / "Off shift"
   - **Do now** count, **Before shift ends** count (numbers with tier icon)
   - **Done today** count
   - **Load** in words: Light / Busy / Full (Full also gets an icon)
   - Row action: **See their work**
5. **Person panel** (side panel on row click): exactly the worker's My work, read only, same tiers and why lines, plus per item action **Give to someone** and a panel action **Send a message**.
6. **This week** tab: throughput, late rate, stuck time. Replaces the old Reports nav item.

### 6.1 Load rule (deterministic)
`loadPoints = 3 × DoNowCount + 1 × BeforeShiftEndsCount` (tier 3 ignored)
- Light: 0 to 5
- Busy: 6 to 11
- Full: 12 or more, or DoNowCount >= 4

### 6.2 Reassign flow ("Give to someone")
1. Manager presses **Give to someone** on any item (in Needs you, person panel, or item detail).
2. Sheet titled "Who should do this?" lists people on shift, sorted Light first, each row: name, load word, "2 in Do now", zone or skill match tag ("Works in Returns").
3. One tap on a person moves it. No confirm. Toast: "Moved to Sam. Undo" (8 s).
4. Sam's queue receives it with why line override: "Priya sent you this. {original reason}" and it is escalated (+20).
5. Optional "Add a note" field in the sheet, never required for managers.

---

## 7. Cognitive accessibility rules (numbers the implementer must follow)

Reading and language
1. Reading level: grade 6 or lower (Flesch Kincaid). Sentences 12 words max in UI copy.
2. Titles 60 characters max, why lines 45 characters max, button labels 3 words max.
3. No internal jargon in primary text (no "SLA", "exception", "P1", "WMS"). Jargon allowed only in item detail.
4. No dashes or em dashes in any UI copy. Use periods.
5. Buttons are verb first: Start, Mark done, Move to later, Give to someone, Help Sam. Never "OK", "Submit", "Review" alone.

Time
6. Relative time in plain words under 6 hours: "in 40 min", "Late by 2 hours". Clock time beyond 6 hours or for deadlines tied to trucks: "by 4 PM", "Due Oct 1". Never "T minus", ISO dates, or "2h ago" style abbreviations except "min".

Visual and interaction
7. Never color alone: tier = icon + text header + color. Status = text label.
8. Targets: 44 × 44 px minimum, 48 px tall for the primary button, 8 px minimum between targets. Handheld: 48 px minimum everywhere (gloves).
9. Body text 16 px minimum, meta text 14 px minimum, why line on Next task card 18 px. Contrast 4.5:1 for all text, 3:1 for icons.
10. One primary action per row and one primary button per screen.
11. Consistent positions: the primary action is always on the right of a row, the Next task card is always at the top, tier order never changes.
12. Max 7 actionable rows visible on load; groups beyond 3 items collapse.
13. Rows never jump while being looked at (see 5.1).

Safety nets
14. Undo over confirm. Undo toast lasts 8 seconds (longer than the typical 4 to 5) and is keyboard reachable. Confirm dialogs only for actions that cannot be undone (none exist in the worker flow).
15. Interruption recovery banner after 5 minutes away.
16. Snooze blocked for late and safety items, with a stated reason, so users cannot hide real risk by accident.

Notifications
17. Interrupt (banner, sound optional) only when a new item enters Do now. Everything else is batched into Updates and summarised in one line. Max one interruptive banner at a time; newer ones queue.
18. Updates groups: "For you", "Your team", "Company". Each group collapses after 3 items.

Screen readers and keyboard
19. Tier headers are real headings (h2). Rows are list items. The why line is part of the row's accessible name.
20. After Mark done, focus moves to the new Next task card button. Keyboard shortcuts optional: J/K move, S start, D done, U undo (shown in a "Keyboard help" panel, not required).

---

## 8. Copy deck (plain English, no dashes)

### Page titles and nav
- Nav: "My work", "Team", "Updates", "Look up"
- Page titles: "My work", "Team", "Updates", "Look up"
- Search placeholder: "Search orders, people, tickets"

### Greeting line
- "Good morning, {name}. {n} things need you now."
- "Good afternoon, {name}. 1 thing needs you now."
- "Nothing urgent. {n} left before your shift ends."
- Progress: "{done} of {total} done today"

### Tier headers and helper text
- "Do now" helper: "Late, holding others up, or due within the hour."
- "Before shift ends" helper: "Needs to be done before you leave today."
- "When you have time" helper: "No rush. Nothing is waiting on it today."
- "Done today"
- "Moved to later ({n})"
- Expander: "Show {n} more" / "Show less"

### Next task card
- Label: "Your next task"
- Buttons: "Start", "Mark done", "I'm stuck", "More"
- In progress meta: "Working on it for {n} min"
- Source label: "From: Orders" / "From: Alerts" / "From: Team chat"

### Row buttons
- "Start", "Open", "Reply", "Help Sam", "Give to someone"

### Why lines (samples)
- "Late by 2 hours. Customer was promised today."
- "Holding up 12 orders"
- "Safety check. Due by 3 PM"
- "Due in 40 min"
- "Must ship before the 4 PM truck"
- "Priya asked for this today"
- "Jon is waiting on you"
- "Required by law. Due Oct 1"
- "Priya sent you this. Due by 5 PM"
- "No deadline"

### Sample row titles (rewritten from the brief, no dashes)
- "Order 4821 payment mismatch"
- "Dock 3 safety check"
- "Order 4796 rush shipping request"
- "Client escalation thread"
- "Annual compliance report"

### "How we sort your work" panel
- Title: "How we sort your work"
- Body: "We put your work in three groups. Do now is anything late, holding other people up, or due within the hour. Before shift ends is anything due today. When you have time is everything else. Inside each group, the thing that matters most is on top."
- Link on each row detail: "Why is this here?"
- Why panel title: "Why this is in Do now"
- Why panel reasons: "It is 2 hours late." / "12 orders are waiting on it." / "The customer was promised it today."

### Toasts
- "Done. {item} moved to Done today." [Undo]
- "Paused {item}." [Undo]
- "Moved to {time}." [Undo]
- "Sent to {manager}. They'll get back to you." 
- "Moved to {name}." [Undo]

### Sheets
- Move to later title: "When should this come back?" Options: "In 1 hour", "Later this shift ({clock})", "Next shift", "Pick a time". Disabled reason: "Late items can't be moved. Ask for help instead."
- I'm stuck title: "What's stopping you?" Options: "I need information", "Something is broken", "I need another person", "Other". Note placeholder: "Add a note (optional)". Button: "Send to {manager}"
- Give to someone title: "Who should do this?" Load words: "Light", "Busy", "Full". Note placeholder: "Add a note" Button per person: the person row itself.

### Banners
- New urgent: "New: {item} moved to the top." [Show me]
- Re rank: "1 new item." [Show it]
- Where you left off: "Welcome back. You were working on {item}." [Keep going] [Pick something else]

### Empty and all clear states
- All clear: "You're all caught up" / "Nothing needs you right now. We'll show new work here as soon as it comes in." Links: "Help your team", "See updates"
- Only tier 3 left: "Nothing urgent" / "You have {n} tasks with no rush. Pick one when you're ready."
- Updates empty: "No updates" / "When something changes, it will show up here."
- Done today empty: "Nothing done yet today. Your first task is at the top."
- Team, nobody at risk: "Your team is on track" / "No late items and no one is stuck."
- Needs you empty (manager): "Nothing needs you right now"

### Updates line on home
- "{n} updates for you. Nothing needs action." [See updates]
- "No new updates"

### Team view
- Status line: "{shift} shift. {n} people on shift. {x} late items. {y} people stuck."
- Chips: "{n} late items", "{n} people stuck", "{n} person has too much", "{n} items with no one on them", "{n} at risk of missing the truck"
- Right now column: "Working on {item} for {n} min", "Stuck: waiting on {who}", "Not on a task for {n} min", "On break", "Off shift"
- Needs you rows: "{name} is stuck on {item}. Waiting {n} min.", "{item} has no one on it. Late by {n} min.", "{name} has {n} items in Do now."
- Buttons: "See their work", "Help {name}", "Give to someone", "Balance load", "Send a message"

### End of shift handoff (extension)
- "Your shift ends in 30 min. You have 2 open tasks." [Hand them off] [Keep them]
- Handoff sheet: "Who takes these next?" Note placeholder: "Anything they should know?"

---

## 9. Tradeoffs, assumptions, and expected disagreements

### Assumptions
1. Source systems expose due time, carrier cutoff, blocked counts, and safety or compliance flags. If they don't, the prototype fakes them with seed data; the model does not change.
2. Workers use a shared desktop terminal plus a handheld. Many are new, seasonal, or reading English as a second language. Design for the least experienced worker on day three.
3. A team is 8 to 15 people per manager per shift.
4. A worker has between 5 and 20 actionable items per shift. Above 20 the tiers still hold, the collapse rules do the work.
5. Managers want to intervene on exceptions, not supervise minute by minute.

### Tradeoffs I chose
- **Tiers over pure ranking.** We lose some precision (item 8 in a strict rank vs item 2 in tier 2 feel the same), and gain comprehension. Worth it.
- **Rule based tiers, not score thresholds.** Rules are explainable in one sentence each; thresholds are not. Score is kept only for in tier ordering.
- **Explicit Start button.** Adds one tap per task. Without it the manager view has no truthful "doing now" data. Worth it, and it gives the worker a sense of commitment.
- **Removing the reference cards from home.** Some users will miss the glanceable feed. Mitigated by the one line Updates summary and the Updates page.
- **Neutral "Not on a task" instead of "Idle".** Less alarming signal for managers; protects trust with workers, which protects adoption.

### Where I expect to disagree with the visual designer, and my position
1. **Visible why line on every row vs tooltip.** Visual will want cleaner rows with the reason in a hover. My position: the why line is always visible, one line, in secondary text color. It is the core fix for H1; hover does not exist on handhelds or touch terminals. I will accept lighter weight and smaller size (14px) on list rows, not hiding it.
2. **Color intensity.** Visual may want red row backgrounds for Do now. Position: rows stay neutral; color lives in the tier header, icon, and a 4px left edge. Full red rows at scale create alarm fatigue and fail for color blind users.
3. **Source chip at the start of the row.** Visual may keep it for scannability. Position: source goes last and small ("From: Orders"). The first thing read must be the consequence.
4. **Next task card looks redundant with the list.** Position: keep it. It is the direct answer to "what first". It is removed from the list below so nothing appears twice.
5. **Celebration on all clear.** Visual may want confetti or illustration. Position: calm check icon and a sentence. The shift continues; new work may arrive in minutes.
6. **Density for managers.** Visual may want a card grid of people. Position: a table style roster. Managers scan 8 to 15 people and compare numbers; rows compare better than cards.
7. **Icons without labels in nav or chips.** Position: always label. Icon only controls fail the least tech savvy users.

---

## 10. What goes in the "1 hour answer" vs the extension

**1 hour answer (deck opens with this):**
- Problem restated: ranking already exists, trust and closure do not (section 1 table, short form).
- Three tiers named by time, entry rules in one sentence each.
- Why line on every row.
- Worker home wireframe: greeting line, Next task card, 3 tiers with caps, done state.
- Manager Team wireframe: status line, risk chips, roster with "Right now" column.
- Shared state (Start / Stuck / Done) linking the two.

**Extension (labelled as such):**
- Full scoring table and worked example.
- Snooze, stuck, reassign, handoff sheets.
- List stability rules and interruption recovery.
- Updates page and notification batching.
- Full copy deck, accessibility spec, handheld variant, This week analytics.

---

## 11. Mobbin references (what to steal)

Trust and explanation
- [Linear Pulse, "Why am I seeing this?" menu](https://mobbin.com/screens/b4daf53d-35b6-4c7c-a237-91793e4e241d): the anchor pattern for H1. A plain question that reveals the rule behind placement. Our "Why is this here?"
- [Zendesk "Tickets requiring your attention (27) What is this?"](https://mobbin.com/screens/f2e7d89f-72b1-4da1-8820-fd9bd4df3350): header count plus inline explainer link, and priority group labels ("Priority: Urgent", "Priority: Normal") as section headers. Steal the header link; replace severity words with time words.
- [Rox "Here's your focus for today" + Recommended action with Reasoning](https://mobbin.com/screens/3592c1b2-8633-44fe-9faa-0111b8c64f3e): recommendation paired with a collapsible "Reasoning". Model for the why panel.
- [Circle "How do points work?"](https://mobbin.com/screens/d2ab497c-5477-4f03-a672-745bc497bc00) and [Fiverr "How the level system works"](https://mobbin.com/screens/48487271-80dd-42b1-82f0-b040fe9c5260): short, sectioned rule explainers. Template for "How we sort your work" (keep ours to 4 lines).
- [Upwork badge requirements](https://mobbin.com/screens/d5fa6e3d-0e96-438c-b6fe-003c0b67a0cd): reasons as a check mark list. Use for the per item why panel.

Consequence based grouping
- [Slite "Where you're needed (9) / Nice to see"](https://mobbin.com/screens/5da0de72-bedb-4c86-9cc9-905eb129b95d): the best example of splitting by consequence instead of source. Direct inspiration for separating My work from Updates.
- [Semrush Errors / Warnings / Notices with "How to fix"](https://mobbin.com/screens/0f5eb2f2-aa33-4170-998c-0754c86f0b82): three tiers with text label, count and colored rule; every row has one action. Steal the tier header pattern.
- [ClickUp Inbox Primary / Other / Later / Cleared](https://mobbin.com/screens/bc8a4bb6-6f82-4001-a0d4-4ffa237149fd): plain why strings per row ("Task is overdue. Due date was 2 days ago"). Proof that a sentence reads better than a chip.
- [Asana Inbox batched groups "Your overdue tasks from the past week"](https://mobbin.com/screens/97d38ac9-183b-4602-a52c-eeaa774a5e6a): batching many notifications into one grouped card. Model for Updates batching.

Time grouped task lists
- [Todoist Today with Overdue group and "Reschedule"](https://mobbin.com/screens/858c686b-66b3-4283-8f26-4a6f82b45b7b): group level action on the late group; quiet visual style. Steal the calm density.
- [Attio Tasks grouped Today / This week / Upcoming / Completed](https://mobbin.com/screens/16b2e7b2-da40-4dc2-a63b-139c3078c1d9): relative due text colored by urgency ("Due 4 days ago") plus completed group at the bottom. Model for our Done today group.
- [Evernote Tasks Today / Tomorrow / Next 7 days](https://mobbin.com/screens/7490b881-151e-4aed-abb8-718c04986d1c): collapsible time groups with counts.

One next thing
- [Trello Home "Up next" card with Complete and Dismiss](https://mobbin.com/screens/2c5ee210-5a6a-47b0-add5-5e65dcbc7113): a single highlighted next item above the list with two clear actions. Closest reference to our Next task card.
- [Jobber iOS big "Complete Task" button](https://mobbin.com/screens/9b0b8867-bb54-490a-a96c-bbaa1bbdb70a): full width primary action for field workers. Handheld primary button spec.
- [Angi "Done with this task? Yes, check it off / Not yet"](https://mobbin.com/screens/309f6856-ed73-4b68-91ce-c278be25182d): friendly plain language completion. Tone reference (we still prefer undo to confirm).
- [CVS Health visit checklist "Action Needed / Completed"](https://mobbin.com/screens/5367bf1b-68be-434d-825e-33fa368bfd42): status as text chips plus icons, huge rows, very low literacy demand. Accessibility benchmark.

Completion, undo, closure
- [Todoist complete with "Task completed / Undo" toast](https://mobbin.com/flows/6073b644-4dd5-4060-86fd-11848d6cab23): row leaves, toast offers undo. Our completion flow.
- [Charma "Item completed! Undo"](https://mobbin.com/flows/c711020f-6ff2-4c3d-93db-83cbad847c2e): same pattern, top placement.
- [ClickUp person panel "Woohoo, you're all done!" plus undo](https://mobbin.com/flows/440308e0-4144-4f45-9763-98f2d137137c): per person Today / Overdue / Next groups, and an all done state inside a person drawer. Model for the manager person panel.
- [Docusign "All done! 5/5 actions completed" / "You're all caught up!"](https://mobbin.com/screens/2f0768ab-80bf-4cca-b7d5-ffbfd64af1e9): progress bar plus calm caught up state. Our progress line and all clear.
- [ClickUp "Inbox Zero" with undo toast](https://mobbin.com/screens/c64ec457-7285-4a1f-886d-a149b8a0d49b): empty state that still offers undo of the last clear.
- [Superhuman "You hit Inbox Zero"](https://mobbin.com/screens/08b8e810-572c-45b5-91ec-4f76bc6e6a0d): shows the emotional reward of closure; we tone it down for a shift context.

Snooze and defer
- [Linear snooze menu "An hour from now / Tomorrow / Next week"](https://mobbin.com/screens/17c8ce50-57d6-4a36-aeba-700bcb563fc6): relative options with the exact resulting time on the right. Steal both labels and the resolved time.
- [Outlook iOS Snooze sheet](https://mobbin.com/screens/946c0a3b-6b40-4070-8e80-805f3303c02d): icon plus label plus resolved time, large rows. Handheld Move to later sheet.

Manager and team visibility
- [ClickUp Team view per person columns with "8 Not done / 1 Done" and progress ring](https://mobbin.com/screens/caed8962-b58e-4c18-9391-13df63797c66): per person load summary. Steal the per person counts; use a table instead of columns.
- [7shifts "2 Conflicts / 2 Overtime / Fix warnings" chips](https://mobbin.com/screens/5d4b06e8-8215-48f7-ae27-58e7a2419b25): risk chips above a roster that act as filters. Direct model for our risk chips.
- [Deputy schedule roster with warnings legend](https://mobbin.com/screens/a0e97f81-c13c-4ca3-ba74-1e00efd1ad19): one row per person, status legend in words at the bottom ("1 warnings", "2 open shifts").
- [Vapi Issues "Critical 0 / Warning 0" plus "No Issues Found"](https://mobbin.com/screens/9afecd03-c74c-41b9-b1f3-a4eee7089c21): summary counts plus a reassuring empty state. Model for "Your team is on track".
- [Gorgias Live overview "Agents online / Assigned open tickets"](https://mobbin.com/screens/86a7c4b0-9d7b-4972-82e4-157925f83a94): live team counters strip. Our status line.
- [15Five "My team at a glance"](https://mobbin.com/screens/c02793eb-5b42-4057-b1f8-8e3cba44ecfc): manager home that mixes own actions with team list, with a "Blocker" tag. Confirms combining My work and Team for managers without a toggle.
- [Asana Workload](https://mobbin.com/screens/834c15bc-cfd5-4fff-9835-e854bc0f43b4): capacity over time per person. Too complex for shift ops; cited as what not to build in the 1 hour answer.

Reassign and escalate
- [Fireflies "Assign" picker](https://mobbin.com/screens/e5b9be0c-aa21-4c00-a6ff-fe3c79cb57a2): inline person picker on the row. Our Give to someone entry point.
- [Deputy "Swap your shift" dialog](https://mobbin.com/screens/70e98c38-2d6d-4dcc-98b0-20f8dc36a0cf): choose a colleague with context about them. Add load words to this pattern.
- [incident.io On call "Escalate to someone" with Latest action column](https://mobbin.com/screens/268a2bc3-662d-459d-bd7a-21b87bf9b813): "Notified Alex Smith, 2 minutes ago" is the tone for "Stuck: waiting on IT for 25 min".
- [Better Stack "Who should we escalate this incident to?"](https://mobbin.com/screens/3dab9fa9-2ff2-422d-a603-e44c3d9b8c6a): a question as the sheet title. Our "Who should do this?"

Searches run (17): Linear triage inbox; today view grouped overdue/today/upcoming; incident queue with severity; inbox zero empty states; team workload; focus mode single task; manager team status dashboard; reassign with workload; notification center grouping; iOS frontline worker task list; why ranked explainers; Superhuman split inbox; complete task with undo (flows); on call escalation; daily planning home with progress; iOS shift handover; iOS snooze sheet.
