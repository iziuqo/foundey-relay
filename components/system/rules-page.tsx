"use client";

import { TierIcon, type EncodedTier } from "@/components/relay/tier-icon";
import { TimePill } from "@/components/relay/time-pill";
import { tierFgClass } from "@/components/relay/tier-tokens";
import { copy } from "@/lib/copy";

const NOW = new Date("2026-09-22T10:40:00-07:00");
const TWO_HOURS_LATE = new Date(NOW.getTime() - 2 * 60 * 60 * 1000).toISOString();

// EncodedTier ids (now/next/later/fyi, §8.6) — distinct from the CSS token namespace
// ("when", tokens-data.ts's `tiers`), which mirrors globals.css's `--when-*` names.
const encodedTiers: { key: EncodedTier; label: string }[] = [
  { key: "now", label: copy.tiers.now.label },
  { key: "next", label: copy.tiers.next.label },
  { key: "later", label: copy.tiers.later.label },
  { key: "fyi", label: copy.tiers.fyi.label },
];

const colorBudget: { hue: string; allowed: string; never: string }[] = [
  {
    hue: "Tier colors (Act now red orange, Up next amber, When you can slate, FYI blue)",
    allowed: "Tier icons, tier headers, the hero's border and glow, time pills",
    never: "Load, avatars, status dots",
  },
  {
    hue: "Accent (one indigo)",
    allowed: "Focus ring, selection, links, the active nav item",
    never: "Status of any kind",
  },
  {
    hue: "Success green",
    allowed: "The done check and done counts, nothing else",
    never: "Load “light”",
  },
  {
    hue: "Neutrals",
    allowed: "Everything else, including load meters and presence",
    never: "—",
  },
];

function ColorBudgetTable() {
  return (
    <div className="overflow-x-auto rounded-(--radius-control) border border-(--border-1)">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Color budget: which hue is allowed where</caption>
        <thead>
          <tr className="border-b border-(--border-1) bg-(--surface-2)">
            <th scope="col" className="p-3 text-(length:--text-meta) font-medium text-(--text-2)">Hue</th>
            <th scope="col" className="p-3 text-(length:--text-meta) font-medium text-(--text-2)">Allowed for</th>
            <th scope="col" className="p-3 text-(length:--text-meta) font-medium text-(--text-2)">Never for</th>
          </tr>
        </thead>
        <tbody>
          {colorBudget.map((row) => (
            <tr key={row.hue} className="border-b border-(--border-1) last:border-0 align-top">
              <td className="p-3 text-(length:--text-body) text-(--text-1)">{row.hue}</td>
              <td className="p-3 text-(length:--text-body) text-(--text-2)">{row.allowed}</td>
              <td className="p-3 text-(length:--text-body) text-(--text-2)">{row.never}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** §9.2 P0 8's fix, made checkable by eye: the same lateness ("2h late") rendered at
 * every tier. If any pill below reads in the Act now hue outside the first row, the
 * rule is broken — TimePill takes `tier` as a required prop precisely so it can't
 * happen (§8.6). */
function LoudnessDemo() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-(length:--text-meta) text-(--text-2)">
        Same lateness (2 h) on every row below — only the color changes, and only because the tier
        does.
      </p>
      {encodedTiers.map((tier) => (
        <div
          key={tier.key}
          className="flex min-w-0 flex-wrap items-center gap-3 rounded-(--radius-control) border border-(--border-1) bg-(--surface-1) p-3"
        >
          <TierIcon tier={tier.key} className={tierFgClass[tier.key]} />
          <span className="min-w-0 shrink-0 text-(length:--text-row) font-medium text-(--text-1)">
            {tier.label}
          </span>
          <TimePill dueAt={TWO_HOURS_LATE} now={NOW} tier={tier.key} />
        </div>
      ))}
    </div>
  );
}

const LONG_WHY =
  "Ranks above Order 4821 and Order 4809 because it blocks 140 orders across two carriers and the printer has no manual fallback at Pack 7";
const LONG_ROLE = "Senior outbound exceptions coordinator, cross-dock and returns";

/** §9.2 P1 9-11 / G3: neither question the plan's two tests ask (§2.1) may truncate.
 * These two lines are set to real components with content picked to be longer than
 * anything in the seed data, so the rule is visibly true here, not just asserted by a
 * Playwright `scrollWidth` check nobody in this room can see run. */
function NoTruncationDemo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-(--radius-control) border border-(--border-1) bg-(--surface-1) p-4">
        <p className="mb-2 text-(length:--text-meta) font-medium text-(--text-2)">
          The 3 second test (worker): the hero&rsquo;s why line
        </p>
        <p className="max-w-md text-(length:--text-body) text-(--text-1)">{LONG_WHY}</p>
      </div>
      <div className="rounded-(--radius-control) border border-(--border-1) bg-(--surface-1) p-4">
        <p className="mb-2 text-(length:--text-meta) font-medium text-(--text-2)">
          The one glance test (manager): a person&rsquo;s role
        </p>
        <p className="max-w-xs text-(length:--text-row) font-medium whitespace-normal text-(--text-1)">
          {LONG_ROLE}
        </p>
      </div>
    </div>
  );
}

export function RulesPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-16">
      <header>
        <h1 className="text-(length:--text-title) font-semibold text-(--text-1)">Rules</h1>
        <p className="mt-2 text-(length:--text-body) text-(--text-2)">
          Three constraints every screen in §6 is built inside of. Each is enforced by a gate (§9), not
          just written down here.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-(length:--text-title) leading-(--leading-title) font-semibold text-(--text-1)">
            Color budget
          </h2>
          <p className="mt-1 text-(length:--text-body) text-(--text-2)">
            §4.2. Load is a neutral inline meter with three numbers, never a green / amber / red word.
          </p>
        </div>
        <ColorBudgetTable />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-(length:--text-title) leading-(--leading-title) font-semibold text-(--text-1)">
            Loudness follows rank
          </h2>
          <p className="mt-1 text-(length:--text-body) text-(--text-2)">
            §2.3. No element in a lower tier may be more saturated than any element in a higher tier.
            &ldquo;2 h late&rdquo; in Up next is the Up next color, not a solid Act now red.
          </p>
        </div>
        <LoudnessDemo />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-(length:--text-title) leading-(--leading-title) font-semibold text-(--text-1)">
            No truncation on the two questions
          </h2>
          <p className="mt-1 text-(length:--text-body) text-(--text-2)">
            §2.1. The 3 second test and the one glance test both fail the moment their answer is cut
            off with an ellipsis. Roles wrap; they never truncate (§9.2 P1 11).
          </p>
        </div>
        <NoTruncationDemo />
      </section>
    </div>
  );
}
