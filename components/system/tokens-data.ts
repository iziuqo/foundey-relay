// Mirrors app/globals.css §4.1-4.2. Kept as data so the Foundations page renders every
// token that actually exists instead of a hand-typed subset that can drift from it.

export const primitiveScales: { name: string; steps: number[] }[] = [
  { name: "gray", steps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { name: "red", steps: [1, 3, 6, 9, 11] },
  { name: "amber", steps: [1, 3, 6, 9, 11] },
  { name: "slate", steps: [1, 3, 6, 9, 11] },
  { name: "blue", steps: [1, 3, 6, 9, 11] },
  { name: "indigo", steps: [3, 6, 9, 11] },
  { name: "green", steps: [3, 6, 9, 11] },
];

export const semanticTokens = [
  "--bg",
  "--surface-1",
  "--surface-2",
  "--surface-3",
  "--text-1",
  "--text-2",
  "--text-3",
  "--border-1",
  "--border-2",
  "--accent",
  "--focus",
  "--accent-solid",
  "--accent-solid-fg",
  "--overlay",
];

// Each --text-N on --bg or --surface-1, the pairs components actually render.
export const semanticContrastPairs: { fg: string; bg: string; label: string }[] = [
  { fg: "--text-1", bg: "--bg", label: "text-1 on bg" },
  { fg: "--text-2", bg: "--bg", label: "text-2 on bg" },
  { fg: "--text-3", bg: "--bg", label: "text-3 on bg" },
  { fg: "--text-1", bg: "--surface-1", label: "text-1 on surface-1" },
  { fg: "--text-2", bg: "--surface-1", label: "text-2 on surface-1" },
  { fg: "--accent-solid-fg", bg: "--accent-solid", label: "accent-solid-fg on accent-solid (primary button)" },
];

export const tiers = [
  { key: "now", label: "Act now" },
  { key: "next", label: "Up next" },
  { key: "when", label: "When you can" },
  { key: "fyi", label: "For your info" },
] as const;

export const tierContrastPairs = tiers.map((tier) => ({
  fg: `--${tier.key}-fg`,
  bg: `--${tier.key}-bg`,
  label: `${tier.label}: fg on bg`,
}));
