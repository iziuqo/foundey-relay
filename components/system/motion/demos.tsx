"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, usePresence } from "motion/react";
import NumberFlow from "@number-flow/react";
import { duration, spring, stagger, stepDelay, transition } from "@/lib/motion";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { CheckDraw } from "@/components/relay/check-draw";
import { NewUrgentBand } from "@/components/relay/new-urgent-band";
import { TierIcon } from "@/components/relay/tier-icon";
import { UpdateTabs } from "@/components/relay/update-tabs";
import { switchTheme } from "@/lib/theme-transition";
import { useStore } from "@/state/store";
import type { UpdateTab } from "@/lib/selectors";

/**
 * The eighteen demos behind /system/motion. Each is a small stage built from the same
 * tokens (`lib/motion.ts`) and, wherever a shipped component can live inside a box, the
 * shipped component itself. The stage that hosts them decides whether they run full or
 * reduced: Motion's own animation is switched by the `MotionConfig` around the stage,
 * plain CSS by `data-motion="reduced"` (app/globals.css), and the handful of moments
 * whose reduced variant is a *different* animation rather than no animation read the
 * `reduced` prop.
 *
 * Nothing here plays at rest. `run` is 0 until somebody presses Play, and every demo
 * renders its resting state for 0.
 */
export interface DemoProps {
  reduced: boolean;
  /** 0 at rest, then one more for every press of Play. */
  run: number;
  /** Which of the moment's Play buttons was pressed last. */
  variant: number;
}

/** True for `ms` after each press of Play, false at rest and afterwards. */
function useHold(run: number, ms: number): boolean {
  // Press → on is derived while rendering (React's own pattern for "state that follows a
  // prop"); only the timer that turns it off touches state from an effect, and it does so
  // from a callback, not synchronously.
  const [seen, setSeen] = useState(run);
  const [on, setOn] = useState(false);
  if (seen !== run) {
    setSeen(run);
    setOn(run > 0);
  }
  useEffect(() => {
    if (!on) return;
    const id = window.setTimeout(() => setOn(false), ms);
    return () => window.clearTimeout(id);
  }, [on, seen, ms]);
  return on;
}

const CARD = "flex h-16 w-72 max-w-full items-center gap-3 rounded-(--r-3) px-3 t-body text-(--text-1)";

/* ─── M1 ─────────────────────────────────────────────────────────────────────────── */
export function RowHover({ run }: DemoProps) {
  const on = useHold(run, 1500);
  return (
    <div
      className={cn(
        CARD,
        "transition-colors duration-(--dur-instant) ease-(--ease-out)",
        on ? "bg-(--surface-3)" : "bg-(--surface-1)",
      )}
    >
      <TierIcon tier="next" className="text-(--next-fg)" />
      <span className="min-w-0 flex-1 t-row">Order #4821</span>
      {/* The cluster's track is always reserved, so this fades and slides inside a box
          that was already there. */}
      <motion.span
        initial={false}
        animate={{ opacity: on ? 1 : 0, x: on ? 0 : 6 }}
        transition={transition.quick}
        className="flex gap-1.5"
      >
        <Kbd>↵</Kbd>
      </motion.span>
    </div>
  );
}

/* ─── M2 ─────────────────────────────────────────────────────────────────────────── */
export function RowFocus({ run }: DemoProps) {
  const on = useHold(run, 1800);
  return (
    <div
      className={cn(
        CARD,
        // No transition class on purpose. The ring is there on the frame the key lands.
        on
          ? "bg-(--surface-3) shadow-[0_0_0_2px_var(--surface-2),0_0_0_4px_var(--focus)]"
          : "bg-(--surface-1)",
      )}
    >
      <TierIcon tier="next" className="text-(--next-fg)" />
      <span className="min-w-0 flex-1 t-row">Order #4821</span>
      <span className="t-mono text-(--text-2)">0 ms</span>
    </div>
  );
}

