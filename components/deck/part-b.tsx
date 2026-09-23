"use client";

import Link from "next/link";
import { SlideFrame, type SlideProps } from "./slide-frame";
import { SlideTitle, SlideBody, NumberedRow } from "./deck-kit";
import { MiniWork } from "./mini-work";
import { MiniTeam } from "./mini-team";

function HiFiProduct({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="Beyond the hour" slideNumber={n} totalSlides={total} optional>
      <SlideTitle>The hi-fi product</SlideTitle>
      <div className="grid h-full grid-cols-2 gap-6 pb-2">
        <MiniWork className="h-full rounded-(--radius-hero) border border-(--border-1) shadow-(--shadow-e1)" />
        <MiniTeam className="h-full rounded-(--radius-hero) border border-(--border-1) shadow-(--shadow-e1)" />
      </div>
    </SlideFrame>
  );
}

const MOTION_ROWS = [
  "Done: the check draws, the next item rises into the hero with a shared element morph, the counter ticks, undo counts down.",
  "The countdown arc and truck tracks advance every simulated minute — digits roll, nothing pulses.",
  "One rule for all fourteen moments: show where something went. Nothing loops except the all clear aurora.",
];

function Motion({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="Beyond the hour" slideNumber={n} totalSlides={total} optional>
      <SlideTitle>Motion</SlideTitle>
      <div className="flex flex-col gap-8">
        {MOTION_ROWS.map((row, i) => (
          <NumberedRow key={row} n={i + 1}>
            {row}
          </NumberedRow>
        ))}
      </div>
      <p className="mt-10 text-(length:--text-meta) text-(--text-2)">
        Replay the real &ldquo;done&rdquo; choreography at{" "}
        <Link href="/system/patterns" className="text-(--accent) underline underline-offset-2">
          /system/patterns
        </Link>
        .
      </p>
    </SlideFrame>
  );
}

function ManagerEthics({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="Beyond the hour" slideNumber={n} totalSlides={total} optional>
      <SlideTitle>The manager view, and the line it doesn&rsquo;t cross</SlideTitle>
      <SlideBody>
        A per person stopwatch reads as surveillance, not help. The board never times a person —
        only an item, and only when that item signals a problem.
      </SlideBody>
      <div className="mt-8 flex flex-col gap-8">
        <NumberedRow n={1}>
          &ldquo;On: {"{item title}"}&rdquo; carries that item&rsquo;s own tier icon — never a
          hardcoded Act now octagon regardless of what the person is doing.
        </NumberedRow>
        <NumberedRow n={2}>
          &ldquo;Open 52 min&rdquo; appears on an item only when it may need help — never a
          running clock next to every name on the board.
        </NumberedRow>
      </div>
    </SlideFrame>
  );
}

const GATES = [
  { g: "G4", d: "axe, zero violations, at every theme × fidelity state — keyboard-only run of the demo script" },
  { g: "G6", d: "Reduced motion: every transform collapses to instant; done and undo still complete" },
  { g: "G3", d: "No computed font under 14px outside kbd; hero why and “On:” never clip" },
];

function Accessibility({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="Beyond the hour" slideNumber={n} totalSlides={total} optional>
      <SlideTitle>Accessibility</SlideTitle>
      <SlideBody>Three gates that fail the build, not a checklist read once at the end.</SlideBody>
      <div className="mt-8 flex flex-col gap-6">
        {GATES.map(({ g, d }) => (
          <div key={g} className="flex gap-6 border-b border-(--border-1) pb-6 last:border-0">
            <span className="w-16 shrink-0 text-(length:--text-deck-3) leading-(--leading-deck-3) font-semibold text-(--accent)">
              {g}
            </span>
            <p className="text-(length:--text-body) leading-(--leading-body) text-(--text-1)">{d}</p>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

function HandoffWireframe({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="Beyond the hour" slideNumber={n} totalSlides={total} optional>
      <SlideTitle>Handoff at shift end</SlideTitle>
      <p className="mb-6 max-w-2xl text-(length:--text-body) text-(--text-2)">
        An idea from Tiimo&rsquo;s end of day review — a 16:30 handoff that lists what&rsquo;s
        still open and passes it to the next shift in one action. Wireframe only; not built (§12).
      </p>
      <div className="flex flex-col gap-3 rounded-(--radius-hero) border border-dashed border-(--border-2) p-6">
        <div className="h-8 w-56 rounded-(--radius-control) bg-(--surface-3)" />
        <div className="h-16 rounded-(--radius-control) bg-(--surface-2)" />
        <div className="h-16 rounded-(--radius-control) bg-(--surface-2)" />
        <div className="h-10 w-40 self-end rounded-(--radius-control) bg-(--surface-3)" />
      </div>
    </SlideFrame>
  );
}

function NextSteps({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="Beyond the hour" slideNumber={n} totalSlides={total} optional>
      <SlideTitle>Next steps</SlideTitle>
      <div className="flex flex-col gap-8">
        <NumberedRow n={1}>
          Independent review (G9): a fresh session drives the preview against this plan and
          writes up its own verdict before anything merges.
        </NumberedRow>
        <NumberedRow n={2}>
          Cut over to `main`, rebase and merge from the project owner&rsquo;s account, so Vercel
          keeps deploying it.
        </NumberedRow>
        <NumberedRow n={3}>
          Stretch: push the final screens and the design system to Figma through the Figma MCP —
          generated from the app, not maintained by hand.
        </NumberedRow>
      </div>
    </SlideFrame>
  );
}

export const partB = [HiFiProduct, Motion, ManagerEthics, Accessibility, HandoffWireframe, NextSteps];
