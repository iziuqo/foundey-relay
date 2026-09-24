import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PersonAvatar } from "@/components/relay/person-avatar";
import { TierIcon, type EncodedTier } from "@/components/relay/tier-icon";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { HeightReadout } from "./height-readout";
import { ModePanel, PageHead, Verdict } from "./kit";

/**
 * The four rules that carry this redesign, each drawn twice. The "don't" side is never a
 * sketch: it is the same real primitives arranged the way v2 arranged them, so the
 * difference on screen is exactly the difference the rule names.
 */

const WHY =
  "Ranks above Order 4821 and Order 4809 because it blocks 140 orders across two carriers and the printer has no manual fallback at Pack 7.";
const ROLE = "Senior outbound exceptions coordinator, cross-dock and returns";

export function RulesPage() {
  return (
    <div className="flex max-w-5xl flex-col gap-20">
      <PageHead title="Rules">
        Four rules carry this redesign. Each is drawn as a pair — the way Relay does it, and the way
        v2 did — with real components on both sides. Every one is enforced by a test, not by good
        intentions.
      </PageHead>

      <Rule
        n={1}
        id="loudness"
        title="Loudness follows rank"
        rule="The louder an object is, the higher the tier it belongs to. Only Act now carries a row tint, and no element in a lower tier may be more saturated than one in a higher tier."
        gate="craft checks 6 and 8 · G5 the wire test"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <Verdict kind="do" caption="Rank descends in lightness, chroma and weight together.">
            <LoudnessRows />
          </Verdict>
          <Verdict kind="dont" caption="Every tier tinted, and a solid red pill on the second tier.">
            <LoudnessRows loud />
          </Verdict>
          <Verdict kind="do" caption="The grayscale test: take the hue away and the order is still there.">
            <ModePanel mode="wire" label={false} className="border-0 p-0">
              <LoudnessRows />
            </ModePanel>
          </Verdict>
          <p data-prose-num className="t-body self-center text-(--text-2)">
            Wire is not a filter. It is light with every chroma channel multiplied by zero, so what
            is left is the lightness ladder, the weight, and the shape of the icon. If the ranking
            survives that, the ranking is real.
          </p>
        </div>
      </Rule>

      <Rule
        n={2}
        id="row-height"
        title="One height per row"
        rule="Every row in a list is the same height, and anything that shares a row shares a height token and a vertical centre. Separators are inset shadows, never borders, so a separator cannot change a height."
        gate="G2 size contract · craft checks 3 and 4"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <Verdict kind="do" caption="Every row is --h-row. The action sits in a reserved track.">
            <HeightReadout className="flex flex-col rounded-(--r-3) bg-(--surface-2)">
              {["Label printer offline", "Order 4821 payment mismatch", "Reply to vendor", "Rush order 4796"].map(
                (title) => (
                  <li
                    key={title}
                    className="flex h-(--h-row) items-center gap-3 px-3 shadow-[inset_0_-1px_0_var(--line-1)] last:shadow-none"
                  >
                    <span className="min-w-0 flex-1 t-row text-(--text-1)">{title}</span>
                    <Button size="sm" variant="secondary" className="w-20">
                      Open
                    </Button>
                  </li>
                ),
              )}
            </HeightReadout>
          </Verdict>
          <Verdict kind="dont" caption="Height follows content. A border, a wrapped line, two button sizes.">
            <HeightReadout className="flex flex-col rounded-(--r-3) bg-(--surface-2)">
              <li className="flex items-center gap-3 border-b border-(--line-1) px-3 py-3.5">
                <span className="min-w-0 flex-1 t-row text-(--text-1)">Label printer offline</span>
                <Button size="sm" variant="secondary">
                  Open
                </Button>
              </li>
              <li className="flex items-center gap-3 border-b border-(--line-1) px-3 py-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block t-row text-(--text-1)">Order 4821 payment mismatch</span>
                  <span className="block t-meta text-(--text-2)">Held at pack, one order waiting on this</span>
                </span>
                <Button size="md" variant="secondary">
                  Open
                </Button>
              </li>
              <li className="flex items-center gap-3 border-b border-(--line-1) px-3 py-3.5">
                <span className="min-w-0 flex-1 t-row text-(--text-1)">Reply to vendor</span>
              </li>
              <li className="flex items-center gap-3 px-3 py-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block t-row text-(--text-1)">Rush order 4796</span>
                  <span className="block t-meta text-(--text-2)">Due tomorrow, nothing blocked</span>
                </span>
                <Button size="sm" variant="secondary">
                  Open
                </Button>
              </li>
            </HeightReadout>
          </Verdict>
        </div>
      </Rule>

      <Rule
        n={3}
        id="colour"
        title="Colour only for priority and success"
        rule="A saturated hue is allowed in exactly five places: tier foregrounds, the Act-now tint, the focus ring, the done check and its counter, and links in prose. Everything else is neutral — avatars, presence, load, progress, navigation."
        gate="craft check 8 · unit gate on the chroma whitelist"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <Verdict kind="do" caption="One tier signal, one success signal. Load is a number and a neutral bar.">
            <ul className="flex flex-col gap-3">
              <PersonRow initials="DR" name="Danielle Reyes" role="Shift lead" load={7} meter="neutral" tier="now" />
              <PersonRow initials="MO" name="Marcus Okafor" role="Picker" load={4} meter="neutral" />
              <li className="flex items-center gap-2">
                <Chip tier="success">Done today: 6</Chip>
              </li>
            </ul>
          </Verdict>
          <Verdict kind="dont" caption="Hue on avatars, presence and load, and an accent on navigation.">
            <ul className="flex flex-col gap-3">
              <PersonRow initials="DR" name="Danielle Reyes" role="Shift lead" load={7} meter="traffic" />
              <PersonRow initials="MO" name="Marcus Okafor" role="Picker" load={4} meter="traffic" />
              <li className="flex items-center gap-2">
                <span className="inline-flex h-8 items-center rounded-(--r-2) bg-(--accent) px-3 t-meta font-medium text-(--bg)">
                  Team
                </span>
                <span className="t-meta text-(--text-2)">Active nav item, filled with the accent</span>
              </li>
            </ul>
          </Verdict>
        </div>
      </Rule>

      <Rule
        n={4}
        id="truncation"
        title="No truncation on the brief’s two questions"
        rule="The worker’s question (what do I do first, and why) and the manager’s (who needs help, and who is who) are answered by text. An ellipsis in either is a failed answer. Roles wrap; the why line wraps."
        gate="G9 copy · G3 no clipped text at six widths"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <Verdict kind="do" caption="Both answers wrap onto as many lines as they need.">
            <Answers wrap />
          </Verdict>
          <Verdict kind="dont" caption="Both answers cut off with an ellipsis, one line each.">
            <Answers />
          </Verdict>
        </div>
      </Rule>
    </div>
  );
}