/* ─── M3 ─────────────────────────────────────────────────────────────────────────── */
export function Press({ reduced, run }: DemoProps) {
  const on = useHold(run, 700);
  return (
    <div className="flex flex-col items-center gap-3">
      {/* The real Button, with its own press state forced. Under reduced motion the
          catalog's variant is "none", so the force is simply not applied. */}
      <Button size="lg" forceState={on && !reduced ? "active" : undefined}>
        Mark done
      </Button>
      <p className="t-mono text-(--text-2)">{reduced ? "no scale" : "scale 0.985 · 80 down · 120 up"}</p>
    </div>
  );
}

/* ─── M4 ─────────────────────────────────────────────────────────────────────────── */
const QUEUE = [
  "Order #4821 payment",
  "Label printer offline",
  "Escalation thread",
  "Rush order #4796",
  "Cycle count, bin C4",
];

export function MarkDone({ reduced, run }: DemoProps) {
  const [n, setN] = useState(0);
  const [toast, setToast] = useState(false);
  const ran = useRef(0);

  useEffect(() => {
    if (run === 0 || run === ran.current) return;
    ran.current = run;
    setN((v) => v + 1);
    setToast(true);
    const id = window.setTimeout(() => setToast(false), 2400);
    return () => window.clearTimeout(id);
  }, [run]);

  const items = QUEUE.map((_, i) => QUEUE[(n + i) % QUEUE.length]);
  const [hero, ...rest] = items;

  return (
    <>
      <div className="flex w-72 max-w-full flex-col gap-2">
        <div className="relative h-16">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={hero}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: transition.exit }}
              transition={transition.quick}
              className="flex h-16 items-center gap-3 rounded-(--r-4) border border-(--act-line) bg-(--act-bg) px-3 shadow-(--e2)"
            >
              <TierIcon tier="now" className="text-(--act-fg)" />
              <motion.span layoutId={`m4-${hero}`} transition={spring.layout} className="t-row text-(--text-1)">
                {hero}
              </motion.span>
              <CheckWhenLeaving />
            </motion.div>
          </AnimatePresence>
        </div>
        <ul className="flex flex-col">
          {rest.slice(0, 3).map((title, i) => (
            <motion.li
              key={title}
              layout
              transition={{ ...spring.layout, delay: reduced ? 0 : stepDelay(i, stagger.rows) }}
              className="flex h-7 items-center gap-2 px-3 t-meta text-(--text-2) shadow-[inset_0_-1px_0_var(--line-1)]"
            >
              <TierIcon tier="next" className="icon-sm text-(--next-fg)" />
              <motion.span layoutId={`m4-${title}`} transition={spring.layout}>
                {title}
              </motion.span>
            </motion.li>
          ))}
        </ul>
        <div className="flex items-center justify-between t-meta text-(--text-2)">
          <span className="tnum flex gap-1">
            <NumberFlow value={n + 2} animated={!reduced} /> of 12 done
          </span>
          <AnimatePresence>
            {toast && (
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: transition.toastExit }}
                transition={reduced ? transition.quick : transition.toast}
                className="rounded-(--r-2) bg-(--surface-3) px-2 py-1 text-(--text-1) shadow-(--e3)"
              >
                Done · Undo
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

/** ① The check draws on the card that is leaving — the same trick hero.tsx plays with
 * `usePresence`, so it lands on the outgoing hero and never on its replacement. */
function CheckWhenLeaving() {
  const [isPresent] = usePresence();
  return isPresent ? null : <CheckDraw />;
}

