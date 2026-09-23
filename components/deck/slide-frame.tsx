import { cn } from "@/lib/cn";

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;

/** Every slide in part-a.tsx / part-b.tsx is a component of this shape — the deck
 * shell (and /deck/print) supply its position in the running order. */
export interface SlideProps {
  n: number;
  total: number;
}

export interface SlideFrameProps {
  children: React.ReactNode;
  slideNumber?: number;
  totalSlides?: number;
  eyebrow?: string;
  optional?: boolean;
  noFooter?: boolean;
  className?: string;
}

/**
 * The fixed 1280×720 canvas every slide renders into (§6.8). Forces `data-theme="light"`
 * regardless of whatever theme the visitor's browser last left in localStorage — a
 * deck is presented to other people, and its printed export (`/deck/print`) has to be
 * deterministic, not a function of whoever last touched `/work` on this machine.
 */
export function SlideFrame({
  children,
  slideNumber,
  totalSlides,
  eyebrow,
  optional,
  noFooter,
  className,
}: SlideFrameProps) {
  return (
    <div
      data-theme="light"
      data-testid="slide"
      className={cn(
        "relative shrink-0 overflow-hidden bg-(--bg) font-sans text-(--text-1)",
        className,
      )}
      // eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (the fixed slide canvas size), not color
      style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }}
    >
      {eyebrow && (
        <div className="absolute top-10 left-16 flex items-center gap-2">
          <p className="text-(length:--text-meta) leading-(--leading-meta) font-semibold tracking-wide text-(--text-2) uppercase">
            {eyebrow}
          </p>
          {optional && (
            <span className="rounded-(--radius-chip) border border-(--border-1) bg-(--surface-2) px-2 py-0.5 text-(length:--text-kbd) leading-(length:--leading-kbd) font-medium text-(--text-2) uppercase">
              Optional
            </span>
          )}
        </div>
      )}
      <div
        className="absolute right-16 left-16"
        // eslint-disable-next-line react/forbid-dom-props -- dynamic geometry (content area offset depends on eyebrow/footer), not color
        style={{ top: eyebrow ? 76 : 48, bottom: noFooter ? 48 : 88 }}
      >
        {children}
      </div>
      {!noFooter && slideNumber !== undefined && (
        <div className="absolute right-16 bottom-8 left-16 flex items-center justify-between text-(length:--text-meta) text-(--text-2)">
          <span>Relay · Foundey challenge</span>
          <span className="tnum">
            {slideNumber}
            {totalSlides ? ` / ${totalSlides}` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
