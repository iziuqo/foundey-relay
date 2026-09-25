// Mirrors app/globals.css. Kept as data so the Foundations page renders every token
// that actually exists instead of a hand-typed subset that can drift from it.
//
// v3 M1: tier keys are the token prefixes (`act`, not `now`) — v2's list said `now`,
// so every tier swatch on this page was reading `--now-fg`, a token that has never
// existed, and rendering nothing.

export interface TypeStep {
  /** The utility class, which is also the token family name. */
  utility: string;
  role: string;
  where: string;
  sample: string;
}

/** Every step of the scale, in order, with the rule for what gets it. */
export const typeScale: TypeStep[] = [
  {
    utility: "t-hero",
    role: "Hero title",
    where: "The one first thing. The largest type on any working screen",
    sample: "Order #4821 — payment mismatch",
  },
  {
    utility: "t-hero-sm",
    role: "Hero title, handheld",
    where: "The hero below 768 only",
    sample: "Order #4821 — payment mismatch",
  },
  {
    utility: "t-section",
    role: "Section",
    where: "The status line, sheet titles, section heads",
    sample: "3 need you now · UPS Ground in 50 min",
  },
  {
    utility: "t-row",
    role: "Row title",
    where: "Every row in the product — queue and people alike. One step, no exceptions",
    sample: "Tomasz flagged you in \"Medical supplies escalation\"",
  },
  {
    utility: "t-body",
    role: "Body",
    where: "Running prose: the why sentence, detail body, deck captions",
    sample: "A failed payment re-authorisation is holding 24 orders at pack, and this one is already 2 hours late.",
  },
  {
    utility: "t-meta",
    role: "Meta",
    where: "Anything that qualifies a title: causes, counts, timestamps, tier labels",
    sample: "Blocking fulfillment · 24 orders held",
  },
  {
    utility: "t-eyebrow",
    role: "Eyebrow",
    where: "Section eyebrows and table column heads only",
    sample: "Act now · 1 of 6",
  },
  {
    utility: "t-mono",
    role: "Identifier",
    where: "Order numbers, bin codes, door numbers, keyboard hints. Never prose",
    sample: "#4821 · P3 A114 · Door 14 · ⌘K",
  },
  {
    utility: "t-finish",
    role: "Finish",
    where: "The all-clear headline, and nowhere else",
    sample: "You are clear until 13:00.",
  },
];

/** Surfaces first, then ink, then lines — the order a screen is built in. */
export const semanticGroups: { title: string; tokens: string[] }[] = [
  { title: "Surface", tokens: ["--bg", "--surface-1", "--surface-2", "--surface-3"] },
  { title: "Ink", tokens: ["--text-1", "--text-2", "--text-3"] },
  { title: "Line", tokens: ["--line-1", "--line-2"] },
  { title: "Action", tokens: ["--primary-bg", "--primary-fg", "--accent", "--focus"] },
  { title: "Done", tokens: ["--success-fg", "--success-bg"] },
];

export const semanticContrastPairs: { fg: string; bg: string; label: string }[] = [
  { fg: "--text-1", bg: "--bg", label: "text-1 on canvas" },
  { fg: "--text-2", bg: "--bg", label: "text-2 on canvas" },
  { fg: "--text-1", bg: "--surface-1", label: "text-1 on a card" },
  { fg: "--text-2", bg: "--surface-1", label: "text-2 on a card" },
  { fg: "--text-3", bg: "--bg", label: "text-3 on canvas (large only)" },
  { fg: "--primary-fg", bg: "--primary-bg", label: "the primary button" },
];

export const tiers = [
  { key: "act", label: "Act now", icon: "filled octagon", weight: "600" },
  { key: "next", label: "Up next", icon: "filled triangle", weight: "600" },
  { key: "when", label: "When you can", icon: "hollow circle", weight: "500" },
  { key: "fyi", label: "For your info", icon: "hollow square", weight: "500" },
] as const;

export const tierContrastPairs = tiers.map((tier) => ({
  fg: `--${tier.key}-fg`,
  bg: `--${tier.key}-bg`,
  label: `${tier.label}: label on its own tint`,
}));

/** The five places a saturated hue is allowed to appear at all. Everything else is neutral. */
export const chromaWhitelist = [
  "Tier foreground: the icon, the tier label, and a time chip's text and border",
  "The Act-now row tint and the hero's tint and tier rail — Act now is the only tier with a row tint",
  "The focus ring, and only under :focus-visible",
  "The done check and the “n of m done” counter",
  "Links inside prose",
];

export const chromaBanned =
  "The primary button’s fill, nav active state, avatars, presence dots, load meters, progress tracks, the shift timeline, and every deck element except one inverted divider.";

/** Radius is a function of height, not a constant: r = round(h × 0.28), snapped here. */
export const radiusLadder = [
  { token: "--r-2", value: "8px", where: "Chip and time pill (h28), small control (h32)" },
  { token: "--r-3", value: "10px", where: "Input and default control (h40)" },
  { token: "--r-4", value: "12px", where: "Primary action (h48), row, rail card" },
  { token: "--r-5", value: "16px", where: "Hero card, sheet, palette, toast" },
  { token: "--r-1", value: "4px", where: "Inner boxes that share a corner with a larger one" },
  { token: "--r-full", value: "9999px", where: "Avatar, icon-only round button" },
];

export const heightLadder = [
  { token: "--h-xs", where: "Chip, time pill" },
  { token: "--h-sm", where: "Small control" },
  { token: "--h-md", where: "Input, default control" },
  { token: "--h-lg", where: "Primary action" },
  { token: "--h-band", where: "Tier group band" },
  { token: "--h-row-dense", where: "Manager roster row" },
  { token: "--h-row", where: "Queue row" },
  { token: "--h-topbar", where: "Top bar" },
];

/**
 * Size and stroke are one decision. Until v4 only the sizes existed here and lucide's own
 * `stroke-width="2"` attribute won on every glyph in the app, so a 16px icon and a 20px
 * one carried the same weight. The `icon-*` utilities set both together.
 */
export const iconLadder = [
  { token: "--icon-sm", stroke: "--icon-stroke-sm", where: "Inside a 32px control, and the queue row's tier glyph" },
  { token: "--icon-md", stroke: "--icon-stroke-md", where: "Inside a 40px control" },
  { token: "--icon-lg", stroke: "--icon-stroke-lg", where: "Inside a 48px control, and the nav rail" },
  { token: "--icon-xl", stroke: "--icon-stroke-xl", where: "The largest bare glyph" },
];

export const motionTokens = [
  { token: "--dur-instant", where: "Row tint, press" },
  { token: "--dur-quick", where: "Reveals, crossfades" },
  { token: "--dur-base", where: "Panels, the check draw" },
  { token: "--dur-roll", where: "Number roll" },
  { token: "--dur-move", where: "Undo, theme reveal" },
  { token: "--dur-slow", where: "The moved-row wash, aurora fade-in" },
];

export const easeTokens = [
  { token: "--ease-out", where: "Entrances and reveals" },
  { token: "--ease-inout", where: "Overlays, sheets, glides" },
  { token: "--ease-in", where: "Exits only" },
];
