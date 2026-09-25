/**
 * The landing page's content, in one file.
 *
 * Every number here is read from the repo, not remembered: the commit times come from
 * `git log --date=format-local:'%m-%d %H:%M' --reverse`, the test counts from the runs
 * themselves (`npm test`, `npm run test:e2e`, `npm run test:visual`), and the gates from
 * README.md's own table. A reviewer can check any of them in a terminal, which is the
 * only reason they are worth putting on a page.
 */

export const LINKS = {
  prototype: "/work",
  team: "/team",
  system: "/system",
  deck: "/deck",
  updates: "/updates",
  github: "https://github.com/iziuqo/foundey-relay",
  figmaSystem: "https://www.figma.com/design/e3B6SgcYfcdvMHuQ3xoHLH",
  figmaPrototype: "https://www.figma.com/design/8mlKK2l3gEJ5wB6vTipuxA",
  figmaDeck: "https://www.figma.com/slides/VKG6ns7bXazMo8FOIVLRnU",
} as const;

export interface Stat {
  value: string;
  label: string;
  note: string;
}

/** The hero band. Five numbers, each one checkable. */
export const STATS: Stat[] = [
  { value: "50 min", label: "First commit to a live URL", note: "12:05 → 12:55, day one" },
  { value: "12", label: "Commits with nobody awake", note: "22:20 Mon → 13:07 Tue" },
  { value: "641", label: "Automated checks", note: "285 unit · 308 end-to-end · 48 pixel" },
  { value: "11", label: "Quality gates", note: "Nine of them a single command" },
  { value: "0", label: "Screens drawn by hand", note: "The Figma files are generated" },
];

export interface Failure {
  id: string;
  quote: string;
  claim: string;
  detail: string;
}

/** §2 — what was actually wrong, given that the old screen already ranked. */
export const FAILURES: Failure[] = [
  {
    id: "why",
    quote: "Ranked by urgency",
    claim: "It ranked, but never said why.",
    detail:
      "A number nobody can see is a number nobody trusts. The score was real and invisible, so the order read as arbitrary.",
  },
  {
    id: "grouping",
    quote: "ORDER · NOTIFICATION · COMMS",
    claim: "It labelled by where a task came from.",
    detail:
      "Three chips, and not one of them is a reason to act. Which inbox something arrived through says nothing about what happens if it waits.",
  },
  {
    id: "loudness",
    quote: "Review · Review · Open · Review",
    claim: "Nothing on it was the first thing.",
    detail:
      "Four rows, a button on each, and the top two share the heaviest button on the screen. A ranked list whose first and second place look identical has not finished ranking.",
  },
  {
    id: "finish",
    quote: "View all 6 items needing action",
    claim: "There was no way to be done.",
    detail:
      "A queue that never empties gives a shift no shape. Nobody can pace work they cannot see the end of.",
  },
];

export interface Tier {
  name: string;
  meaning: string;
  /** Written out rather than composed, so Tailwind's scanner can see the class. */
  fg: string;
  dot: string;
}

/** The four tiers, in rank order, each drawn in the colour it has in the product. */
export const TIERS: Tier[] = [
  {
    name: "Act now",
    meaning: "Score 60+, or anything about safety. Someone is blocked, or a truck is.",
    fg: "text-(--site-act)",
    dot: "bg-(--site-act)",
  },
  {
    name: "Up next",
    meaning: "Score 30–59. It becomes Act now if it waits.",
    fg: "text-(--site-next)",
    dot: "bg-(--site-next)",
  },
  {
    name: "When you can",
    meaning: "Under 30. Real work, no clock on it.",
    fg: "text-(--site-when)",
    dot: "bg-(--site-when)",
  },
  {
    name: "For your info",
    meaning: "Not scored at all. Read it, do nothing.",
    fg: "text-(--site-fyi)",
    dot: "bg-(--site-fyi)",
  },
];

export interface Beat {
  time: string;
  day: string;
  title: string;
  detail: string;
  /** Marks the unattended stretch: the spine is lit across these. */
  night?: boolean;
  /** The one beat that is a person, not a machine. */
  human?: boolean;
}

