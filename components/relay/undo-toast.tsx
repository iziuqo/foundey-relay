import { copy } from "@/lib/copy";

const SIZE = 20;
const STROKE = 2;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * M1's undo toast: the message, a `⌘Z` hint (ClickUp's pattern, §3.4), and a ring that
 * counts down the toast's own auto-dismiss window — so it's always honest about how
 * long "undo" has left, whatever `durationMs` a given action used. Sonner pauses its
 * dismiss timer on hover; the `[data-sonner-toast]:hover` rule in globals.css pauses
 * this ring's CSS animation the same way, so the two never drift apart.
 */
export function UndoToast({ message, durationMs, onUndo }: { message: string; durationMs: number; onUndo: () => void }) {
  return (
    <div className="flex w-full items-center gap-3">
      <p className="min-w-0 flex-1 text-(length:--text-body) text-(--text-1)">{message}</p>
      <button
        type="button"
        onClick={onUndo}
        className="flex shrink-0 items-center gap-1.5 rounded-(--radius-control) bg-(--accent-solid) py-1.5 pr-2 pl-3 text-(length:--text-meta) font-medium text-(--accent-solid-fg)"
        // The ring's own countdown duration and geometry, not a color/shadow/background
        // token (plan §9.2 P1 9-11 is about those) — read by .undo-ring-circle in globals.css.
        // eslint-disable-next-line react/forbid-dom-props
        style={
          {
            "--toast-duration": `${durationMs}ms`,
            "--circumference": CIRCUMFERENCE,
          } as React.CSSProperties
        }
      >
        {copy.actions.undo}
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-(--accent-solid-fg) opacity-25"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            className="undo-ring-circle stroke-(--accent-solid-fg)"
          />
        </svg>
        <kbd
          data-kbd
          className="ml-0.5 text-(length:--text-kbd) leading-(length:--leading-kbd) text-(--accent-solid-fg) opacity-80"
        >
          ⌘Z
        </kbd>
      </button>
    </div>
  );
}
