import raw from "../plan/seed.json";
import type { Item, Person, Cutoff, UpdateEntry, DoneEntry, Tier } from "./types";

const tierIdBySeedTier: Record<string, Tier> = {
  "Act now": "now",
  "Up next": "next",
  "When you can": "later",
  "For your info": "fyi",
};

function normalizeItem(raw: {
  _expected?: { score: number | null; tier: string };
  [key: string]: unknown;
}): Item {
  return {
    ...raw,
    _expected: raw._expected
      ? { score: raw._expected.score, tier: tierIdBySeedTier[raw._expected.tier] }
      : undefined,
  } as Item;
}

export const site = raw.site as {
  code: string;
  name: string;
  timezone: string;
  now: string;
  shift: { name: string; start: string; end: string; handoffAt: string };
  cutoffs: Cutoff[];
};

export const team = raw.team as Person[];
export const items: Item[] = raw.items.map(normalizeItem);
export const updates = raw.updates as UpdateEntry[];
export const demoInjections: Item[] = raw.demoInjections.map(normalizeItem);
export const doneToday = raw.doneToday as DoneEntry[];

export const seedNow = site.now;
