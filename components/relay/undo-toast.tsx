import { copy } from "@/lib/copy";

const SIZE = 18;
const STROKE = 2;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The Undo action inside the toast shell: the label, a ring counting down the toast's
 * own auto-dismiss window, and the `⌘Z` hint (ClickUp's pattern, §3.4). The ring means
 * the control is always honest about how long undo has left, whatever `durationMs` the
 * action that raised it used.
 *
 * **44px tall, not 32.** The single measured defect the catalog cites against v2's toast
 * is a sub-44px Undo target; a control that only appears for eight seconds is the last
 * one that should be hard to hit. The shell is 56px, so a 44px button leaves the 6px of
 * breathing room on each side that the geometry allows and no more.
 *
 * Sonner pauses its dismiss timer on hover; the `[data-sonner-toast]:hover` rule in
 * globals.css pauses this ring's CSS animation the same way, so the two never drift.
 */
export function UndoToast({
  durationMs,
  onUndo,
}: {
  durationMs: number;
  onUndo: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onUndo}
      className="flex h-11 shrink-0 items-center gap-1.5 rounded-(--r-3) bg-(--primary-bg) pr-2.5 pl-3.5 t-meta font-medium text-(--primary-fg) focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus)"
      // The ring's own countdown duration and geometry, not a color/shadow/background
      // token — read by .undo-ring-circle in globals.css.
      // eslint-disable-next-line react/forbid-dom-props
      style={
        {
          "--toast-duration": `${durationMs}ms`,
          "--circumference": CIRCUMFERENCE,
        } as React.CSSProperties
      }
    >
      {copy.actions.undo}
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden
        className="-rotate-90"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-(--primary-fg) opacity-25"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          className="undo-ring-circle stroke-(--primary-fg)"
        />
      </svg>
      <kbd
        data-kbd
        className="ml-0.5 text-(length:--t-mono-size) leading-(length:--t-mono-line) text-(--primary-fg) opacity-80"
      >
        ⌘Z
      </kbd>
    </button>
  );
}
