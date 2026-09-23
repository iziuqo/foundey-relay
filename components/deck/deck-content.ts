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
  "If you only see one slide",
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
  "The hi-fi product",
  "Motion",
  "Manager view & ethics",
  "Accessibility",
  "Handoff concept",
  "Next steps",
];

/** §6.8: Part A (the one hour answer, ≤10) then Part B (beyond the hour, ≤10, every
 * slide marked optional) — one running order, used by both the interactive deck
 * shell and `/deck/print`. */
export const deckSlides: DeckSlide[] = [
  ...partA.map((Component, i) => ({ Component, label: labelsA[i], part: "A" as const })),
  ...partB.map((Component, i) => ({ Component, label: labelsB[i], part: "B" as const })),
];
