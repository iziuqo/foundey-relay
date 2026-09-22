# Industry advisor: fulfillment operations lens

Author role: senior fulfillment and warehouse operations advisor (FC and 3PL operations, WMS product).
Audience: lead UI/UX designer, and the implementer who will build the prototype from this plan.

---

## 0. Diagnosis of the "current state" (why users still complain)

The brief's dashboard already has a "Needs Your Attention (6)" panel ranked by urgency. Users still complain, so ranking alone is not the fix. From an ops lens it fails because:

1. **Rank without reason.** Every row shows only a due time. In fulfillment, urgency comes from the **carrier cutoff (CPT)** and **how many orders are stuck**, and neither is visible. An "overdue 2h" payment mismatch on one order looks more urgent than a printer outage blocking 140 orders for the 11:30 truck. Coordinators learn to distrust the ranking and go back to scanning everything.
2. **Same weight for everything.** Six rows, same size, same generic "Review" verb. Nothing signals "stop what you're doing".
3. **Duplication.** The four source cards below repeat the same items by source. That's two mental models on one screen (by urgency and by source), so it adds noise.
4. **No ownership states.** Nothing separates "mine", "my team's", "nobody's (unassigned)" or "waiting on someone else". There's no way to say "not mine" or "I'm waiting on the carrier".
5. **No time anchor.** Fulfillment runs on a clock of truck departures. The screen has no "next cutoff in 50 min" anchor.
6. **No manager surface.** So the manager walks the floor and asks people, which is exactly the complaint.

Framing for the deck: *the current panel sorts; it doesn't explain, it doesn't show consequences, and it doesn't route.*

---

## 1. Mobbin references (14 searches, deep mode, web and iOS)

Note: Mobbin has no real WMS, ShipBob, Flexport, Samsara or Onfleet screens. Searches for dispatch boards and logistics dashboards returned mostly consumer order tracking. The useful patterns come from adjacent domains: order admin, incident management, gig worker task apps, workforce scheduling and ticket triage. That's worth saying in the deck: internal ops tools are underrepresented in public pattern libraries, so we borrow from incident response and gig logistics, the two closest cousins.

