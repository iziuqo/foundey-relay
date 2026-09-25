"use client";

import { Fragment } from "react";

import { SlideFrame, type SlideProps } from "./slide-frame";
import { SlideTitle, Lead, Body, Label, Split, Column, ListSlide, Stats, Stat, RuleRow, Legend, rich } from "./deck-kit";
import { DeviceFrame, Annotation } from "./device-frame";
import { MiniWork, WORK_DESIGN_WIDTH } from "./mini-work";
import { MiniTeam, TEAM_DESIGN_WIDTH } from "./mini-team";
import { DECK_NOW } from "./deck-now";
import * as copy from "./deck-copy";
import { WhyFactors, FACTOR_MAX } from "@/components/relay/why-factors";
import { RelayMark } from "@/components/relay/mark";
import { queueFor } from "@/lib/selectors";
import { items as seedItems } from "@/lib/seed";

const EYEBROW = "Part A · The one-hour answer";

/** The three-column sections all share a shape: a title, a lead, and up to three columns. */
function Columns({ section }: { section: { title: string; lead: copy.Rich; columns: copy.Column[] } }) {
  return (
    <ListSlide title={section.title} lead={rich(section.lead)}>
      {section.columns.map((col) => (
        <Column key={col.label} label={col.label} title={col.title}>
          {col.body}
        </Column>
      ))}
    </ListSlide>
  );
}

function Cover({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <div className="flex h-full max-w-[640px] flex-col justify-center gap-10">
        <div className="flex items-center gap-6">
          <RelayMark className="size-[72px]" />
          <SlideTitle size={1}>Relay</SlideTitle>
        </div>
        <Lead>{rich(copy.cover.lead)}</Lead>
        <p className="t-deck-caption text-(--text-2)">{copy.cover.meta}</p>
      </div>
      {/* The argument as a picture: one live hero over a queue reduced to its structure
          (§8.3). It bleeds off the right edge on purpose — the slide is 40% type, 60% product. */}
      <div className="absolute top-2 -right-24">
        <DeviceFrame width={864} height={648} designWidth={WORK_DESIGN_WIDTH}>
          <MiniWork abstract />
        </DeviceFrame>
      </div>
    </SlideFrame>
  );
}

/** Slide 2 is the divider, and it is also the answer to "if you only see one slide": the
 * whole one hour answer in a sentence, on a full-bleed band (§8.4, `mk02`). */
function DividerA({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} band>
      <div className="flex h-full flex-col justify-center gap-10">
        <SlideTitle size={1}>{copy.dividerA.title}</SlideTitle>
        <Lead className="max-w-[44ch]">{rich(copy.dividerA.lead)}</Lead>
        <Label>{copy.dividerA.label}</Label>
      </div>
    </SlideFrame>
  );
}

function Brief({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <Split
        left={
          <div className="flex h-full flex-col justify-center gap-8">
            <SlideTitle>{copy.brief.title}</SlideTitle>
            <Lead>{rich(copy.brief.lead)}</Lead>
            {/* The old dashboard's four cards, and where each one ended up. It is the
                first question anyone asks of a redesign — what did you drop? — and the
                answer is nothing. Three of them stopped being cards and became one
                list that ranks. */}
            <div className="flex flex-col gap-3">
              <Label>{copy.brief.label}</Label>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                {copy.brief.cards.map(([from, to]) => (
                  <Fragment key={from}>
                    <dt className="t-deck-caption text-(--text-2)">{from}</dt>
                    <dd className="t-deck-caption text-(--text-1)">{to}</dd>
                  </Fragment>
                ))}
              </dl>
            </div>
          </div>
        }
        right={
          <div className="flex h-full flex-col justify-center [&>*+*]:border-t [&>*+*]:border-(--line-1)">
            {copy.brief.quotes.map(([quote, who]) => (
              <figure key={who} className="flex flex-col gap-4 py-10 first:pt-0 last:pb-0">
                <blockquote className="t-deck-h2 text-(--text-1)">&ldquo;{quote}&rdquo;</blockquote>
                <figcaption>
                  <Label>{who}</Label>
                </figcaption>
              </figure>
            ))}
          </div>
        }
      />
    </SlideFrame>
  );
}

