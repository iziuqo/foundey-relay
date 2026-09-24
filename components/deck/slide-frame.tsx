import { cn } from "@/lib/cn";

export const SLIDE_WIDTH = 1600;
export const SLIDE_HEIGHT = 900;
/** Where the two halves of the deck meet: slides 1–10 are the one hour answer. */
export const PART_A_LAST = 10;

/** Every slide in part-a.tsx / part-b.tsx is a component of this shape — the deck
 * shell (and /deck/print) supply its position in the running order. */
export interface SlideProps {
  n: number;
  total: number;
}

export interface SlideFrameProps {
  children: React.ReactNode;
  n: number;
  total: number;
  /** Names the half this slide belongs to; every slide carries one (§8 rule 5). */
  eyebrow?: string;
  /** `dark` is the one theme flip in the deck: the inverted divider (§8.4). */
  theme?: "light" | "dark";
  /** Tinted full-bleed band, for the two dividers (mk02). */
  band?: boolean;
  className?: string;
}

/**
 * The 4px progress rail (§8.4): sixteen cells, one per slide. Part A's cells fill in
 * `--text-1` as the reader passes them; Part B's fill in `--line-2` — so on any slide the
 * reader can tell which half they are in from the rail alone, and in a PDF thumbnail grid
 * the change of tone lands exactly at the boundary.
 */
function ProgressRail({ n, total }: { n: number; total: number }) {
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 flex h-1 gap-0.5">
      {Array.from({ length: total }, (_, i) => {
        const cell = i + 1;
        const reached = cell <= n;
        const partA = cell <= PART_A_LAST;
        return (
          <span
            key={cell}
            className={cn("h-full flex-1", reached ? (partA ? "bg-(--text-1)" : "bg-(--line-2)") : "bg-(--line-1)")}
          />
        );
      })}
    </div>
  );
}

/**
 * The fixed 1600×900 canvas every slide renders into (§8): a 96px safe area (1408×708),
 * the eyebrow in the top margin, the folio in the bottom one. Pins `data-theme` and
 * `data-fidelity` together — a deck is presented to other people and exported to a PDF,
 * so it may not be a function of whichever mode the last visitor left in localStorage,
 * and the token block only re-declares for an element carrying *both* attributes
 * (LOG M9). The dividers get `--surface-2` (light) or the dark set, never a hand-picked
 * colour, so contrast comes out of the same tokens as everything else.
 */
export function SlideFrame({ children, n, total, eyebrow, theme = "light", band, className }: SlideFrameProps) {
  return (
    <div
      data-theme={theme}
      data-fidelity="hi"
      data-testid="slide"
      className={cn(
        "relative shrink-0 overflow-hidden font-sans text-(--text-1)",
        band && theme === "light" ? "bg-(--surface-2)" : "bg-(--bg)",
        className,
      )}
      // eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (the fixed slide canvas size), not color
      style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }}
    >
      <ProgressRail n={n} total={total} />
      {eyebrow && <p data-slide-eyebrow="" className="t-deck-eyebrow absolute top-12 left-24 text-(--text-2)">{eyebrow}</p>}
      <div className="absolute inset-x-24 top-24 bottom-24">{children}</div>
      <div className="t-deck-caption absolute inset-x-24 bottom-9 flex items-center justify-between text-(--text-2)">
        <span>Relay · Foundey challenge</span>
        <span>
          {n} / {total}
        </span>
      </div>
    </div>
  );
}