| Reference | What is relevant |
|---|---|
| [Deel home, "For you today"](https://mobbin.com/screens/403abcf1-892f-4036-9cbd-ba951c6dce7e) | Right column "To dos that require your attention": count badge per category plus a Review button. Left side has an **"Action required: overdue invoices" callout that states the consequence** ("to avoid delays to payroll"). Closest analog to our "why" line. |
| [Instacart order approvals](https://mobbin.com/screens/a432ea07-74c5-4335-bdf8-189d0ba429e4) | **"6 hr 14 min left to approve this order"** countdown, info banner explaining *why* it matters ("Review orders quickly to avoid delays"), one dominant green primary action next to a secondary "View details". Great model for the single Act now card. |
| [DoorDash Dasher, Current dash](https://mobbin.com/screens/5859ffb5-02a0-45ee-9065-2ea87eaf43fa) | Sequential tasks with **"Current task"** tag and hard times ("Pick up by 3:31 PM", "Deliver by 3:53 PM"). One thing at a time, deadline in the row. |
| [Keeta order status, On time Promise](https://mobbin.com/screens/56299fbf-b2d0-48be-867d-c434ca5af134) | Big time window plus "On time" status chip, and a promise block that explains the consequence of lateness in one sentence. Pattern for the "next truck" header strip. |
| [incident.io Incidents list](https://mobbin.com/screens/cae3d61e-5c75-4d45-9829-a52e78b3a9ba) | Each row: severity ("Major"), state ("Fixing"), **live elapsed timer** (28m 46s), reporter/owner avatar. Compact, scannable. Good row anatomy for the manager at risk list. |
| [Plane work items grouped by priority](https://mobbin.com/screens/4d37adbb-f1ea-493b-9a9b-53e02d6fee6a) | Groups Urgent / High / Medium / Low / None with counts, **empty groups still shown with 0**. Showing "Act now (0)" is reassuring and builds trust. |
| [Linear, High Priority view](https://mobbin.com/screens/b230cf2f-37bf-4621-8aab-e50003d63813) | Priority bar icon plus status groups (In Progress / Todo / Done). Dense rows. Shows how to combine priority and status without color overload. |
| [Fiverr Manage Orders tabs](https://mobbin.com/screens/32e50390-fa71-482a-83cc-7526815644ae) | Tabs "Priority / Active / Late / Delivered". A seller tool whose top tab is literally Priority, with counts. |
| [Etsy Shop Manager, Top tasks](https://mobbin.com/screens/3fc9ef9a-9645-4ac2-8435-6d48de04dbeb) | "0 overdue orders, 0 orders to ship today", then the empty state "Nice! You've fulfilled all of your orders." Good **all clear state** for the worker queue. |
| [Shopify Orders, unfulfilled filter](https://mobbin.com/screens/a3746572-44e4-4a92-ab77-c4c4b9ad37dd) | KPI strip on top (Orders, Items, Fulfilled, Delivered) plus a saved filter "Unfulfilled". Also [bulk "Mark as" menu](https://mobbin.com/screens/3b04b12e-d42f-4a3a-b04b-ba4e2cec5cff) (Unfulfilled, In progress, On hold). Shows the status vocabulary ops users already know. |
| [Deputy schedule, day by area](https://mobbin.com/screens/fa53831a-00a8-4442-b4e1-82cc1d259ca6) | Timeline by area with an **"Open shifts" row** and a legend (open shifts, warnings, leave pending). Pattern for the coverage gap: an unassigned row the manager must fill. |
| [Asana Workload](https://mobbin.com/screens/ba3b9250-52c4-47d1-988c-7969c4e8aedf) and [ClickUp Team workload](https://mobbin.com/screens/4ed5d2cd-edde-4144-915a-ba0b7f5ddf6e) | Per person task count and a "not done / done" split. Shows **queue load**, not activity. The right level of manager visibility. |
| [Toggl Track, Team activity](https://mobbin.com/screens/37dcf4b6-465d-485f-b08b-8f858fc6dd28) | "Tracking / Not tracking" per person with running timers. **Anti-pattern to cite in the deck**: this is the person-surveillance framing we should avoid for hourly warehouse staff. |
| [Gorgias assign ticket flow](https://mobbin.com/flows/533291f9-f3cc-470e-bce5-d3012ea9465c) | Inbox with "Unassigned" and "Snoozed" counts, shared views named "Order" and "Shipping", one-click assignee picker, then a confirm toast. Model for manager reassign and for a worker "waiting on" state. |
| [Basecamp "Reassign someone's to-dos"](https://mobbin.com/flows/a44dda89-2649-41d3-ab27-e8e403b25a80) | Bulk move of all of one person's items to another ("Use this when a coworker leaves"). Exactly the called out associate scenario. |

---

## 2. Personas

### Primary: Fulfillment Exception Coordinator (desk based). CONFIRMED as primary.

I confirm your suggestion, with one sharpening: this is the person who **resolves exceptions that stop units from reaching a truck**. At Amazon this work is spread across roles like Problem Solve, ICQA (inventory control and quality assurance), Ship Dock / Transportation (TOM, yard), and Outbound Process Assistants. The brief's examples (payment mismatch, compliance filing, client escalation) point to desk work, not scanner work.

- **Example:** Priya Raman, Outbound Exception Coordinator, SEA4, day shift, 3 years in (started as a packer, promoted).
- **Environment:** a shared workstation at the outbound ops desk near the ship dock. 24 inch monitor, standing height, sometimes read from 1 to 2 m away while holding a radio. Loud: conveyors, forklift alarms, radio chatter, people walking up with problems every few minutes. Logs in with badge plus SSO, and the machine may be shared with the other shift.
- **Shift:** 10 hour "front half" day shift (06:30 to 17:00, Sun to Wed), a 30 min lunch plus two 15 min breaks, **start of shift handoff from nights at 06:30**, and a pre shift standup.
- **Clock:** her day is organized around **CPTs** (critical pull times, the latest moment a unit can be picked and still make its truck) and carrier departures: UPS 11:30, Amazon Logistics linehaul 12:15, FedEx Express 14:00, USPS 15:30. Most stress peaks in the 60 minutes before each.
- **Goals:** nothing misses a truck because of her, clear blockers fast, don't drop things from the night shift, get credit for saves.
- **Frustrations:** "Everything says urgent." Alerts come from 4+ systems (WMS, carrier portal, Chime or Slack, email, radio). The ranking doesn't reflect what she knows ("that printer blocks the whole UPS wave"). She gets interrupted mid task and loses her place. There's no way to hand something back.
- **Tech comfort:** high for her tools (WMS screens, Excel, carrier portals, keyboard heavy), low patience for fluff. Wants dense, not pretty. English may be a second language (FC workforces are very multilingual), so plain words beat jargon, except the shared ops jargon (CPT, SLA, ASN) that everyone uses.

### Secondary: Shift Operations Manager (area manager level)

- **Example:** Danielle Okafor, day shift Outbound Operations Manager, 7 direct reports on the exceptions and dock desk, plus floor leads.
- **Environment:** mostly mobile. Walks the floor, attends 10 min "gemba" checks, has a laptop at the desk and a phone. Checks the dashboard in 30 second glances between conversations. Runs standup and writes the end of shift handoff.
- **Goals:** make every CPT, no safety incidents, balance load so nobody drowns while someone else is idle, know *before* the truck leaves that something is at risk, cover call outs quickly.
- **Frustrations:** "I cannot see what each worker is doing" really means *"I can't see what's at risk, who owns it, and who's stuck or overloaded."* Today she finds out when a lead radios her or when a truck leaves short.
- **Tech comfort:** medium high. Lives in dashboards (site performance tools, labor tracking, Slack). Tired of dashboards that show 40 metrics and no action.

### Out of scope, named: floor associates (pickers, packers, stowers)

They already work one task at a time on handheld RF scanners (Zebra TC52 or MC9300 class), and the WMS decides their next task. They don't choose priority, so a desktop priority dashboard doesn't help them. Mention in the deck: *the pattern we design (one Act now card, plain "why", one verb) can later be ported to the handheld for Problem Solve leads, who are hybrid.* The seed data includes a Problem Solve Lead (Aisha) to hint at that.

---

## 3. What actually makes something urgent in fulfillment

Ordered by how ops leaders actually triage:

1. **Safety.** Anything that can hurt someone beats everything (spill on a forklift route, blocked fire exit, damaged racking, hazmat leak). Non negotiable: always at the top, never outranked by a score.
2. **Carrier cutoff / CPT.** A truck leaving at 11:30 does not wait. Missing it means a whole wave of orders misses its promise date. Deadlines in fulfillment are *hard and shared*, not personal due dates.
3. **Blast radius: orders or units blocked downstream.** A broken label printer or a mislabeled pallet blocks hundreds. One payment mismatch blocks one. This is the single biggest thing a "due soonest" sort gets wrong.
4. **Customer promise / SLA.** Promise date (Prime 1 day or 2 day, same day) and whether the customer will feel it (late, wrong item, missing).
5. **Compliance and regulatory.** Hazmat and dangerous goods labeling (DOT, IATA for lithium batteries), OSHA forklift inspections, customs docs, certification deadlines. Serious, but *not always urgent right now*: a certification due at 17:00 isn't a 10:40 emergency.
6. **Escalation.** A human upstream (customer service, account manager, site leader) has raised it. It's a social signal, not physics.
7. **Cost of delay.** Carrier chargebacks, rework, detention fees, expedited reship cost. Useful as an explanation, but too hard to compute reliably for a prototype, so it stays out of the formula.

### Priority tiers (plain language)

| Tier | Label on screen | Rule | Meaning |
|---|---|---|---|
| 1 | **Act now** | safety = true, or score >= 60 | Stop what you're doing. A truck, a person, or many orders are at risk within the hour. |
| 2 | **Up next** | 30 <= score < 60 | Do it after Act now items. Matters today, and a clock is running. |
| 3 | **Later today** | score < 30 | Real work, no one is blocked yet. Batch it. |
| (none) | **For your info** | source = "fyi" | Not ranked, no action required. Goes to Team updates, never into the queue. |

Budget rule (anti alert fatigue): if a person has more than 3 Act now items, the manager view flags that person as **overloaded**. The rule is about rebalancing work, never a reason to lower anyone's priority silently.

### Deterministic scoring formula (prototype ready)

Inputs per item: `dueAt`, `ordersBlocked`, `customerImpact`, `compliance`, `escalated`, `safety`, `source`. Fixed `NOW = 2026-09-22T10:40:00-07:00`.

```
minutesLeft = (dueAt - NOW) in minutes     // negative means overdue

T  (time pressure, 0 to 40)
   minutesLeft < 0        -> 40
   minutesLeft <= 30      -> 36
   minutesLeft <= 60      -> 30
   minutesLeft <= 120     -> 22
   minutesLeft <= 240     -> 14
   otherwise / tomorrow   -> 8
   no dueAt               -> 0

B  (blast radius from ordersBlocked, 0 to 30)
   0        -> 0
   1..9     -> 6
   10..49   -> 14
   50..199  -> 22
   200+     -> 30

I  (impact flags, additive)
   customerImpact "high" -> +10, "low" -> +4, "none" -> 0
   compliance true       -> +15
   escalated true        -> +12
   safety true           -> +50 AND tier forced to "Act now"

score = min(100, T + B + I)
tier  = safety || score >= 60 ? "Act now" : score >= 30 ? "Up next" : "Later today"
source "fyi" -> no score, tier "For your info", excluded from queue

Sort within tier: pinned first, then score desc, then dueAt asc, then ordersBlocked desc, then createdAt asc.
Items with status "waiting" leave the ranked list and sit in a collapsed "Waiting on others" group until checkBackAt.
Items with status "done" are hidden (shown in Recent activity).
```

Why the weights: time maxes at 40 and blast radius at 30, so **a big blocker 50 min out (30 + 22 = 52, plus impact) beats a small item already overdue (40 + 6 = 46, plus impact)**. That's the core ops truth. Compliance (+15) and escalation (+12) nudge but can't on their own push a far future item into Act now. Safety bypasses the math.

**"Why" line generation.** Each item stores a hand written `whyText` in the seed. For a production version, generate it from the top two contributing factors, for example "Blocks 140 orders" + "UPS truck leaves 11:30". Always show the *consequence*, not the score. Show the numeric score only in an expandable "How this was ranked" detail (T, B, I breakdown) for trust.

### What the system can't know, and the human overrides

The system can't know that:
- someone is already on the phone with the carrier,
- the manager verbally said "leave it, I'm handling it",
- the printer was actually fixed 2 minutes ago (sensor or sync lag),
- a customer is a sensitive account, or the item is a duplicate of another,
- someone lacks the permission or skill to do it.

Overrides (all logged, all visible to the manager, none hidden):
- **Pin** (worker): keeps an item at the top of its tier. Max 3 pins. Doesn't move items across tiers, so it can't bury a safety item.
- **Not mine** (worker): returns the item to the team's **Unassigned** pool with a reason (Wrong area / Needs access / Duplicate / Other). The manager sees it immediately.
- **Waiting on...** (worker): pauses the item with who it's waiting on and a check back time (for example "Carrier, check back 11:15"). It drops from the ranked list and comes back automatically.
- **Escalate** (worker): sends it to the shift manager and sets `escalated = true`, adding +12.
- **Reassign / Set priority** (manager): moves the item, or overrides the tier with a required short reason, shown as a "Set by Danielle" chip.

---

## 4. What managers really need (and the ethics)

The real manager question is **"What's at risk, who owns it, and does anyone need help?"**, not "what is each person doing every minute".

Manager view contents, in priority order:
1. **Next cutoffs strip:** UPS 11:30 (50 min), AMZL 12:15 (1h 35m), FedEx 14:00, USPS 15:30, with orders at risk per truck.
2. **At risk across team:** all Act now items team wide, plus anything unassigned with less than 60 min left. Row: title, owner, time left, orders blocked, why.
3. **Team board (one row per person):** name, role or area, status (Working / On break / Away / Out), **current item** (title, not keystrokes), queue load as counts per tier (e.g. "2 Act now, 2 Up next, 1 Later"), and a **"May need help"** flag.
4. **Stuck detection (item based, not person based):** flag when an Act now or Up next item has been in progress for more than 2x its expected handling time, *or* has had no update in 45 min, *or* has been bounced (Not mine) twice. Phrase it as "Order 4833 escalation has had no update for 50 min", not "Tomasz idle 50 min".
5. **Coverage gaps:** called out people, their orphaned items (Unassigned count), areas with nobody assigned, breaks overlapping a cutoff.
6. **Rebalance:** drag or "Reassign" from an overloaded person to someone with capacity. Bulk "Reassign all of Kwame's items" (Basecamp pattern).
7. **Shift handoff summary:** auto drafted at 16:30. Open items carried over by tier, items waiting on others, what happened with each cutoff, and free text notes. The night shift's first screen is this summary.

### Surveillance vs support: the tradeoff for the deck

Amazon has had sustained public and regulatory criticism for productivity monitoring: "Time Off Task" (TOT) tracking, rate based discipline, and quota systems. That criticism led to warehouse quota laws: California AB 701 (2021), New York's Warehouse Worker Protection Act (2022), Washington's warehouse worker law (2023, HB 1762), and others. They require disclosure of quotas and prohibit quotas that interfere with breaks or safety. A dashboard that answers "I cannot see what each worker is doing" with per person activity timers would be legally and culturally risky, and workers would game it.

Recommended framing: **"Managers see the work, not the worker."**
- Show **work status and risk** (what's blocked, what's late, what's unowned). Don't show idle time, keystrokes, active minutes, time on break, or rankings of people.
- "Time on task" is shown only as **item age** ("in progress 80 min"), attached to the item, and only surfaced when it indicates a problem.
- Breaks show as a neutral "On break" status with no countdown and no timer.
- **Transparency mirror:** workers can see exactly the same team board the manager sees, including their own row. No hidden manager only data about people.
- No leaderboard, no per person throughput (UPH) on this screen. Productivity metrics stay in the separate labor management tools where HR policy governs them.
- Wording tone: "May need help", "Overloaded", "Unassigned". Never "Idle", "Slow", "Low performer".

Tradeoff to state honestly: managers lose some fine grained visibility they might ask for. We gain trust, more honest status updates (people don't hide problems), and legal safety. The stuck detection still catches real problems, because it's anchored to items at risk.

---

## 5. Seed dataset (site SEA4, Tuesday 22 Sep 2026, NOW = 10:40 PDT)

Notes for the implementer:
- All times use offset `-07:00`. `NOW` is fixed; do not use the real clock.
- `_expected` is the score and tier the formula above must produce. Use it as a test: if the computed values differ, the code is wrong, not the data.
- Priya (u1) is the default logged in worker. Her 6 items show the naive vs smart sort: **due soonest** order would be it-04 (overdue), it-05 (10:45), it-13 (11:00), it-01 (11:30), it-03 (11:45), it-11 (tomorrow). **Scored** order is it-01, it-03, it-04, it-05, it-13, it-11. The printer blocking 140 orders for the 11:30 UPS truck goes first, even though three items are due sooner.
- Team wide: 4 Act now, 9 Up next, 8 Later today, 3 FYI. Two unassigned items (Kwame called out), one of them due in 40 min: a coverage gap the manager should see.

```json
{
  "site": {
    "code": "SEA4",
    "name": "SEA4 Fulfillment Center",
    "timezone": "America/Los_Angeles",
    "now": "2026-09-22T10:40:00-07:00",
    "shift": {
      "name": "Day shift (front half)",
      "start": "2026-09-22T06:30:00-07:00",
      "end": "2026-09-22T17:00:00-07:00",
      "handoffAt": "2026-09-22T16:30:00-07:00"
    },
    "cutoffs": [
      { "id": "cpt-ups", "carrier": "UPS Ground", "door": "Door 14", "departsAt": "2026-09-22T11:30:00-07:00", "ordersPlanned": 610, "ordersAtRisk": 236 },
      { "id": "cpt-amzl", "carrier": "Amazon Logistics linehaul", "door": "Door 9", "departsAt": "2026-09-22T12:15:00-07:00", "ordersPlanned": 1420, "ordersAtRisk": 38 },
      { "id": "cpt-fedex", "carrier": "FedEx Express", "door": "Door 3", "departsAt": "2026-09-22T14:00:00-07:00", "ordersPlanned": 185, "ordersAtRisk": 34 },
      { "id": "cpt-usps", "carrier": "USPS", "door": "Door 6", "departsAt": "2026-09-22T15:30:00-07:00", "ordersPlanned": 540, "ordersAtRisk": 0 }
    ]
  },
  "team": [
    { "id": "m1", "name": "Danielle Okafor", "initials": "DO", "role": "Shift Operations Manager", "area": "Outbound", "isManager": true, "status": "working", "statusNote": "On the floor, Door 14", "currentTaskId": null, "currentTaskStartedAt": null },
    { "id": "u1", "name": "Priya Raman", "initials": "PR", "role": "Outbound Exception Coordinator", "area": "Pack and Ship", "isManager": false, "status": "working", "statusNote": null, "currentTaskId": "it-01", "currentTaskStartedAt": "2026-09-22T10:24:00-07:00" },
    { "id": "u2", "name": "Luis Herrera", "initials": "LH", "role": "Inventory Control Coordinator", "area": "ICQA", "isManager": false, "status": "working", "statusNote": null, "currentTaskId": "it-08", "currentTaskStartedAt": "2026-09-22T10:12:00-07:00" },
    { "id": "u3", "name": "Mei Lin Chen", "initials": "MC", "role": "Transportation Coordinator", "area": "Yard and Dock", "isManager": false, "status": "working", "statusNote": null, "currentTaskId": "it-06", "currentTaskStartedAt": "2026-09-22T10:35:00-07:00" },
    { "id": "u4", "name": "Tomasz Nowak", "initials": "TN", "role": "Customer Escalations Coordinator", "area": "Customer Issues", "isManager": false, "status": "working", "statusNote": null, "currentTaskId": "it-07", "currentTaskStartedAt": "2026-09-22T09:20:00-07:00", "needsHelpSignal": "Current item in progress 80 min, no update for 50 min" },
    { "id": "u5", "name": "Aisha Bello", "initials": "AB", "role": "Problem Solve Lead", "area": "Pack floor (handheld)", "isManager": false, "status": "on_break", "statusNote": null, "currentTaskId": null, "currentTaskStartedAt": null },
    { "id": "u6", "name": "Jordan Whitfield", "initials": "JW", "role": "Safety and Compliance Coordinator", "area": "Site wide", "isManager": false, "status": "working", "statusNote": null, "currentTaskId": "it-02", "currentTaskStartedAt": "2026-09-22T10:33:00-07:00" },
    { "id": "u7", "name": "Kwame Asante", "initials": "KA", "role": "Outbound Exception Coordinator", "area": "Pack and Ship", "isManager": false, "status": "out", "statusNote": "Called out today", "currentTaskId": null, "currentTaskStartedAt": null }
  ],
  "items": [
    {
      "id": "it-01", "title": "Label printer offline at Pack 7", "source": "system", "assigneeId": "u1",
      "dueAt": "2026-09-22T11:30:00-07:00", "createdAt": "2026-09-22T10:22:00-07:00", "cutoffId": "cpt-ups",
      "ordersBlocked": 140, "unitsAffected": 212, "customerImpact": "high",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "140 orders need labels before the UPS truck leaves at 11:30.",
      "primaryAction": "Reroute orders to Pack 9", "status": "in_progress",
      "_expected": { "score": 62, "tier": "Act now" }
    },
    {
      "id": "it-02", "title": "Wet floor on forklift route near Door 11", "source": "safety", "assigneeId": "u6",
      "dueAt": "2026-09-22T10:45:00-07:00", "createdAt": "2026-09-22T10:31:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 0, "customerImpact": "none",
      "safety": true, "compliance": false, "escalated": false,
      "whyText": "Someone could slip or a forklift could skid, so this comes before everything.",
      "primaryAction": "Dispatch cleanup crew", "status": "in_progress",
      "_expected": { "score": 86, "tier": "Act now" }
    },
    {
      "id": "it-03", "title": "Lithium battery orders missing hazmat labels", "source": "order", "assigneeId": "u1",
      "dueAt": "2026-09-22T11:45:00-07:00", "createdAt": "2026-09-22T10:05:00-07:00", "cutoffId": "cpt-amzl",
      "ordersBlocked": 12, "unitsAffected": 12, "customerImpact": "high",
      "safety": false, "compliance": true, "escalated": false,
      "whyText": "12 orders cannot legally ship on the 12:15 truck without hazmat labels.",
      "primaryAction": "Reprint hazmat labels", "status": "open",
      "_expected": { "score": 61, "tier": "Act now" }
    },
    {
      "id": "it-04", "title": "Order 4821 payment mismatch, held at pack", "source": "order", "assigneeId": "u1",
      "dueAt": "2026-09-22T08:40:00-07:00", "createdAt": "2026-09-22T05:50:00-07:00", "cutoffId": null,
      "ordersBlocked": 1, "unitsAffected": 3, "customerImpact": "low",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "Overdue, but only one order is waiting, so truck risks come first.",
      "primaryAction": "Release or cancel order", "status": "open",
      "_expected": { "score": 50, "tier": "Up next" }
    },
    {
      "id": "it-05", "title": "Reply to vendor about damaged tote count", "source": "comms", "assigneeId": "u1",
      "dueAt": "2026-09-22T10:45:00-07:00", "createdAt": "2026-09-22T09:10:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 0, "customerImpact": "none",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "Due in 5 minutes, but no orders are waiting on it.",
      "primaryAction": "Send reply", "status": "open",
      "_expected": { "score": 36, "tier": "Up next" }
    },
    {
      "id": "it-06", "title": "UPS trailer at Door 14 is short 2 pallets", "source": "carrier", "assigneeId": "u3",
      "dueAt": "2026-09-22T11:30:00-07:00", "createdAt": "2026-09-22T10:28:00-07:00", "cutoffId": "cpt-ups",
      "ordersBlocked": 96, "unitsAffected": 150, "customerImpact": "high",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "96 orders miss today's promise if the pallets are not loaded by 11:30.",
      "primaryAction": "Locate pallets in staging", "status": "in_progress",
      "_expected": { "score": 62, "tier": "Act now" }
    },
    {
      "id": "it-07", "title": "Escalation: medical supplies order 4833 not shipped", "source": "customer", "assigneeId": "u4",
      "dueAt": "2026-09-22T12:00:00-07:00", "createdAt": "2026-09-22T09:15:00-07:00", "cutoffId": "cpt-amzl",
      "ordersBlocked": 1, "unitsAffected": 4, "customerImpact": "high",
      "safety": false, "compliance": false, "escalated": true,
      "whyText": "Customer service escalated it and it must make the 12:15 truck to arrive on time.",
      "primaryAction": "Expedite to pack", "status": "in_progress",
      "_expected": { "score": 50, "tier": "Up next" }
    },
    {
      "id": "it-08", "title": "Count mismatch in bin P3 A114 holding 18 orders", "source": "inventory", "assigneeId": "u2",
      "dueAt": "2026-09-22T12:15:00-07:00", "createdAt": "2026-09-22T09:55:00-07:00", "cutoffId": "cpt-amzl",
      "ordersBlocked": 18, "unitsAffected": 18, "customerImpact": "low",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "18 orders were short picked from this bin and ship on the 12:15 truck.",
      "primaryAction": "Start recount", "status": "in_progress",
      "_expected": { "score": 40, "tier": "Up next" }
    },
    {
      "id": "it-09", "title": "Wrong item claim on order 4755", "source": "customer", "assigneeId": null,
      "dueAt": "2026-09-22T15:00:00-07:00", "createdAt": "2026-09-22T08:20:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 1, "customerImpact": "high",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "The customer is waiting on a replacement, but it can go out on the afternoon truck.",
      "primaryAction": "Create replacement order", "status": "open",
      "_expected": { "score": 18, "tier": "Later today" }
    },
    {
      "id": "it-10", "title": "Oversize parcel needs a manual rate, order 4790", "source": "order", "assigneeId": null,
      "dueAt": "2026-09-22T11:20:00-07:00", "createdAt": "2026-09-22T09:40:00-07:00", "cutoffId": "cpt-ups",
      "ordersBlocked": 1, "unitsAffected": 1, "customerImpact": "low",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "Nobody owns this yet and it has to be rated before the UPS truck.",
      "primaryAction": "Enter manual rate", "status": "open",
      "_expected": { "score": 40, "tier": "Up next" }
    },
    {
      "id": "it-11", "title": "Rush shipping request on order 4796", "source": "order", "assigneeId": "u1",
      "dueAt": "2026-09-23T09:00:00-07:00", "createdAt": "2026-09-22T09:30:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 2, "customerImpact": "low",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "Due tomorrow morning and nothing is blocked today.",
      "primaryAction": "Upgrade shipping service", "status": "open",
      "_expected": { "score": 12, "tier": "Later today" }
    },
    {
      "id": "it-12", "title": "Hazmat shipper training renewals for 3 associates", "source": "compliance", "assigneeId": "u6",
      "dueAt": "2026-09-22T17:00:00-07:00", "createdAt": "2026-09-21T14:00:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 0, "customerImpact": "none",
      "safety": false, "compliance": true, "escalated": false,
      "whyText": "Required by end of day, but nothing ships differently before then.",
      "primaryAction": "Assign training", "status": "open",
      "_expected": { "score": 23, "tier": "Later today" }
    },
    {
      "id": "it-13", "title": "Danielle asked you to confirm the UPS order count", "source": "comms", "assigneeId": "u1",
      "dueAt": "2026-09-22T11:00:00-07:00", "createdAt": "2026-09-22T10:26:00-07:00", "cutoffId": "cpt-ups",
      "ordersBlocked": 0, "unitsAffected": 0, "customerImpact": "none",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "Your manager needs the number to decide whether to hold the truck.",
      "primaryAction": "Reply to Danielle", "status": "open",
      "_expected": { "score": 36, "tier": "Up next" }
    },
    {
      "id": "it-14", "title": "Inbound trailer arrived without shipping notice", "source": "inventory", "assigneeId": "u2",
      "dueAt": "2026-09-22T13:00:00-07:00", "createdAt": "2026-09-22T10:10:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 1200, "customerImpact": "none",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "Receiving cannot check in 1,200 units, but no outbound orders depend on them today.",
      "primaryAction": "Request notice from vendor", "status": "open",
      "_expected": { "score": 14, "tier": "Later today" }
    },
    {
      "id": "it-15", "title": "FedEx Express pickup moved earlier to 13:30", "source": "carrier", "assigneeId": "u3",
      "dueAt": "2026-09-22T13:00:00-07:00", "createdAt": "2026-09-22T10:02:00-07:00", "cutoffId": "cpt-fedex",
      "ordersBlocked": 34, "unitsAffected": 41, "customerImpact": "high",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "34 next day orders must be staged 30 minutes earlier than planned.",
      "primaryAction": "Move staging time", "status": "open",
      "_expected": { "score": 38, "tier": "Up next" }
    },
    {
      "id": "it-16", "title": "Damaged pallet in receiving, 40 units", "source": "inventory", "assigneeId": "u2",
      "dueAt": "2026-09-22T16:00:00-07:00", "createdAt": "2026-09-22T09:05:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 40, "customerImpact": "none",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "Needs a damage report today, but nothing is waiting on it.",
      "primaryAction": "File damage report", "status": "open",
      "_expected": { "score": 8, "tier": "Later today" }
    },
    {
      "id": "it-17", "title": "Address check failed on 7 orders", "source": "order", "assigneeId": "u4",
      "dueAt": "2026-09-22T12:15:00-07:00", "createdAt": "2026-09-22T09:48:00-07:00", "cutoffId": "cpt-amzl",
      "ordersBlocked": 7, "unitsAffected": 9, "customerImpact": "low",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "7 orders will miss the 12:15 truck unless the addresses are fixed.",
      "primaryAction": "Correct addresses", "status": "open",
      "_expected": { "score": 32, "tier": "Up next" }
    },
    {
      "id": "it-18", "title": "Pack 3 running low on B4 boxes", "source": "floor", "assigneeId": "u5",
      "dueAt": "2026-09-22T12:30:00-07:00", "createdAt": "2026-09-22T10:18:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 0, "customerImpact": "none",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "About 2 hours of boxes left, so restock before lunch.",
      "primaryAction": "Request restock", "status": "open",
      "_expected": { "score": 22, "tier": "Later today" }
    },
    {
      "id": "it-19", "title": "Carrier overcharged 3 parcels last week", "source": "carrier", "assigneeId": "u3",
      "dueAt": "2026-09-22T17:00:00-07:00", "createdAt": "2026-09-21T16:40:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 3, "customerImpact": "none",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "A billing dispute with no effect on today's trucks.",
      "primaryAction": "Open dispute", "status": "waiting", "waitingOn": "UPS account rep", "checkBackAt": "2026-09-22T14:00:00-07:00",
      "_expected": { "score": 8, "tier": "Later today" }
    },
    {
      "id": "it-20", "title": "Customer asked for a delivery photo, order 4702", "source": "customer", "assigneeId": "u4",
      "dueAt": "2026-09-22T16:00:00-07:00", "createdAt": "2026-09-22T08:55:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 1, "customerImpact": "low",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "A quick reply the customer expects today, with nothing blocked.",
      "primaryAction": "Send photo", "status": "open",
      "_expected": { "score": 12, "tier": "Later today" }
    },
    {
      "id": "it-21", "title": "Forklift FL07 daily inspection not submitted", "source": "compliance", "assigneeId": "u6",
      "dueAt": "2026-09-22T10:30:00-07:00", "createdAt": "2026-09-22T06:30:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 0, "customerImpact": "none",
      "safety": false, "compliance": true, "escalated": false,
      "whyText": "The forklift cannot legally be used until its daily check is on file.",
      "primaryAction": "Tag out or inspect", "status": "open",
      "_expected": { "score": 55, "tier": "Up next" }
    },
    {
      "id": "it-22", "title": "System maintenance tonight 23:00 to 23:30", "source": "fyi", "assigneeId": null,
      "dueAt": null, "createdAt": "2026-09-22T07:00:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 0, "customerImpact": "none",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "For your info. Scanners will be offline for 30 minutes on night shift.",
      "primaryAction": "Mark as read", "status": "open",
      "_expected": { "score": null, "tier": "For your info" }
    },
    {
      "id": "it-23", "title": "New carton size C7 added to the pack menu", "source": "fyi", "assigneeId": null,
      "dueAt": null, "createdAt": "2026-09-22T08:10:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 0, "customerImpact": "none",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "For your info. Packers may ask about it.",
      "primaryAction": "Mark as read", "status": "open",
      "_expected": { "score": null, "tier": "For your info" }
    },
    {
      "id": "it-24", "title": "Peak season volume forecast posted", "source": "fyi", "assigneeId": null,
      "dueAt": null, "createdAt": "2026-09-22T09:00:00-07:00", "cutoffId": null,
      "ordersBlocked": 0, "unitsAffected": 0, "customerImpact": "none",
      "safety": false, "compliance": false, "escalated": false,
      "whyText": "For your info. Volume is expected to rise 35 percent from mid October.",
      "primaryAction": "Open forecast", "status": "open",
      "_expected": { "score": null, "tier": "For your info" }
    }
  ],
  "updates": [
    { "id": "up-01", "at": "2026-09-22T10:36:00-07:00", "authorId": "u3", "type": "activity", "text": "Door 14 loading resumed after a conveyor jam was cleared." },
    { "id": "up-02", "at": "2026-09-22T10:31:00-07:00", "authorId": "u6", "type": "activity", "text": "Reported a wet floor near Door 11 and blocked the lane." },
    { "id": "up-03", "at": "2026-09-22T10:20:00-07:00", "authorId": null, "type": "system", "text": "Pack 7 printer has gone offline 3 times since 06:00." },
    { "id": "up-04", "at": "2026-09-22T10:15:00-07:00", "authorId": "m1", "type": "announcement", "text": "Kwame is out today. His items are in Unassigned and I will split them by 11:00." },
    { "id": "up-05", "at": "2026-09-22T09:58:00-07:00", "authorId": null, "type": "system", "text": "Amazon Logistics 12:15 volume is 18 percent above forecast." },
    { "id": "up-06", "at": "2026-09-22T09:40:00-07:00", "authorId": "u2", "type": "activity", "text": "Resolved: bin P2 B009 recount matched the system." },
    { "id": "up-07", "at": "2026-09-22T06:35:00-07:00", "authorId": null, "type": "handoff", "text": "Night shift handoff: 3 items carried over. Order 4821 payment hold, a FedEx damage claim, and Pack 7 printer dropping out now and then." },
    { "id": "up-08", "at": "2026-09-22T06:45:00-07:00", "authorId": "m1", "type": "announcement", "text": "Standup focus today: protect the UPS 11:30 and Amazon 12:15 trucks." }
  ]
}
```

Story beats the dataset supports (use them in the deck walkthrough):
- **Naive sort is wrong:** Priya's printer (it-01, due 11:30) outranks the overdue payment hold (it-04) and the 10:45 vendor reply (it-05).
- **Compliance isn't automatically urgent:** training renewals (it-12, compliance) are Later today; hazmat labels on outbound orders (it-03, compliance plus blocking) are Act now.
- **Safety bypasses math:** it-02 is Act now even though no orders are blocked.
- **Handoff matters:** the night shift flagged the Pack 7 printer (up-07), the system saw repeated dropouts (up-03), and nobody acted until it blocked 140 orders. A good handoff surface would have caught it.
- **Coverage gap:** Kwame is out and it-10 is unassigned with 40 min to the UPS truck. The manager view must surface that.
- **Needs help, not idle:** Tomasz's escalation (it-07) has had no update for 50 min, so it's flagged as "May need help" on the item.

---

## 6. Metrics and KPIs

Metrics a site actually tracks (use real names in the deck):

| Metric | Meaning | On manager summary? |
|---|---|---|
| CPT adherence / missed CPT count | Orders or units that missed their truck | **Yes** (today, live, per upcoming truck) |
| Orders at risk per cutoff | Orders not yet shipped that are blocked or behind for the next truck | **Yes** (headline) |
| Open exceptions by tier and age | Count of Act now / Up next / Later, and how long they have been open | **Yes** |
| Unassigned items | Work nobody owns | **Yes** |
| Items needing help (stuck) | Item based stuck signals | **Yes** |
| Coverage | Who is in, on break, out; areas with no owner | **Yes** (neutral status only) |
| Safety incidents and near misses today | Safety reports | **Yes** (count plus open ones) |
| Exception resolution time (median, today) | Time from created to done, team level | Yes, team aggregate only |
| On time ship % / promise attainment | Shipped by promise date | Maybe, as one small team number |
| Backlog vs plan (units) | Units not yet processed vs plan for the shift | Belongs to the site ops dashboard; link out |
| Inventory accuracy, dock to stock time, DPMO (defects per million) | Quality and inbound health | No, separate ICQA and inbound tools |
| **UPH (units per hour) per person, rate, Time Off Task, idle time, active time, keystrokes** | Individual productivity surveillance | **No. Deliberately excluded.** Explain why in the deck. |
| Leaderboards / person rankings | | **No** |

---

## 7. Assumptions, tradeoffs, risks, validation

### Key assumptions (state them in the deck)
1. The brief's "fulfillment team" is **desk based exception coordinators** plus their **shift manager**. The mixed examples (payment mismatch, compliance filing, client escalation) are office style work.
2. Source systems (WMS, carrier feeds, customer service, comms) can expose `dueAt`, the linked cutoff, and `ordersBlocked`. That's realistic: WMS knows which orders are waiting on which exception.
3. Desktop first at a shared workstation, readable at a glance from 1 to 2 m. Handheld later.
4. Priority is computed centrally and is the same for everyone, so manager and worker see the same tier for the same item. That's what makes it a shared language.
5. One site, one shift, English UI with plain wording.

### Tradeoffs
- **Explainable rules vs ML.** Rules are less "smart" but auditable and easy to tune; people trust what they can explain in one sentence. ML can come later, once override data exists to train on.
- **Fewer, stronger signals vs completeness.** Cost of delay and customer lifetime value are left out on purpose.
- **Work visibility vs people visibility.** See section 4.
- **Fixed tiers vs continuous score.** Three tiers are easier to act on; the score is only used for sorting and the "how ranked" detail.

### Risks and mitigations
- **Alert fatigue:** if everything is Act now, nothing is. Mitigate with high thresholds (Act now needs about a 60+ score), an "overloaded" flag when a person has more than 3 Act now items, FYI kept out of the queue, and tuning weights from override data weekly.
- **Gaming the ranking:** upstream teams mark everything "escalated" to jump the queue, or workers park hard items in "waiting". Mitigate: only defined roles can escalate; waiting requires who plus check back time; the manager sees counts of waiting items and repeated Not mine bounces.
- **Trust in the algorithm:** show the "why" on every item and a "How this was ranked" breakdown, and let humans override with logged reasons. Review overrides weekly: if pins or Not mine are common for a category, the model is wrong.
- **Stale data:** show "Updated 10:40" and a warning if a feed is more than 2 min old. Printers and trailers change fast.
- **Shift handoff:** items get lost at 06:30 and 17:00. Auto draft the handoff summary from open items plus notes, and make it the first thing the next shift sees. Carried over items keep their history.
- **Surveillance perception:** mitigate with the transparency mirror, no people metrics, and involving associates or worker councils in rollout.

### How to validate after launch
Run a 2 to 4 week pilot on one shift at one site vs a control shift.

Primary success metrics:
- **Time to first action on Act now items** (median, target under 5 min).
- **Missed CPT count and orders missing CPT caused by exceptions** (target: down week over week vs control).
- **% of Act now items resolved before their dueAt.**
- **Unassigned time to owner** (how fast orphaned items get picked up, target under 10 min).

Health and guard metrics:
- **Override rate** (pins, Not mine, manager priority changes) per 100 items. Very high means the model is miscalibrated; zero may mean nobody trusts or understands the overrides.
- **Act now volume per person per hour** (alert fatigue budget).
- **Handoff carryover:** items open at shift end, and how many were acted on in the first hour of the next shift.
- **Qualitative:** a 5 question trust survey ("I understand why items are ranked", "I feel monitored"), plus shadowing sessions at the desk during a pre CPT rush.
- Manager: time to answer "what's at risk right now?" in a timed task test (target under 10 s).