function Rule({
  n,
  id,
  title,
  rule,
  gate,
  children,
}: {
  n: number;
  id: string;
  title: string;
  rule: string;
  gate: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`rule-${id}`} data-rule={n} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <p className="t-eyebrow text-(--text-2)">Rule {n}</p>
        <h2 id={`rule-${id}`} className="t-section text-(--text-1)">
          {title}
        </h2>
        <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
          {rule}
        </p>
        <p className="t-meta text-(--text-2)">
          <span className="font-semibold text-(--text-1)">Enforced by</span> {gate}
        </p>
      </div>
      {children}
    </section>
  );
}

const tierRows: { tier: EncodedTier; label: string; title: string }[] = [
  { tier: "now", label: copy.tiers.now.label, title: "Label printer offline" },
  { tier: "next", label: copy.tiers.next.label, title: "Order 4821 mismatch" },
  { tier: "later", label: copy.tiers.later.label, title: "Rush order 4796" },
  { tier: "fyi", label: copy.tiers.fyi.label, title: "Dock 3 camera moved" },
];

const tone: Record<EncodedTier, string> = {
  now: "text-(--act-fg)",
  next: "text-(--next-fg)",
  later: "text-(--when-fg)",
  fyi: "text-(--fyi-fg)",
};

const rowTint: Record<EncodedTier, string> = {
  now: "bg-(--act-bg)",
  next: "bg-(--next-bg)",
  later: "bg-(--when-bg)",
  fyi: "bg-(--fyi-bg)",
};

