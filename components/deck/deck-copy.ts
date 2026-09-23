/**
 * Every word the deck says, in one place, so G9 can read it.
 *
 * The slides used to carry their prose inline in JSX, which put it out of reach of
 * `tests/unit/deck-copy.test.ts`: nothing asserted its reading level, its labels, or that a
 * claim still matched the product it describes. Prose is `Rich` — plain text with the
 * operative clause marked (`k("…")`, set in `--text-1` at 600, `mk01`'s device) and inline
 * code marked (`c("…")`) — so a test can flatten it and a slide can render it.
 */

export type RichPart = string | { key: string } | { code: string };
export type Rich = readonly RichPart[];

export const k = (key: string): RichPart => ({ key });
export const c = (code: string): RichPart => ({ code });

/** A `Rich` (or plain string) as the sentence a reader sees. */
export function plain(text: Rich | string): string {
  if (typeof text === "string") return text;
  return text.map((part) => (typeof part === "string" ? part : "key" in part ? part.key : part.code)).join("");
}

export interface Column {
  label: string;
  title: string;
  body: string;
}

export const cover = {
  lead: ["Making the ", k("next right action obvious"), " — for the people doing the work, and the people leading it."],
  meta: "Foundey Senior Product Designer challenge · September 2026",
} satisfies { lead: Rich; meta: string };

export const dividerA = {
  title: "The one hour answer",
  lead: [
    "People don’t need a longer list. They need to know ",
    k("what to do first, and why"),
    " — and managers need to see ",
    k("where to step in"),
    ", never a stopwatch on a person.",
  ],
  label: "Slides 1–10",
} satisfies { title: string; lead: Rich; label: string };

export const brief = {
  title: "Two complaints, one screen",
  lead: [
    "The brief: redesign the dashboard. People should see ",
    k("which work comes first"),
    ", from most critical to least urgent.",
  ],
  quotes: [
    ["I never know what needs my attention first.", "Workers"],
    ["I cannot see what each worker is doing.", "Managers"],
  ],
} satisfies { title: string; lead: Rich; quotes: [string, string][] };

export const insight = {
  title: "It already ranks, and that’s not the fix",
  lead: [
    "The current screen already has a queue titled “Needs Your Attention, ranked by urgency.” People still complain, so ",
    k("ranking was never the missing piece"),
    ".",
  ],
  label: "What was missing",
  missing: [
    ["Why", "It ranks, but never says why."],
    ["Consequence", "It groups by source, not by what happens next."],
    ["One first thing", "Every row asks for attention at once."],
    ["A finish line", "There is no way to be done."],
    ["A manager view", "There is no manager surface at all."],
  ],
} satisfies { title: string; lead: Rich; label: string; missing: [string, string][] };

export const failures = {
  title: "Five failures, five fixes",
  heads: ["The screen today", "Relay"],
  rows: [
    ["Ranks, but never says why", "A cause line on every row, and a “Why is this first?” explainer that shows the score."],
    ["Labels by source, not consequence", "Three groups named by time: Act now, Up next, When you can."],
    ["Every row carries equal weight", "Rows are quiet. One hero carries the one visible action, and loudness follows rank."],
    ["No finish line", "A done count, an undo toast, and a calm all-clear screen."],
    ["No manager surface at all", "A Team screen: Needs you first, then a quiet table of people."],
  ],
} satisfies { title: string; heads: [string, string]; rows: [string, string][] };

export const assumptions = {
  title: "Assumptions",
  lead: ["Three things we took as given, so the hour went into the screen ", k("and not into the setup"), "."],
  columns: [
    {
      label: "01 · Distance",
      title: "Two meters, one desk",
      body: "Read from about two meters, on a shared screen. Three things must work at that distance: the hero title, the countdown, and which group a row is in.",
    },
    {
      label: "02 · People",
      title: "Two personas",
      body: "A coordinator doing the work and a manager watching the floor cover the ask. Both open the same app.",
    },
    {
      label: "03 · The rule",
      title: "The rule is already right",
      body: "The priority formula and the seed data are tested and easy to explain. The job is execution, not a new model.",
    },
  ],
} satisfies { title: string; lead: Rich; columns: Column[] };

