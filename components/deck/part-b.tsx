"use client";

import { SlideFrame, type SlideProps } from "./slide-frame";
import { SlideTitle, Lead, Body, Label, Split, Column, ThreeUpSlide, ListSlide, Stat, RuleRow, Legend, rich } from "./deck-kit";
import { DeviceFrame, Annotation } from "./device-frame";
import { MiniWork } from "./mini-work";
import { MiniTeam, TEAM_DESIGN_WIDTH } from "./mini-team";
import * as copy from "./deck-copy";

const EYEBROW = "Part B · Beyond the hour · Optional";

/** Slide 11 is slide 2's mirror, inverted (§8.4): the deck's only theme flip, so the
 * boundary is unmissable in a PDF thumbnail grid. Built as `data-theme="dark"`, not
 * hand-swapped colors, so its contrast comes out of the same tokens as every other slide. */
function DividerB({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} theme="dark" band>
      <div className="flex h-full flex-col justify-center gap-10">
        <SlideTitle size={1}>{copy.dividerB.title}</SlideTitle>
        <Lead className="max-w-[44ch]">{rich(copy.dividerB.lead)}</Lead>
        <Label>{copy.dividerB.label}</Label>
      </div>
    </SlideFrame>
  );
}

/** Dark on a light slide, so the one flourish that only exists in dark — the hero's
 * glow — is actually seen by the reviewers who open the light default (advisor §11).
 * Laid out at 1600 wide, not 1408: at 1:1 the frame clipped after the first Act now row,
 * and the second legend describes rows nobody could see. */
function HiFiProduct({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <div className="flex h-full flex-col">
        <div className="grid grid-cols-12 items-end gap-x-6">
          <SlideTitle className="col-span-5">{copy.hifi.title}</SlideTitle>
          <Lead className="col-span-7">{rich(copy.hifi.lead)}</Lead>
        </div>
        <div className="relative mt-8">
          <DeviceFrame width={1408} height={540} designWidth={1600} theme="dark">
            <MiniWork />
          </DeviceFrame>
          <Annotation n={1} className="top-[101px] left-[21px]" />
          <Annotation n={2} className="top-[422px] left-[4px]" />
          <Annotation n={3} className="top-[46px] left-[1058px]" />
        </div>
        <Legend items={copy.hifi.legend} className="mt-auto" />
      </div>
    </SlideFrame>
  );
}

function Motion({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <Split
        left={
          <div className="flex h-full flex-col">
            <SlideTitle>{copy.motion.title}</SlideTitle>
            <Lead className="mt-6">{rich(copy.motion.lead)}</Lead>
            <Body className="mt-auto">{rich(copy.motion.body)}</Body>
          </div>
        }
        right={
          <div className="flex h-full flex-col justify-center gap-12">
            <Stat value={copy.motion.stat.value} label={copy.motion.stat.label} />
            <div>
              {copy.motion.beats.map((beat, i) => (
                <RuleRow key={beat} n={i + 1} className="grid-cols-[48px_1fr] py-5">
                  <p className="t-deck-lead text-(--text-1)">{beat}</p>
                </RuleRow>
              ))}
            </div>
          </div>
        }
      />
    </SlideFrame>
  );
}

function ManagerEthics({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <Split
        leftSpan={5}
        left={
          <div className="flex h-full flex-col">
            <SlideTitle>{copy.manager.title}</SlideTitle>
            <Lead className="mt-6">{rich(copy.manager.lead)}</Lead>
            <Legend items={copy.manager.legend} stacked className="mt-auto" />
          </div>
        }
        right={
          <div className="relative">
            <DeviceFrame width={806} height={708} designWidth={TEAM_DESIGN_WIDTH - 200}>
              <MiniTeam />
            </DeviceFrame>
            <Annotation n={1} className="top-[300px] left-[24px]" />
            <Annotation n={2} className="top-[553px] left-[754px]" />
            <Annotation n={3} className="top-[553px] left-[14px]" />
          </div>
        }
      />
    </SlideFrame>
  );
}

function Accessibility({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <ThreeUpSlide title={copy.accessibility.title} lead={rich(copy.accessibility.lead)}>
        {copy.accessibility.columns.map((col, i) => (
          <Column key={col.label} mark={copy.accessibility.marks[i]} label={col.label} title={col.title}>
            {col.body}
          </Column>
        ))}
      </ThreeUpSlide>
    </SlideFrame>
  );
}

function NextSteps({ n, total }: SlideProps) {
  return (
    <SlideFrame n={n} total={total} eyebrow={EYEBROW}>
      <ListSlide title={copy.next.title} lead={rich(copy.next.lead)}>
        {copy.next.columns.map((col) => (
          <Column key={col.label} label={col.label} title={col.title}>
            {col.body}
          </Column>
        ))}
      </ListSlide>
    </SlideFrame>
  );
}

export const partB = [DividerB, HiFiProduct, Motion, ManagerEthics, Accessibility, NextSteps];