/**
 * §5 — the build log, transcribed from `git log`. Times are São Paulo, the machine's own
 * zone, which is also why the app's greeting is tested in three time zones (G7).
 */
export const BEATS: Beat[] = [
  {
    time: "12:05",
    day: "Mon 22",
    title: "First commit. The clock starts.",
    detail:
      "One prompt, holding the argument: rank by consequence, say why, make it finishable. Out comes a scaffold, tokens, seed data, and a priority model with its own tests.",
    human: true,
  },
  {
    time: "12:55",
    day: "Mon 22",
    title: "A deployed prototype, 50 minutes in.",
    detail:
      "Both screens, updates, look up, a ranked queue, a wireframe toggle and a production URL. That is the answer to the brief as written, and it is the last thing anybody asked for that afternoon.",
  },
  {
    time: "15:19",
    day: "Mon 22",
    title: "A second agent reviews the first, and it does not go well.",
    detail:
      "Measured, not eyeballed: the main column was narrower at 1024 than at 1440, the undo toast never appeared on screen, and wireframe mode hid its own off switch. The one beat here that is a document rather than a commit — which is why it has a file's timestamp.",
  },
  {
    time: "16:07",
    day: "Mon 22",
    title: "My call: throw the execution away and start again.",
    detail:
      "The product argument survives; the build does not. The prompt that replaces it is a plan with eleven gates, and a rule — nothing advances a phase without a green one.",
    human: true,
  },
  {
    time: "22:20",
    day: "Mon 22",
    title: "Last thing I typed that night.",
    detail:
      "Make the test loop cheap to run and cheap to read, so a long unattended run does not drown in its own output. Then bed.",
    human: true,
  },
  {
    time: "23:18",
    day: "Mon 22",
    title: "Foundations: type, colour and geometry tokens.",
    detail: "One source of truth for every value the screens are about to be built from.",
    night: true,
  },
  {
    time: "01:11",
    day: "Tue 23",
    title: "The worker screen.",
    detail: "Hero, the reason underneath it, the openable score, four tiers, and a finish line.",
    night: true,
  },
  {
    time: "02:46",
    day: "Tue 23",
    title: "The manager board.",
    detail: "Exceptions first. Four tiles that filter. Never a stopwatch on a person.",
    night: true,
  },
  {
    time: "05:28",
    day: "Tue 23",
    title: "Updates, search, and the ends of the day.",
    detail: "All-clear, end of shift, and the empty states that make a queue finishable.",
    night: true,
  },
  {
    time: "10:33",
    day: "Tue 23",
    title: "Motion: fourteen moments, each with a reduced-motion variant.",
    detail: "The done choreography first, because it is the one people will see a hundred times a shift.",
    night: true,
  },
  {
    time: "13:07",
    day: "Tue 23",
    title: "The deck. Twelve commits since the last instruction.",
    detail: "Part A is the one-hour answer in ten slides. Part B is marked Optional on every slide.",
    night: true,
  },
  {
    time: "14:11",
    day: "Wed 24",
    title: "A third agent reviews the whole thing and finds seven real defects.",
    detail:
      "One that built none of it drives every route at three widths. It also catches that the first fix for one of those defects was itself wrong, and says so in writing.",
  },
  {
    time: "17:24",
    day: "Wed 24",
    title: "Ship.",
    detail: "Every gate re-run against the deployed URL, not against a local build.",
  },
];

export interface Gate {
  id: string;
  holds: string;
  how: "command" | "judgement";
}

/** §6 — the gates, verbatim from README.md's table. */
export const GATES: Gate[] = [
  { id: "G1", holds: "Every colour resolves to a token. No literal hex outside one file", how: "command" },
  { id: "G2", holds: "Controls sharing a row share a height. Every touch target ≥44px", how: "command" },
  { id: "G3", holds: "Six widths render every surface with no scroll, overlap or clipping", how: "command" },
  { id: "G4", holds: "Zero axe violations on every route in all three modes. AA on every pair", how: "command" },
  { id: "G5", holds: "With colour removed, the ranking is still recoverable", how: "command" },
  { id: "G6", holds: "Every animation has a reduced-motion variant. Nothing loops", how: "command" },
  { id: "G7", holds: "Clocks and greetings are identical in three time zones", how: "command" },
  { id: "G8", holds: "Lighthouse ≥95 for performance and accessibility, median of three", how: "command" },
  { id: "G9", holds: "Verb-first buttons, no orphaned labels, grade ≤8 reading level", how: "command" },
  { id: "G10", holds: "Each Figma file matches what shipped, verified by screenshot", how: "judgement" },
  { id: "G11", holds: "A session that did not build it drives every route and writes the review", how: "judgement" },
];