const chipTier: Record<EncodedTier, "now" | "next" | "later" | "fyi"> = {
  now: "now",
  next: "next",
  later: "later",
  fyi: "fyi",
};

function LoudnessRows({ loud = false }: { loud?: boolean }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {tierRows.map((row) => {
        // The wrong version: a tint under every tier, and the second tier's pill filled
        // with Act now's own red, which is what v1 shipped for "Late by 2 h".
        const tinted = loud ? rowTint[row.tier] : row.tier === "now" ? rowTint.now : "bg-(--surface-1)";
        const solidPill = loud && row.tier === "next";
        return (
          <li key={row.tier} className={cn("flex h-14 items-center gap-2.5 rounded-(--r-3) px-3", tinted)}>
            <TierIcon tier={row.tier} className={tone[row.tier]} />
            <span className="min-w-0 flex-1">
              <span className={cn("block t-eyebrow", tone[row.tier])}>{row.label}</span>
              {/* truncate, like the real QueueRow this illustrates: the row is a fixed
                h-14 so that craft checks 3 and 4 hold (one height, one centre), and a
                title allowed to wrap grew the content to ~68px, broke out of the tint and
                landed on the next row's eyebrow at 1024 and 390. */}
              <span className="block truncate t-row text-(--text-1)">{row.title}</span>
            </span>
            {row.tier !== "fyi" && (
              <Chip
                tier={chipTier[row.tier]}
                className={cn(solidPill && "border-(--act-fg) bg-(--act-fg) text-(--bg)")}
              >
                <Clock aria-hidden />
                <span className="tnum">Late by 2 h</span>
              </Chip>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function PersonRow({
  initials,
  name,
  role,
  load,
  meter,
  tier,
}: {
  initials: string;
  name: string;
  role: string;
  load: number;
  meter: "neutral" | "traffic";
  tier?: EncodedTier;
}) {
  const pct = `${Math.min(100, (load / 8) * 100)}%`;
  const traffic = load >= 7 ? "bg-(--act-fg)" : load >= 5 ? "bg-(--next-fg)" : "bg-(--success-fg)";
  return (
    <li className="flex items-center gap-3">
      {meter === "traffic" ? (
        <span
          aria-hidden
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-(--fyi-bg) t-meta font-semibold text-(--fyi-fg)"
        >
          {initials}
        </span>
      ) : (
        <PersonAvatar initials={initials} />
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 t-row text-(--text-1)">
          {name}
          {meter === "traffic" && <span aria-hidden className="size-2 rounded-full bg-(--success-fg)" />}
          {tier && <TierIcon tier={tier} className={cn("size-(--icon-sm)", tone[tier])} />}
        </span>
        <span className="block t-meta text-(--text-2)">{role}</span>
      </span>
      <span className="flex w-28 shrink-0 items-center gap-2">
        <span aria-hidden className="h-1.5 flex-1 overflow-hidden rounded-full bg-(--line-1)">
          {/* Dynamic geometry, like the factor bars: the width is data. */}
          <span
            className={cn("block h-full rounded-full", meter === "neutral" ? "bg-(--text-1)" : traffic)}
            // eslint-disable-next-line react/forbid-dom-props -- bar width is data, as in why-factors
            style={{ width: pct }}
          />
        </span>
        <span className="tnum t-meta text-(--text-2)">{load} of 8</span>
      </span>
    </li>
  );
}

function Answers({ wrap = false }: { wrap?: boolean }) {
  const clip = wrap ? "" : "truncate";
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-(--r-3) bg-(--surface-2) p-3">
        <p className="mb-1 t-eyebrow text-(--text-2)">Worker · why is this first?</p>
        <p className={cn("t-body text-(--text-1)", clip)}>{WHY}</p>
      </div>
      <div className="rounded-(--r-3) bg-(--surface-2) p-3">
        <p className="mb-1 t-eyebrow text-(--text-2)">Manager · who is this?</p>
        <p className={cn("t-row text-(--text-1)", clip)}>{ROLE}</p>
      </div>
    </div>
  );
}