/* ─── M5 ─────────────────────────────────────────────────────────────────────────── */
export function Undo({ run }: DemoProps) {
  const [home, setHome] = useState<"toast" | "list">("toast");
  const [glue, setGlue] = useState(true);
  const ran = useRef(0);

  useEffect(() => {
    if (run === 0 || run === ran.current) return;
    ran.current = run;
    setGlue(true);
    setHome("list");
    // Put the item back in the toast without a flight — the way back is not the demo.
    const a = window.setTimeout(() => {
      setGlue(false);
      setHome("toast");
    }, 1900);
    const b = window.setTimeout(() => setGlue(true), 1960);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [run]);

  const chip = (
    <motion.span
      layoutId={glue ? "m5-item" : undefined}
      transition={spring.layout}
      className="inline-flex h-8 items-center gap-2 rounded-(--r-2) bg-(--surface-1) px-2.5 t-meta text-(--text-1) shadow-(--e1)"
    >
      <TierIcon tier="now" className="icon-sm text-(--act-fg)" />
      Order #4821
    </motion.span>
  );

  return (
    <>
      <div className="flex w-72 max-w-full flex-col gap-3">
        <div className="flex h-12 items-center rounded-(--r-3) border border-dashed border-(--line-2) px-3 t-meta text-(--text-2)">
          {home === "list" ? chip : "Rank 1"}
        </div>
        <div className="flex h-12 items-center gap-2 rounded-(--r-3) bg-(--surface-3) px-3 shadow-(--e3)">
          {home === "toast" ? chip : <span className="t-meta text-(--text-2)">Undone</span>}
        </div>
      </div>
    </>
  );
}

/* ─── M6 ─────────────────────────────────────────────────────────────────────────── */
export function UndoToast({ reduced, run }: DemoProps) {
  const on = useHold(run, 2400);
  return (
    <div className="flex h-full flex-col items-start justify-end gap-2 self-stretch p-4">
      <AnimatePresence>
        {on && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: transition.toastExit }}
            transition={reduced ? transition.quick : transition.toast}
            className="max-w-full"
          >
            <Toast
              className="max-w-full"
              message="Marked done"
              detail="Order #4821 — payment mismatch"
              action={
                <Button size="sm" variant="secondary">
                  Undo
                </Button>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
      <p className="t-mono text-(--text-2)">
        {reduced ? "fade · holds 12 s (2.4 s here)" : "220 in · holds 8 s (2.4 s here) · 160 out"}
      </p>
    </div>
  );
}

/* ─── M7 ─────────────────────────────────────────────────────────────────────────── */
const R = 32;
const C = 2 * Math.PI * R;

export function Countdown({ reduced, run }: DemoProps) {
  const [min, setMin] = useState(17);
  const ran = useRef(0);

  useEffect(() => {
    if (run === 0 || run === ran.current) return;
    ran.current = run;
    setMin(17);
    let m = 17;
    const id = window.setInterval(() => {
      m -= 1;
      setMin(m);
      if (m <= 13) window.clearInterval(id);
    }, 950);
    return () => window.clearInterval(id);
  }, [run]);

  const urgent = min <= 15;
  return (
    <div className="flex items-center gap-4">
      <div role="img" aria-label={`${min} min`} className="relative size-20">
        <svg viewBox="0 0 80 80" aria-hidden className="size-20 -rotate-90">
          <circle cx="40" cy="40" r={R} fill="none" strokeWidth="5" className="stroke-(--line-1)" />
          <motion.circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={false}
            animate={{ strokeDashoffset: C * (1 - min / 30) }}
            transition={reduced ? { duration: 0 } : transition.roll}
            className={cn(
              "transition-[stroke] duration-(--dur-hue) ease-(--ease-out)",
              urgent ? "stroke-(--act-fg)" : "stroke-(--text-1)",
            )}
          />
        </svg>
        <span
          aria-hidden
          className={cn(
            "tnum t-section absolute inset-0 flex items-center justify-center transition-colors duration-(--dur-hue) ease-(--ease-out)",
            urgent ? "text-(--act-fg)" : "text-(--text-1)",
          )}
        >
          <NumberFlow value={min} animated={!reduced} />
        </span>
      </div>
      <p className="t-meta text-(--text-2)">
        {urgent ? "15 min or less: the hue shifts, once" : "One step a minute"}
      </p>
    </div>
  );
}

/* ─── M8 ─────────────────────────────────────────────────────────────────────────── */
const SORT_A = ["Order #4821", "Escalation thread", "Rush #4796", "Count C4"];
const SORT_B = ["Rush #4796", "Order #4821", "Escalation thread", "Count C4"];

export function Resort({ reduced, run }: DemoProps) {
  const order = run % 2 === 1 ? SORT_B : SORT_A;
  return (
    <ul className="flex w-72 max-w-full flex-col">
      {order.map((title, i) => {
        const moved = run > 0 && title === "Rush #4796";
        return (
          <motion.li
            key={title}
            layout
            transition={{ ...spring.layout, delay: reduced ? 0 : stepDelay(i, stagger.rows) }}
            className="relative h-9 shadow-[inset_0_-1px_0_var(--line-1)]"
          >
            {/* The wash is a sibling, keyed to the press, so it restarts on every move and
                never runs on a row that did not. */}
            {moved && <span key={run} aria-hidden className="tint-wash absolute inset-0" />}
            <span className="relative flex h-full items-center gap-2 px-3 t-meta text-(--text-1)">
              <TierIcon tier="next" className="icon-sm text-(--next-fg)" />
              {title}
            </span>
          </motion.li>
        );
      })}
    </ul>
  );
}

/* ─── M9 ─────────────────────────────────────────────────────────────────────────── */
export function NewUrgent({ run }: DemoProps) {
  return (
    <div className="flex w-72 max-w-full flex-col rounded-(--r-4) border border-(--act-line) bg-(--act-bg) p-3 shadow-(--e2)">
      {run > 0 && <NewUrgentBand key={run} title="Lithium battery labels" onShowMe={() => {}} />}
      <p className="t-row text-(--text-1)">Order #4821 — payment mismatch</p>
      <p className="t-meta text-(--text-2)">24 orders held at pack</p>
    </div>
  );
}

/* ─── M10 ────────────────────────────────────────────────────────────────────────── */
const FACTORS: [string, number][] = [
  ["Time", 75],
  ["Blocked", 73],
  ["Impact", 12],
  ["Total", 62],
];

export function WhyPanel({ reduced, run }: DemoProps) {
  return (
    <motion.div
      key={run}
      initial={run === 0 ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? transition.quick : transition.fill}
      className="flex w-64 max-w-full origin-top-left flex-col gap-3 rounded-(--r-4) border border-(--line-1) bg-(--surface-1) p-4 shadow-(--e3)"
    >
      {FACTORS.map(([label, pct], i) => (
        <div key={label} className="flex flex-col gap-1">
          <span className="t-eyebrow text-(--text-2)">{label}</span>
          <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-(--line-2)">
            <motion.div
              initial={run === 0 || reduced ? { width: `${pct}%` } : { width: "0%" }}
              animate={{ width: `${pct}%` }}
              transition={{ ...transition.bars, delay: reduced ? 0 : stepDelay(i, stagger.bars) }}
              className="h-full rounded-full bg-(--primary-bg)"
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

/* ─── M11 ────────────────────────────────────────────────────────────────────────── */
export function RightSheet({ reduced, run }: DemoProps) {
  const on = useHold(run, 2600);
  return (
    <div className="relative h-full w-full overflow-hidden">
      <ul className="flex flex-col p-4">
        {["Order #4821", "Escalation thread", "Rush #4796"].map((t, i) => (
          <li
            key={t}
            className={cn(
              "flex h-9 items-center gap-2 px-3 t-meta shadow-[inset_0_-1px_0_var(--line-1)]",
              i === 0 && on ? "rounded-(--r-2) bg-(--surface-3) text-(--text-1)" : "text-(--text-2)",
            )}
          >
            {t}
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {on && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: transition.exit }}
              transition={transition.scrim}
              className="absolute inset-0 bg-(--overlay)"
            />
            <motion.div
              key="sheet"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, transition: transition.exit }}
              transition={reduced ? transition.quick : spring.sheet}
              className="absolute inset-y-3 right-3 flex w-3/5 flex-col gap-2 rounded-(--r-4) border border-(--line-1) bg-(--surface-3) p-3 shadow-(--e3)"
            >
              {["Why first", "Details", "History", "Reassign"].map((s, i) => (
                <motion.p
                  key={s}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ ...transition.base, delay: reduced ? 0 : stepDelay(i, stagger.sections) }}
                  className="t-meta text-(--text-1)"
                >
                  {s}
                </motion.p>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── M12 ────────────────────────────────────────────────────────────────────────── */
export function BottomSheet({ reduced, run }: DemoProps) {
  const [snap, setSnap] = useState<"closed" | "half" | "full">("closed");
  const ran = useRef(0);

  useEffect(() => {
    if (run === 0 || run === ran.current) return;
    ran.current = run;
    setSnap("half");
    const a = window.setTimeout(() => setSnap("full"), 1000);
    const b = window.setTimeout(() => setSnap("closed"), 2300);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [run]);

  const y = snap === "closed" ? "100%" : snap === "half" ? "45%" : "6%";
  return (
    <div className="relative h-44 w-24 overflow-hidden rounded-(--r-4) border border-(--line-2) bg-(--surface-2)">
      <div aria-hidden className="flex flex-col gap-1.5 p-2 pt-4">
        <span className="h-1.5 w-14 rounded-full bg-(--line-2)" />
        <span className="h-1.5 w-10 rounded-full bg-(--line-1)" />
        <span className="h-1.5 w-12 rounded-full bg-(--line-1)" />
      </div>
      <motion.div
        initial={false}
        animate={{ y: reduced ? "0%" : y, opacity: reduced ? (snap === "closed" ? 0 : 1) : 1 }}
        transition={reduced ? transition.quick : spring.sheet}
        className={cn(
          "absolute inset-x-0 top-0 h-full rounded-t-(--r-4) border-t border-(--line-1) bg-(--surface-3) shadow-(--e3)",
          reduced && snap === "half" && "top-[45%]",
          reduced && snap === "full" && "top-[6%]",
        )}
      >
        <div aria-hidden className="mx-auto mt-2 h-1 w-6 rounded-full bg-(--line-2)" />
      </motion.div>
    </div>
  );
}

/* ─── M13 ────────────────────────────────────────────────────────────────────────── */
const PALETTE_ROWS = ["Order #4821", "Escalation thread", "Rush #4796"];

export function Palette({ reduced, run }: DemoProps) {
  const on = useHold(run, 3000);
  const [sel, setSel] = useState(0);

  // Rests at 0, walks down, and returns to 0 once the palette has closed.
  useEffect(() => {
    if (!on) return;
    const a = window.setTimeout(() => setSel(1), 900);
    const b = window.setTimeout(() => setSel(2), 1700);
    const c = window.setTimeout(() => setSel(0), 3200);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
      window.clearTimeout(c);
    };
  }, [on]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div aria-hidden className="flex flex-col gap-2 p-4 t-meta text-(--text-2)">
        <p>Order #4821 — payment mismatch</p>
        <p>24 orders held at pack, 2 hours late</p>
        <p>UPS Ground · Door 14</p>
      </div>
      <AnimatePresence>
        {on && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: reduced ? "blur(0px)" : "blur(8px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: transition.exit }}
              transition={transition.scrim}
              className="absolute inset-0 bg-(--overlay)"
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, transition: transition.exit }}
              transition={transition.glide}
              className="absolute inset-x-6 top-6 flex flex-col rounded-(--r-5) border border-(--line-1) bg-(--surface-3) p-1.5 shadow-(--e3)"
            >
              {PALETTE_ROWS.map((label, i) => (
                <div key={label} className="relative flex h-8 items-center px-3 t-meta text-(--text-1)">
                  {sel === i && (
                    <motion.span
                      layoutId="m13-highlight"
                      transition={transition.highlight}
                      className="absolute inset-0 rounded-(--r-2) bg-(--surface-2)"
                    />
                  )}
                  <span className="relative">{label}</span>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── M14 ────────────────────────────────────────────────────────────────────────── */
export function ThemeReveal({ reduced, run }: DemoProps) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [reveal, setReveal] = useState(false);
  const [seen, setSeen] = useState(run);
  if (seen !== run) {
    setSeen(run);
    if (reduced) setMode(mode === "light" ? "dark" : "light");
    else setReveal(true);
  }

  const next = mode === "light" ? "dark" : "light";
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        data-theme={mode}
        className="relative h-24 w-72 max-w-full overflow-hidden rounded-(--r-4) border border-(--line-1) bg-(--bg) p-3"
      >
        <p className="t-row text-(--text-1)">Order #4821 — payment mismatch</p>
        <p className="t-meta text-(--text-2)">Reveal grows from the toggle</p>
        <span aria-hidden className="absolute top-3 right-3 size-5 rounded-full bg-(--text-1)" />
        {reveal && (
          <motion.div
            data-theme={next}
            initial={{ clipPath: "circle(0px at calc(100% - 22px) 22px)" }}
            animate={{ clipPath: "circle(340px at calc(100% - 22px) 22px)" }}
            transition={transition.move}
            onAnimationComplete={() => {
              setMode(next);
              setReveal(false);
            }}
            className="absolute inset-0 bg-(--bg) p-3"
          >
            <p className="t-row text-(--text-1)">Order #4821 — payment mismatch</p>
            <p className="t-meta text-(--text-2)">Reveal grows from the toggle</p>
            <span aria-hidden className="absolute top-3 right-3 size-5 rounded-full bg-(--text-1)" />
          </motion.div>
        )}
      </div>
      {!reduced && <FlipRealPage />}
    </div>
  );
}

/** The moment itself, on the page around it — the miniature above is a picture of this. */
function FlipRealPage() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={(e) =>
        switchTheme(() => setTheme(theme === "dark" ? "light" : "dark"), { x: e.clientX, y: e.clientY })
      }
    >
      Flip the real page
    </Button>
  );
}

/* ─── M15 ────────────────────────────────────────────────────────────────────────── */
const TAB_ORDER: UpdateTab[] = ["notifications", "team", "activity"];
const TAB_ITEMS: { id: UpdateTab; label: string; count: number }[] = [
  { id: "notifications", label: copy.updates.tabs.notifications, count: 3 },
  { id: "team", label: copy.updates.tabs.team, count: 0 },
  { id: "activity", label: copy.updates.tabs.activity, count: 0 },
];

export function Tabs({ run }: DemoProps) {
  const active = TAB_ORDER[run % TAB_ORDER.length];
  // Two stages, one page: ids must not collide, and each tab's aria-controls must point at
  // a panel that exists.
  const prefix = `motion-tabs-${useId().replace(/:/g, "")}`;
  return (
    <div className="flex flex-col items-center gap-3">
      <UpdateTabs tabs={TAB_ITEMS} active={active} onChange={() => {}} idPrefix={prefix} />
      {TAB_ITEMS.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${prefix}-panel-${tab.id}`}
          aria-labelledby={`${prefix}-tab-${tab.id}`}
          hidden={tab.id !== active}
          className="t-meta text-(--text-2)"
        >
          {tab.label} updates
        </div>
      ))}
    </div>
  );
}

/* ─── M16 ────────────────────────────────────────────────────────────────────────── */
export function SkeletonSwap({ reduced, run }: DemoProps) {
  const [loaded, setLoaded] = useState(true);
  const ran = useRef(0);

  useEffect(() => {
    if (run === 0 || run === ran.current) return;
    ran.current = run;
    setLoaded(false);
    const id = window.setTimeout(() => setLoaded(true), 700);
    return () => window.clearTimeout(id);
  }, [run]);

  return (
    <ul className="flex w-72 max-w-full flex-col gap-2 rounded-(--r-4) bg-(--surface-1) p-3">
      {["Order #4821 payment", "Escalation thread", "Rush order #4796"].map((title, i) => {
        const delay = reduced ? 0 : stepDelay(i, stagger.skeleton);
        const t = reduced || !loaded ? { duration: 0 } : { ...transition.fill, delay };
        return (
          <li key={title} className="relative h-9">
            <motion.div initial={false} animate={{ opacity: loaded ? 0 : 1 }} transition={t} className="absolute inset-0">
              <Skeleton className="h-8 w-full" />
            </motion.div>
            <motion.div
              initial={false}
              animate={{ opacity: loaded ? 1 : 0 }}
              transition={t}
              className="absolute inset-0 flex items-center gap-2 px-1 t-meta text-(--text-1)"
            >
              <TierIcon tier="next" className="icon-sm text-(--next-fg)" />
              {title}
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}

/* ─── M17 ────────────────────────────────────────────────────────────────────────── */
export function AllClearMini({ reduced, run }: DemoProps) {
  const on = useHold(run, 6000);
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Mounted only while playing: at rest there is nothing running. The aurora is the
          one loop the catalog allows, and this stops it after six seconds. */}
      {on && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition.slow}
          className={cn("aurora absolute inset-0", reduced && "[animation:none]")}
        />
      )}
      <motion.p
        key={on ? "on" : "off"}
        initial={on ? { opacity: 0, y: 12 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...(reduced ? { duration: 0.16 } : transition.move), delay: on && !reduced ? duration.fill : 0 }}
        className="t-section relative text-(--text-1)"
      >
        You are clear until 13:00
      </motion.p>
      <ul className="relative mt-3 flex w-56 flex-col">
        {["Order #4821", "Label printer", "Escalation thread"].map((t, i) => (
          <motion.li
            key={`${t}-${on}`}
            initial={on ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition.base, delay: on ? duration.fill + stepDelay(i, stagger.allClear) : 0 }}
            className="flex h-7 items-center justify-between t-meta text-(--text-2) shadow-[inset_0_-1px_0_var(--line-1)]"
          >
            <span>{t}</span>
            <span className="tnum">10:{10 + i * 7}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ─── M18 ────────────────────────────────────────────────────────────────────────── */
export function CountChange({ reduced, run, variant }: DemoProps) {
  const [count, setCount] = useState(3);
  const [flash, setFlash] = useState(false);
  const [seen, setSeen] = useState(run);
  if (seen !== run) {
    setSeen(run);
    if (variant === 0) {
      setCount(count + 1);
      setFlash(true);
    } else {
      setCount(Math.max(0, count - 1));
    }
  }

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(false), 150);
    return () => window.clearTimeout(id);
  }, [flash]);

  return (
    <div className="flex w-56 max-w-full flex-col">
      <div className="flex h-9 items-center justify-between px-3">
        <span className="t-meta font-semibold text-(--text-1)">Up next</span>
        <span className="tnum t-meta min-w-[2ch] text-right text-(--text-2)">
          <NumberFlow value={count} animated={!reduced} />
        </span>
      </div>
      <div
        aria-hidden
        className={cn(
          "h-px w-full transition-colors ease-(--ease-out)",
          // Up fast, back slow: the flash is the eye catching the change, the fade is
          // the eye being let go.
          flash ? "bg-(--text-2) duration-(--dur-instant)" : "bg-(--line-1) duration-(--dur-flash)",
        )}
      />
    </div>
  );
}