function Insight({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <Split
        leftSpan={5}
        left={
          <div className="flex h-full flex-col justify-center gap-6">
            <SlideTitle>{copy.insight.title}</SlideTitle>
            <Lead>{rich(copy.insight.lead)}</Lead>
          </div>
        }
        right={
          <div className="flex h-full flex-col justify-center">
            <Label className="mb-6">{copy.insight.label}</Label>
            {copy.insight.missing.map(([label, text], i) => (
              <RuleRow key={label} n={i + 1} className="grid-cols-[48px_240px_1fr] py-5">
                <p className="t-deck-lead font-semibold text-(--text-1)">{label}</p>
                <p className="t-deck-body text-(--text-2)">{text}</p>
              </RuleRow>
            ))}
          </div>
        }
      />
    </SlideFrame>
  );
}

function Failures({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <div className="flex h-full flex-col">
        <SlideTitle>{copy.failures.title}</SlideTitle>
        <div className="mt-14">
          <div className="grid grid-cols-[48px_1fr_1fr] gap-x-8 pb-4">
            <span />
            <Label>{copy.failures.heads[0]}</Label>
            <Label>{copy.failures.heads[1]}</Label>
          </div>
          {copy.failures.rows.map(([failure, fix], i) => (
            <RuleRow key={failure} n={i + 1} className="py-7">
              <p className="t-deck-body text-(--text-2)">{failure}</p>
              <p className="t-deck-body text-(--text-1)">{fix}</p>
            </RuleRow>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}

function Assumptions({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <Columns section={copy.assumptions} />
    </SlideFrame>
  );
}

function Prioritized({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <Columns section={copy.prioritized} />
    </SlideFrame>
  );
}

/** The brief's actual deliverable: the wireframe. Not a drawing of one — the real
 * product with `data-fidelity="wire"`, so the wireframe and the shipped screens are
 * the same artefact (§8, rule 1). */
function Wireframe({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <div className="flex h-full flex-col">
        <div className="grid grid-cols-12 items-end gap-x-6">
          <SlideTitle className="col-span-5">{copy.wireframe.title}</SlideTitle>
          <Lead className="col-span-7">{rich(copy.wireframe.lead)}</Lead>
        </div>
        <div className="relative mt-8 grid grid-cols-2 gap-x-6">
          <DeviceFrame width={692} height={540} designWidth={WORK_DESIGN_WIDTH} wire>
            <MiniWork />
          </DeviceFrame>
          <DeviceFrame width={692} height={540} designWidth={TEAM_DESIGN_WIDTH} wire>
            <MiniTeam />
          </DeviceFrame>
          <Annotation n={1} className="top-[81px] left-[3px]" />
          <Annotation n={2} className="top-[338px] left-[3px]" />
          <Annotation n={3} className="top-[199px] left-[710px]" />
        </div>
        <Legend items={copy.wireframe.legend} className="mt-auto" />
      </div>
    </SlideFrame>
  );
}

function PriorityRule({ n, total }: SlideProps) {
  const now = DECK_NOW;
  const queue = queueFor(seedItems, "u1", now);
  const nextRanked = queue.now[1] ?? queue.next[0] ?? null;
  if (!queue.hero) return null;
  const maxes = [FACTOR_MAX.T, FACTOR_MAX.B, FACTOR_MAX.I];
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <Split
        left={
          <div className="flex h-full flex-col">
            <SlideTitle>{copy.priorityRule.title}</SlideTitle>
            <Lead className="mt-6">{rich(copy.priorityRule.lead)}</Lead>
            <Stats className="mt-auto">
              {copy.priorityRule.stats.map((stat, i) => (
                <Stat key={stat.label} value={maxes[i]} label={stat.label} note={stat.note} />
              ))}
            </Stats>
            <Body className="mt-8">{copy.priorityRule.rule}</Body>
          </div>
        }
        right={
          <div className="flex h-full items-center">
            <DeviceFrame width={692} height={620} designWidth={520}>
              <div className="p-8">
                <WhyFactors ranked={queue.hero} nextRanked={nextRanked} now={now} />
              </div>
            </DeviceFrame>
          </div>
        }
      />
    </SlideFrame>
  );
}

function WhatWeCut({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <Columns section={copy.cuts} />
    </SlideFrame>
  );
}

export const partA = [
  Cover,
  DividerA,
  Brief,
  Insight,
  Failures,
  Assumptions,
  Prioritized,
  Wireframe,
  PriorityRule,
  WhatWeCut,
];
