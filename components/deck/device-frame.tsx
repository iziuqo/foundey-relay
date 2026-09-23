"use client";

import { MotionConfig } from "motion/react";
import { cn } from "@/lib/cn";

const TITLE_BAR = 28;

export interface DeviceFrameProps {
  /** Outer width of the frame on the slide, px. */
  width: number;
  /** Outer height of the frame on the slide, px, title bar included. */
  height: number;
  /** The width the real screen is laid out at before it is scaled into the frame. */
  designWidth: number;
  /** Nested override for the screen only — the slide around it keeps its own theme. */
  theme?: "light" | "dark";
  wire?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * §8.3's device frame: a 1px hairline, r12, e2, a 28px title bar carrying three 8px dots.
 * No OS chrome, no perspective, no rotation, no shadow beyond e2.
 *
 * The screen inside is the real component tree laid out at `designWidth` and scaled by a
 * plain transform. That is the only way a live embed can be deterministic: the components'
 * own media queries key off the *viewport*, so laid out at the frame's width they would
 * pick a different layout in the export (1600 wide) than on a presenter's laptop.
 * `MotionConfig reducedMotion="always"` settles every entrance to its resting state, so a
 * slide is a picture of the app at rest — never a hero mid-glow.
 *
 * A picture is inert: no landmarks for axe to find sixteen times on /deck/print, and no
 * mock button in the tab order.
 */
export function DeviceFrame({ width, height, designWidth, theme = "light", wire, className, children }: DeviceFrameProps) {
  const inner = width - 2;
  const scale = inner / designWidth;
  return (
    <div
      className={cn(
        "overflow-hidden rounded-(--r-4) border border-(--line-1) bg-(--surface-1) shadow-(--e2)",
        className,
      )}
      // eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (the frame's own size), not color
      style={{ width, height }}
    >
      <div
        aria-hidden
        className="flex items-center gap-1.5 border-b border-(--line-1) bg-(--surface-2) px-3"
        // eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (title bar height), not color
        style={{ height: TITLE_BAR }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-2 rounded-full bg-(--line-2)" />
        ))}
      </div>
      <div
        inert
        aria-hidden="true"
        data-theme={theme}
        data-fidelity={wire ? "wire" : "hi"}
        className="pointer-events-none relative overflow-hidden bg-(--bg) text-(--text-1)"
        // eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (the visible part of the scaled screen), not color
        style={{ width: inner, height: height - TITLE_BAR - 2 }}
      >
        <div
          className="origin-top-left"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (fit-to-frame scale), not color
          style={{ width: designWidth, transform: `scale(${scale})` }}
        >
          <MotionConfig reducedMotion="always">{children}</MotionConfig>
        </div>
      </div>
    </div>
  );
}

/** A 24px near-black dot with a tabular numeral (§8.3). Never coloured. Placed by the
 * caller inside a `relative` box; the caption lives in the slide's legend, not on the
 * artefact, so it can never cover the thing it is pointing at. */
export function Annotation({ n, className, style }: { n: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      data-annotation=""
      className={cn(
        "t-deck-caption absolute z-10 grid size-6 place-items-center rounded-full bg-(--text-1) font-semibold text-(--bg) ring-2 ring-(--bg)",
        className,
      )}
      // eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (where the dot sits on the artefact), not color
      style={style}
    >
      {n}
    </span>
  );
}
