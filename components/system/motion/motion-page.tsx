"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { LayoutGroup, MotionConfig, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { moments, type Moment } from "./moments";
import * as demo from "./demos";
import type { DemoProps } from "./demos";

const DEMOS: Record<number, (props: DemoProps) => React.ReactNode> = {
  1: demo.RowHover,
  2: demo.RowFocus,
  3: demo.Press,
  4: demo.MarkDone,
  5: demo.Undo,
  6: demo.UndoToast,
  7: demo.Countdown,
  8: demo.Resort,
  9: demo.NewUrgent,
  10: demo.WhyPanel,
  11: demo.RightSheet,
  12: demo.BottomSheet,
  13: demo.Palette,
  14: demo.ThemeReveal,
  15: demo.Tabs,
  16: demo.SkeletonSwap,
  17: demo.AllClearMini,
  18: demo.CountChange,
};

const RULES = [
  ["700 ms", "No interaction runs longer. The wash and the aurora fade slower, and block nothing."],
  ["0 loops", "Nothing repeats except the all-clear aurora."],
  ["0 pulses", "Nothing pulses. A pulsing countdown across a nine-hour shift is torture."],
  ["User first", "Nothing moves while the hero is being read unless the reader caused it."],
];

export function MotionPage() {
  const osReduced = useReducedMotion();
  return (
    <div className="flex max-w-6xl flex-col gap-12">
      <header className="flex flex-col gap-4">
        <h1 className="t-section text-(--text-1)">Motion</h1>
        <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
          Eighteen moments, and every one is playable. Nothing on this page runs on its own: press
          Play and the moment runs on the left as designed and on the right as it runs for someone
          who has asked for less motion. Most reduced variants read &ldquo;instant, but the colour
          cue stays&rdquo;, because colour is not motion.
        </p>
        <p data-prose-num className="t-body max-w-[68ch] text-(--text-2)">
          Curves, springs and durations are tokens, and no component may write its own. The values
          are on{" "}
          <Link href="/system" className="font-medium text-(--accent) underline underline-offset-2">
            Foundations
          </Link>
          ; what they are used for is below.
        </p>
        {osReduced && (
          <p
            data-testid="os-reduced-note"
            className="t-meta max-w-[68ch] rounded-(--r-3) border border-(--line-2) bg-(--surface-2) px-3 py-2 text-(--text-1)"
          >
            Your system asks for reduced motion, so both stages below run the reduced variant.
          </p>
        )}
        <dl className="grid gap-px overflow-hidden rounded-(--r-4) border border-(--line-1) bg-(--line-1) sm:grid-cols-2 lg:grid-cols-4">
          {RULES.map(([term, text]) => (
            <div key={term} className="flex flex-col gap-1 bg-(--surface-1) p-4">
              <dt className="t-row tnum font-semibold text-(--text-1)">{term}</dt>
              <dd className="t-meta text-(--text-2)">{text}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="flex flex-col gap-6">
        {moments.map((moment) => (
          <MomentCard key={moment.id} moment={moment} />
        ))}
      </div>
    </div>
  );
}

function MomentCard({ moment }: { moment: Moment }) {
  const [run, setRun] = useState(0);
  const [variant, setVariant] = useState(0);
  const plays = moment.plays ?? ["Play"];
  const Demo = DEMOS[moment.id];

  const facts: [string, string][] = [
    ["Trigger", moment.trigger],
    ["What moves", moment.moves],
    ["Timing", moment.ms],
    ["Easing", moment.easing],
    ["Stagger", moment.stagger],
    ["Reduced", moment.reduced],
    ["Avoid", moment.avoid],
  ];

  return (
    <article
      data-moment={moment.id}
      aria-labelledby={`moment-${moment.id}`}
      className="scroll-mt-6 rounded-(--r-5) border border-(--line-1) bg-(--surface-1)"
    >
      <header className="flex flex-wrap items-center gap-3 border-b border-(--line-1) p-4">
        <Chip size="sm" className="t-mono">
          M{moment.id}
        </Chip>
        <h2 id={`moment-${moment.id}`} className="t-row min-w-0 flex-1 text-(--text-1)">
          {moment.name}
          {moment.signature && <span className="t-meta ml-2 font-normal text-(--text-2)">the signature</span>}
        </h2>
        <div className="flex gap-2">
          {plays.map((label, i) => (
            <Button
              key={label}
              size="sm"
              variant="secondary"
              onClick={() => {
                setVariant(i);
                setRun((r) => r + 1);
              }}
            >
              {run === 0 || variant !== i ? label : `${label} again`}
            </Button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 p-4 lg:grid-cols-2">
        <Stage moment={moment} reduced={false} run={run} variant={variant} Demo={Demo} />
        <Stage moment={moment} reduced run={run} variant={variant} Demo={Demo} />
      </div>

      <dl className="grid gap-x-6 gap-y-3 border-t border-(--line-1) p-4 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map(([term, text]) => (
          <div key={term} className="flex flex-col gap-0.5">
            <dt className="t-eyebrow text-(--text-2)">{term}</dt>
            <dd data-prose-num className="t-meta text-(--text-1)">
              {text}
            </dd>
          </div>
        ))}
        <div className="flex flex-col gap-0.5">
          <dt className="t-eyebrow text-(--text-2)">Built in</dt>
          <dd className="t-mono break-words text-(--text-1)">{moment.code}</dd>
          <dd className="t-meta text-(--text-2)">
            {moment.real === "real"
              ? "This stage runs the shipped component."
              : "This stage is a miniature built from the same tokens."}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function Stage({
  moment,
  reduced,
  run,
  variant,
  Demo,
}: {
  moment: Moment;
  reduced: boolean;
  run: number;
  variant: number;
  Demo: (props: DemoProps) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div data-stage={reduced ? "reduced" : "full"} className="flex min-w-0 flex-col gap-2">
      <p className="t-eyebrow text-(--text-2)">{reduced ? "Reduced" : "Full"}</p>
      {/* `reducedMotion="always"` stops Motion's transform and layout animation and leaves
          opacity and colour free — exactly what `"user"` does under the OS setting. The
          Full stage uses "user", so a viewer who has asked for less motion sees the same
          thing on both sides and is told so above. */}
      <MotionConfig reducedMotion={reduced ? "always" : "user"}>
        <LayoutGroup id={`${moment.id}-${id}`}>
          <div
            data-motion={reduced ? "reduced" : undefined}
            className="relative isolate flex h-56 items-center justify-center overflow-hidden rounded-(--r-4) border border-(--line-1) bg-(--surface-2)"
          >
            <Demo reduced={reduced} run={run} variant={variant} />
          </div>
        </LayoutGroup>
      </MotionConfig>
    </div>
  );
}
