"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { TierIcon, type EncodedTier } from "@/components/relay/tier-icon";
import { TimePill } from "@/components/relay/time-pill";
import { SEED_NOW_ISO } from "@/state/clock";
import { Clock } from "lucide-react";
import { Anatomy, Marker } from "./anatomy";
import { componentIndex } from "./components-index";
import { SectionHead } from "./kit";
import { StatesMatrix } from "./states-matrix";

const NOW = new Date(SEED_NOW_ISO);
const at = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000).toISOString();

/** The inventory: the table M11 builds a Figma library from. */
export function ComponentIndex() {
  return (
    <section aria-labelledby="index-heading" className="flex flex-col gap-4">
      <SectionHead id="index-heading" title="The inventory">
        Fourteen components. The props are the Figma variant properties, one for one, and the
        file is the description each Figma component carries.
      </SectionHead>
      <div className="overflow-x-auto rounded-(--r-4) border border-(--line-1)">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <caption className="sr-only">Every component, its file, its props and its states</caption>
          <thead>
            <tr className="bg-(--surface-2)">
              {["Component", "Props", "States", "File"].map((h) => (
                <th key={h} scope="col" className="t-eyebrow px-4 py-2.5 text-(--text-2)">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {componentIndex.map((c) => (
              <tr key={c.name} className="border-t border-(--line-1) bg-(--surface-1) align-top">
                <th scope="row" className="t-meta px-4 py-3 font-semibold whitespace-nowrap text-(--text-1)">
                  {c.name}
                </th>
                <td className="px-4 py-3">
                  {Object.keys(c.props).length === 0 ? (
                    <span className="t-meta text-(--text-2)">None</span>
                  ) : (
                    <dl className="flex flex-col gap-0.5">
                      {Object.entries(c.props).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <dt className="t-mono text-(--text-1)">{k}</dt>
                          <dd className="t-meta text-(--text-2)">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </td>
                <td className="t-meta px-4 py-3 text-(--text-2)">{c.states}</td>
                <td className="t-mono px-4 py-3 text-(--text-2)">{c.file}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Four anatomies. Each component is the real one; the numbers are its measurements. */
export function AnatomySection() {
  return (
    <section aria-labelledby="anatomy-heading" className="flex flex-col gap-4">
      <SectionHead id="anatomy-heading" title="Anatomy">
        What each part is made of, read off the running component. A number here is a number the
        browser reports, not one typed into a document.
      </SectionHead>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
        <Anatomy
          title="Button"
          code="components/ui/button.tsx"
          parts={[
            { n: 1, name: "Container", spec: "48 high at lg, radius 12, 20 of padding. Filled with text-1, never the accent." },
            { n: 2, name: "Icon", spec: "20px at lg, 1.75 stroke. Optional, and it sits before the label." },
            { n: 3, name: "Label", spec: "16 on 24, weight 500. Verb first, one to three words." },
            { n: 4, name: "Focus ring", spec: "2px outline at 2px offset, the focus token. It is there on the frame the key lands." },
          ]}
        >
          <Button size="lg" forceState="focus" icon={<Plus aria-hidden />}>
            Add order
          </Button>
          <Marker n={1} className="left-2" />
          <Marker n={2} className="left-[3.25rem]" side="bottom" />
          <Marker n={3} className="left-[6.5rem]" />
          <Marker n={4} className="right-1" side="bottom" />
        </Anatomy>

        <Anatomy
          title="Time pill"
          code="components/relay/time-pill.tsx · components/ui/chip.tsx"
          parts={[
            { n: 1, name: "Container", spec: "28 high, radius 8, a 1px border in the tier's line colour." },
            { n: 2, name: "Icon", spec: "16px clock. Always the clock, whatever the tier." },
            { n: 3, name: "Label", spec: "14 on 20, tabular figures, so a minute ticking over does not move the box." },
            { n: 4, name: "Tint", spec: "The tier's tint. Text and border carry the hue; the fill is the quietest step." },
          ]}
        >
          <TimePill dueAt={at(-120)} now={NOW} tier="next" />
          <Marker n={1} className="left-2" />
          <Marker n={2} className="left-7" side="bottom" />
          <Marker n={3} className="left-14" />
          <Marker n={4} className="right-2" side="bottom" />
        </Anatomy>

        <Anatomy
          title="Input"
          code="components/ui/input.tsx"
          parts={[
            { n: 1, name: "Field", spec: "40 high at md, radius 10. 48 on a handheld, so the target is real." },
            { n: 2, name: "Placeholder", spec: "text-3. It is a hint, never the only label." },
            { n: 3, name: "Border", spec: "1px line-1. Invalid uses the Act-now line: an error is the one hue an input may carry." },
          ]}
        >
          <Input placeholder="Order number" className="w-56" aria-label="Order number example" />
          <Marker n={1} className="left-4" />
          <Marker n={2} className="left-24" side="bottom" />
          <Marker n={3} className="right-6" />
        </Anatomy>

        <Anatomy
          title="Toast"
          code="components/ui/toast.tsx"
          parts={[
            { n: 1, name: "Shell", spec: "360 by 56, radius 16, the overlay surface and the third shadow step. Bottom-left." },
            { n: 2, name: "Message", spec: "14 on 20, text-1. Says what happened, past tense." },
            { n: 3, name: "Detail", spec: "14 on 20, text-2. Says what changed as a result." },
            { n: 4, name: "Action", spec: "A 44px target, because a control that lives for eight seconds cannot be hard to hit." },
          ]}
        >
          <Toast
            message="Marked done"
            detail="Label printer offline"
            action={
              <Button size="sm" variant="secondary">
                Undo
              </Button>
            }
          />
          <Marker n={1} className="left-6" />
          <Marker n={2} className="left-24" />
          <Marker n={3} className="left-24" side="bottom" />
          <Marker n={4} className="right-8" side="bottom" />
        </Anatomy>
      </div>
    </section>
  );
}

const dueRows: { key: string; label: string; minutes: number }[] = [
  { key: "late-min", label: "Late, minutes", minutes: -30 },
  { key: "late-hr", label: "Late, hours", minutes: -150 },
  { key: "due-in", label: "Due in", minutes: 50 },
  { key: "due-at", label: "Due at", minutes: 240 },
  { key: "tomorrow", label: "Tomorrow", minutes: 1440 },
];
const tierCols: { key: EncodedTier; label: string }[] = [
  { key: "now", label: "Act now" },
  { key: "next", label: "Up next" },
  { key: "later", label: "When you can" },
  { key: "fyi", label: "For your info" },
];

/** The two small glyph components, which have no interactive states but plenty of variants. */
export function GlyphMatrix() {
  return (
    <section aria-labelledby="glyph-heading" className="flex flex-col gap-4">
      <SectionHead id="glyph-heading" title="Tier icon and time pill">
        Shape carries the tier before colour does: octagon, triangle, circle, square. The pill
        never chooses its own colour from lateness. Two hours late in Up next is Up next amber.
      </SectionHead>
      <StatesMatrix
        caption="Tier icon"
        rows={[
          { key: "plain", label: "Plain" },
          { key: "safety", label: "Safety" },
        ]}
        columns={tierCols}
        render={(row, col) => {
          const tier = col as EncodedTier;
          if (row === "safety" && tier !== "now")
            return (
              <div className="flex h-7 items-center">
                <span className="t-meta text-(--text-2)">Act now only</span>
              </div>
            );
          return (
            <div className="flex h-7 items-center">
            <TierIcon
              tier={tier}
              safety={row === "safety"}
              className={{ now: "text-(--act-fg)", next: "text-(--next-fg)", later: "text-(--when-fg)", fyi: "text-(--fyi-fg)" }[tier]}
            />
            </div>
          );
        }}
      />
      <StatesMatrix
        caption="Time pill"
        rows={dueRows.map((r) => ({ key: String(r.minutes), label: r.label }))}
        columns={tierCols.slice(0, 3)}
        render={(row, col) => (
          <div className="flex h-7 items-center">
            <TimePill dueAt={at(Number(row))} now={NOW} tier={col as EncodedTier} />
          </div>
        )}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Chip tier="success">
          <Clock aria-hidden />
          Done at 10:12
        </Chip>
        <span className="t-meta text-(--text-2)">Success is the only other hue a chip may carry.</span>
      </div>
    </section>
  );
}