export const prioritized = {
  title: "What we prioritized",
  lead: ["Craft before features: ", k("a quiet shell"), " where the one thing that matters is the loudest thing."],
  columns: [
    {
      label: "01 · Restraint",
      title: "Hue only means something",
      body: "Near-monochrome. Color shows priority and success, so the ranking still reads with the color taken out. Eye candy is two moments and one texture.",
    },
    {
      label: "02 · Modes",
      title: "Light, dark and wire",
      body: "Three real token sets. Wire is not a filter. It is the low-fidelity deliverable, and it switches on in the live product.",
    },
    {
      label: "03 · One source",
      title: "The app is the source",
      body: "The app, its design system and this deck share components. Nothing here is redrawn by hand.",
    },
  ],
} satisfies { title: string; lead: Rich; columns: Column[] };

export const wireframe = {
  title: "The wireframe",
  lead: ["The brief asked for low fidelity. This is the real product with the ", k("color removed"), ", not boxes labeled “Nav”."],
  legend: [
    "Same hero with the color removed. Size and position alone say this is the one thing.",
    "Rank survives as shape and fill: a disc, a triangle, a ring. Only Act now is tinted.",
    "Manager view: Needs you first, each row with one specific action, then a quiet roster.",
  ],
} satisfies { title: string; lead: Rich; legend: string[] };

export const priorityRule = {
  title: "The priority rule, in one screen",
  lead: ["Time plus orders blocked plus impact. ", k("One score, one sort"), ", the same rule for every item."],
  stats: [
    { label: "Time", note: "Up to 40 points, most when late" },
    { label: "Orders blocked", note: "Up to 30 points, at 200 or more" },
    { label: "Impact", note: "Up to 87 points, safety alone is 50" },
  ],
  rule: "A score of 60 or more is Act now, and 30 or more is Up next. Safety is always Act now.",
} satisfies { title: string; lead: Rich; stats: { label: string; note: string }[]; rule: string };

export const cuts = {
  title: "What we cut",
  lead: ["Real ideas, ", k("left out of the hour"), " on purpose. This deck went from 27 slides to 16 for the same reason."],
  columns: [
    {
      label: "01 · Backend",
      title: "A real backend",
      body: "State is seeded and lives in the browser. Sync, sign-in and notifications are the next project, not the next hour.",
    },
    {
      label: "02 · People",
      title: "A third persona",
      body: "Coordinator and manager cover the brief. A shift lead or a driver view is real work, and separate.",
    },
    {
      label: "03 · Handoff",
      title: "The shift-end handoff",
      body: "A 16:30 list of what is still open, passed to the next shift in one action. Left as an idea, not built.",
    },
  ],
} satisfies { title: string; lead: Rich; columns: Column[] };

export const dividerB = {
  title: "Beyond the hour",
  lead: ["Everything from here on is ", k("optional"), ". The one hour answer is complete without it."],
  label: "Slides 11–16 · Optional",
} satisfies { title: string; lead: Rich; label: string };

export const hifi = {
  title: "The hi-fi product",
  lead: ["Same screen, same rule, ", k("finished"), ". Type, geometry and motion now do the work that color usually does."],
  legend: [
    "One object owns the page: the hero says what to do now, why, and how long.",
    "Act now is the only tinted group. Up next and When you can are quieter, by rank.",
    "The rail is reference: a truck clock and the shift. Nothing in it is clickable.",
  ],
} satisfies { title: string; lead: Rich; legend: string[] };

export const motion = {
  title: "Motion",
  lead: [
    "Eighteen named moments, one rule: ",
    k("show where something went"),
    ". Nothing loops except the all-clear aurora, and nothing pulses.",
  ],
  body: ["Each moment also has a version for people who turn motion off. Replay them all at ", c("/system/motion"), "."],
  stat: { value: "≈700", label: "Milliseconds, Mark done, end to end" },
  beats: [
    "The check draws.",
    "The hero leaves.",
    "The next row lifts out of the list and becomes the hero.",
    "The gap closes.",
    "The counter rolls.",
    "The toast arrives.",
  ],
} satisfies { title: string; lead: Rich; body: Rich; stat: { value: string; label: string }; beats: string[] };

