"use client";

import { SlideFrame, type SlideProps } from "./slide-frame";
import { SlideTitle, SlideBody, NumberedRow, QuoteCard, FailureFix } from "./deck-kit";
import { MiniWork } from "./mini-work";
import { MiniTeam } from "./mini-team";
import { WhyFactors } from "@/components/relay/why-factors";
import { RelayMark } from "@/components/relay/mark";
import { queueFor } from "@/lib/selectors";
import { items as seedItems } from "@/lib/seed";

const NOW = new Date("2026-09-22T10:40:00-07:00");

function Cover({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="The one hour answer" slideNumber={n} totalSlides={total} noFooter>
      <div className="flex h-full flex-col justify-center">
        <div className="mb-10 flex items-center gap-6">
          <RelayMark className="size-16" />
          <h1 className="text-(length:--text-deck-1) leading-(--leading-deck-1) font-semibold tracking-tight text-(--text-1)">
            Relay
          </h1>
        </div>
        <SlideBody>
          Making the next right action obvious — for the people doing the work, and the people
          leading it.
        </SlideBody>
        <p className="mt-10 text-(length:--text-meta) text-(--text-2)">
          Foundey Senior Product Designer challenge · September 2026
        </p>
      </div>
    </SlideFrame>
  );
}

const ONE_SLIDE_ROWS = [
  "People don't need a longer list. They need to know what to do first, and why.",
  "Work sorts into three groups by time. One task sits at the top. Every rank is explained in plain words.",
  "Managers see the same work, so they can spot risk and step in — never a stopwatch on a person.",
];

function OneSlide({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="The one hour answer" slideNumber={n} totalSlides={total}>
      <SlideTitle>If you only see one slide</SlideTitle>
      <div className="flex flex-col gap-8">
        {ONE_SLIDE_ROWS.map((row, i) => (
          <NumberedRow key={row} n={i + 1}>
            {row}
          </NumberedRow>
        ))}
      </div>
    </SlideFrame>
  );
}

function Brief({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="The one hour answer" slideNumber={n} totalSlides={total}>
      <SlideTitle>Two complaints, one screen</SlideTitle>
      <div className="mb-8 flex gap-6">
        <QuoteCard quote="I never know what needs my attention first." label="Workers" />
        <QuoteCard quote="I cannot see what each worker is doing." label="Managers" />
      </div>
      <SlideBody>
        The brief: redesign the dashboard so people can quickly identify the priority of
        individual work, from most critical to least urgent.
      </SlideBody>
    </SlideFrame>
  );
}

function Insight({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="The one hour answer" slideNumber={n} totalSlides={total}>
      <SlideTitle>It already ranks. That&rsquo;s not the fix.</SlideTitle>
      <SlideBody>
        The current screen already has a queue titled &ldquo;Needs Your Attention, ranked by
        urgency, pulled from every source below.&rdquo; People still complain. Ranking was never
        the missing piece.
      </SlideBody>
      <p className="mt-8 max-w-2xl text-(length:--text-deck-3) leading-(--leading-deck-3) font-medium text-(--text-1)">
        Missing: trust (it never says why), the right labels (source, not consequence), a single
        first thing, a finish line, and any manager surface at all.
      </p>
    </SlideFrame>
  );
}

const FAILURES: { failure: string; fix: string }[] = [
  { failure: "Ranks, but never says why", fix: "A cause line on every row, a “why first?” popover" },
  { failure: "Labels by source, not consequence", fix: "Three groups named by time: Act now, Up next, When you can" },
  { failure: "Every row carries equal weight", fix: "Rows are quiet. One hero card carries the one visible action" },
  { failure: "No finish line", fix: "A done count, an undo toast, and a calm “you’re clear” state" },
  { failure: "No manager surface at all", fix: "A Team screen: risk tiles, Needs you, and a people board" },
];

function Failures({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="The one hour answer" slideNumber={n} totalSlides={total}>
      <SlideTitle>Five failures, five fixes</SlideTitle>
      <div className="flex flex-col">
        {FAILURES.map((row) => (
          <FailureFix key={row.failure} {...row} />
        ))}
      </div>
    </SlideFrame>
  );
}