export interface Omission {
  title: string;
  detail: string;
}

/** §7 — the honest part. */
export const OMISSIONS: Omission[] = [
  {
    title: "I did not draw a single screen in Figma.",
    detail:
      "The three Figma files exist — 42 frames, 59 components, 81 variables in three modes — and they were built last, generated from the shipped code and its tokens. A design system maintained by hand in two places drifts within days. This one has a direction, and v4 re-ran it: every frame was re-pointed at the brief's own rows by script, not by hand.",
  },
  {
    title: "I did not keep my promise that no pixel was nudged by eye.",
    detail:
      "v3 said not one spacing value was nudged by eye. v4 nudged three: the tier glyphs were redrawn a third lighter, the account control's padding is 5 and 7 rather than 6 and 6, and the ring's late label was sized against a chord I measured. Everything else is still a token with a test behind it — including the icon stroke ladder, which this system had described since v3 and never once applied.",
  },
  {
    title: "I did not do user research.",
    detail:
      "No interviews, no usability sessions, no users at all. The two personas, the site, the carriers and the cutoffs come from the brief and from one frozen Tuesday at 10:40. The desk research that does exist — three reference reports and fourteen Mobbin searches — is in the repo under plan/.",
  },
  {
    title: "I did not sit and watch it build.",
    detail:
      "A handful of prompts, then sleep. The longest stretch of work in this repository ran from 22:20 to 13:07 with nobody at the keyboard, and the reviews that caught its mistakes were run by other agents, not by me reading diffs.",
  },
  {
    title: "I did not finish everything, and the repo says so.",
    detail:
      "The demoted hero does not animate back into its row. Reduced motion collapses globally instead of per moment. /team scrolls sideways below 390, a width the app does not claim. Each one is written down where it happened rather than quietly left out.",
  },
];

export interface Surface {
  href: string;
  external?: boolean;
  eyebrow: string;
  title: string;
  detail: string;
  shot?: { src: string; alt: string };
}

/** §8 — where to go next. The prototype first, because that is the thing. */
export const SURFACES: Surface[] = [
  {
    href: LINKS.prototype,
    eyebrow: "The product",
    title: "The worker's screen",
    detail:
      "One thing at the top, the reason under it, four tiers below. Press E to finish it, ⌘K for anything else. Demo controls are in the top bar.",
    shot: { src: "/shots/work-light.png", alt: "The worker's screen: a status sentence, one hero task with its reason and a countdown, then a ranked queue in four tiers." },
  },
  {
    href: LINKS.team,
    eyebrow: "The product",
    title: "The manager's screen",
    detail:
      "Exceptions before roster. Four tiles that filter to what needs a decision, then who is already on what.",
    shot: { src: "/shots/team-dark.png", alt: "The manager's screen in dark mode: a status sentence, four filter tiles, a Needs-you list, then a board of people." },
  },
  {
    href: LINKS.system,
    eyebrow: "The system",
    title: "The design system",
    detail:
      "Foundations, components, patterns, rules and motion — every value read out of the running cascade, not typed by hand into a page about itself.",
    shot: { src: "/shots/system-light.png", alt: "The design system page, showing the type scale with every size, tracking and optical size measured from the live stylesheet." },
  },
  {
    href: LINKS.deck,
    eyebrow: "The argument",
    title: "The deck, in sixteen slides",
    detail:
      "Part A is the one-hour answer. Part B is everything past it, labelled Optional on every slide. Arrow keys move.",
    shot: { src: "/shots/deck-light.png", alt: "The first slide of the deck, with a live embed of the worker's screen." },
  },
];