export const manager = {
  title: "The manager view, and the line it doesn’t cross",
  lead: ["A per-person stopwatch reads as surveillance, not help. The board ", k("never times a person"), ", only an item."],
  legend: [
    "Needs you comes first. Each row has one action with a specific verb.",
    "The roster has no action buttons, only one quiet menu per row. A row opens the person’s sheet.",
    "No clock next to a name. Time appears on an item, and only when it signals a problem.",
  ],
} satisfies { title: string; lead: Rich; legend: string[] };

export const accessibility = {
  title: "Accessibility",
  lead: ["Three gates that ", k("fail the build"), ", not a checklist read once at the end."],
  columns: [
    {
      label: "Contrast and axe",
      title: "Zero violations, in every mode",
      body: "Every route is scanned with axe in light, dark and wire. Text contrast is measured from real styles, not by eye.",
    },
    {
      label: "The wire test",
      title: "Rank survives with no hue",
      body: "With color removed, the four groups still differ by shape, fill and position. No CSS filter is used anywhere.",
    },
    {
      label: "Reduced motion",
      title: "Every animation has a variant",
      body: "The color cue stays and the movement goes. Only the all-clear aurora loops, and under reduced motion it holds still.",
    },
  ],
  marks: ["G4", "G5", "G6"],
} satisfies { title: string; lead: Rich; columns: Column[]; marks: string[] };

export const next = {
  title: "Next steps",
  lead: ["The screens are built. What is left is ", k("proving they work on a real floor"), "."],
  columns: [
    {
      label: "01 · Pilot",
      title: "Run one shift",
      body: "Time the first action on the floor. That is the number the three-second test stands in for.",
    },
    {
      label: "02 · Handoff",
      title: "Build the shift-end handoff",
      body: "The 16:30 list: what is still open, passed to the next shift in one action.",
    },
    {
      label: "03 · Real data",
      title: "Connect the real queue",
      body: "Swap the seed for live data, sign-in, and the notifications that go with them.",
    },
  ],
} satisfies { title: string; lead: Rich; columns: Column[] };

/** Every prose string the deck sets in running text — leads, bodies, notes, legends, cells.
 * Titles, labels and eyebrows are fragments, not sentences, and are checked separately. */
export function deckProse(): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  const add = (where: string, text: Rich | string) => out.push({ where, text: plain(text) });
  add("cover.lead", cover.lead);
  add("dividerA.lead", dividerA.lead);
  add("brief.lead", brief.lead);
  brief.quotes.forEach(([q], i) => add(`brief.quote${i}`, q));
  add("insight.lead", insight.lead);
  insight.missing.forEach(([, text], i) => add(`insight.missing${i}`, text));
  failures.rows.forEach(([a, b], i) => {
    add(`failures.today${i}`, a);
    add(`failures.relay${i}`, b);
  });
  for (const [name, section] of [
    ["assumptions", assumptions],
    ["prioritized", prioritized],
    ["cuts", cuts],
    ["accessibility", accessibility],
    ["next", next],
  ] as const) {
    add(`${name}.lead`, section.lead);
    section.columns.forEach((col, i) => add(`${name}.column${i}`, col.body));
  }
  add("wireframe.lead", wireframe.lead);
  wireframe.legend.forEach((text, i) => add(`wireframe.legend${i}`, text));
  add("priorityRule.lead", priorityRule.lead);
  priorityRule.stats.forEach((s, i) => add(`priorityRule.stat${i}`, s.note));
  add("priorityRule.rule", priorityRule.rule);
  add("dividerB.lead", dividerB.lead);
  add("hifi.lead", hifi.lead);
  hifi.legend.forEach((text, i) => add(`hifi.legend${i}`, text));
  add("motion.lead", motion.lead);
  add("motion.body", motion.body);
  motion.beats.forEach((text, i) => add(`motion.beat${i}`, text));
  add("manager.lead", manager.lead);
  manager.legend.forEach((text, i) => add(`manager.legend${i}`, text));
  return out;
}