function Assumptions({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="The one hour answer" slideNumber={n} totalSlides={total}>
      <SlideTitle>Assumptions</SlideTitle>
      <div className="flex flex-col gap-8">
        <NumberedRow n={1}>
          Read from about 2 metres away, on a shared workstation — type has to work at that
          distance, not just at a designer&rsquo;s desk.
        </NumberedRow>
        <NumberedRow n={2}>
          Two personas cover the ask: a coordinator doing the work, and a manager watching the
          floor. Both open the same app.
        </NumberedRow>
        <NumberedRow n={3}>
          The priority formula and the seed data are already right (tested, explainable in one
          sentence) — the job is execution, not a new model.
        </NumberedRow>
      </div>
    </SlideFrame>
  );
}

function Prioritized({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="The one hour answer" slideNumber={n} totalSlides={total}>
      <SlideTitle>What we prioritized</SlideTitle>
      <div className="flex flex-col gap-6">
        <NumberedRow n={1}>
          Calm chrome, vivid moments — a quiet shell, with eye candy confined to four named
          moments (the hero, the truck clock, done, all clear).
        </NumberedRow>
        <NumberedRow n={2}>
          Dark mode as a first class citizen, not a filter — the same token layer light needs
          anyway.
        </NumberedRow>
        <NumberedRow n={3}>
          The app is the one source of truth. /system and this deck are pulled from its own
          components, not redrawn by hand.
        </NumberedRow>
      </div>
    </SlideFrame>
  );
}

function Wireframe({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="The one hour answer" slideNumber={n} totalSlides={total}>
      <SlideTitle>The wireframe — deliverable 2</SlideTitle>
      <p className="mb-4 text-(length:--text-meta) text-(--text-2)">
        Not empty boxes: the real screens, with every hue token swapped for gray (§4.7). This is
        the same toggle `/work` itself ships with.
      </p>
      <div className="grid h-full grid-cols-2 gap-6 pb-2">
        <MiniWork wire className="h-full rounded-(--radius-hero) border border-(--border-1)" />
        <MiniTeam wire className="h-full rounded-(--radius-hero) border border-(--border-1)" />
      </div>
    </SlideFrame>
  );
}

function PriorityRule({ n, total }: SlideProps) {
  const now = NOW;
  const queue = queueFor(seedItems, "u1", now);
  const nextRanked = queue.now[1] ?? queue.next[0] ?? null;
  if (!queue.hero) return null;
  return (
    <SlideFrame eyebrow="The one hour answer" slideNumber={n} totalSlides={total}>
      <SlideTitle>The priority rule, in one screen</SlideTitle>
      <div className="grid grid-cols-2 items-start gap-10">
        <div>
          <SlideBody>
            Time (T) + Orders blocked (B) + Impact (I). One score, one sort, the same rule for
            every item — read straight out of the running code, not retyped for this slide.
          </SlideBody>
        </div>
        <div className="rounded-(--radius-hero) border border-(--border-1) bg-(--surface-1) p-6">
          <WhyFactors ranked={queue.hero} nextRanked={nextRanked} now={now} />
        </div>
      </div>
    </SlideFrame>
  );
}

function WhatWeCut({ n, total }: SlideProps) {
  return (
    <SlideFrame eyebrow="The one hour answer" slideNumber={n} totalSlides={total}>
      <SlideTitle>What we cut</SlideTitle>
      <div className="flex flex-col gap-8">
        <NumberedRow n={1}>
          Figma. Pushed from the live pages with the Figma MCP after Phase 8 — a stretch goal, not
          a hand maintained third artifact.
        </NumberedRow>
        <NumberedRow n={2}>
          This deck. 27 slides became 10, plus 6 clearly marked optional — the one hour answer
          stays the first thing anyone reads.
        </NumberedRow>
        <NumberedRow n={3}>
          A third demo persona, and the Tiimo style end of shift handoff — both real ideas, both
          left as a wireframe slide (Part B) instead of built.
        </NumberedRow>
      </div>
    </SlideFrame>
  );
}

export const partA = [
  Cover,
  OneSlide,
  Brief,
  Insight,
  Failures,
  Assumptions,
  Prioritized,
  Wireframe,
  PriorityRule,
  WhatWeCut,
];
