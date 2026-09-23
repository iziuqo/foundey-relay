import type { ComponentType } from "react";
import type { SlideProps } from "./slide-frame";
import { partA } from "./part-a";
import { partB } from "./part-b";

export interface DeckSlide {
  Component: ComponentType<SlideProps>;
  label: string;
  part: "A" | "B";
}

const labelsA = [
  "Cover",
  "The one hour answer",
  "The brief",
  "The insight",
  "Five failures, five fixes",
  "Assumptions",
  "What we prioritized",
  "The wireframe",
  "The priority rule",
  "What we cut",
];

const labelsB = [
  "Beyond the hour",
  "The hi-fi product",
  "Motion",
  "Manager view & ethics",
  "Accessibility",
  "Next steps",
];

/** §8: Part A (the one hour answer, slides 1–10) then Part B (beyond the hour, 11–16, every
 * slide marked optional). Slides 2 and 11 are the dividers. One running order, used by
 * both the interactive deck shell and `/deck/print`. */
export const deckSlides: DeckSlide[] = [
  ...partA.map((Component, i) => ({ Component, label: labelsA[i], part: "A" as const })),
  ...partB.map((Component, i) => ({ Component, label: labelsB[i], part: "B" as const })),
];
