"use client";

import { flushSync } from "react-dom";
import { duration, ease, prefersReducedMotion } from "./motion";

/** The single place that writes theme/fidelity onto `<html>` — app/providers.tsx calls
 * this from its store subscription on every change (mount, reset, wireframe toggle,
 * theme toggle), so `switchTheme` below never needs to write the attribute itself. */
export function applyThemeAttrs(theme: string, wireframe: boolean): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-fidelity", wireframe ? "wire" : "hi");
}

interface Origin {
  x: number;
  y: number;
}

/**
 * M13: theme switch as a circular reveal from the control that triggered it. `apply`
 * is the store call (`setTheme`) — wrapped in `flushSync` so every subscribed
 * component (the toggle's own icon included) finishes re-rendering before the View
 * Transition takes its "after" snapshot; without it, the attribute flips synchronously
 * but React's re-render lands a frame later and the transition captures a stale UI.
 *
 * Falls back to an instant, un-animated `apply()` when the API isn't supported or the
 * user prefers reduced motion — M13's own reduced state ("Instant") is this same
 * branch, not a separate one.
 */
export function switchTheme(apply: () => void, origin?: Origin): void {
  if (typeof document === "undefined" || !document.startViewTransition || prefersReducedMotion()) {
    apply();
    return;
  }

  const { x, y } = origin ?? { x: window.innerWidth / 2, y: 0 };
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = document.startViewTransition(() => {
    flushSync(apply);
  });

  // `.ready` can reject (observed: Chrome's InvalidStateError, e.g. when a Radix
  // popover's own CSS animation is still technically active on the element the click
  // came from) without the transition itself failing — `.finished` still resolves and
  // the DOM update from `apply()` above has already landed either way. When that
  // happens the reveal just doesn't play and the theme swaps instantly instead, which
  // is the same acceptable outcome as the reduced-motion branch, so there's nothing
  // further to do here beyond not letting it surface as an unhandled rejection.
  void transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: duration.move * 1000,
        // The same `--ease-inout` every overlay in the app glides on. The literal
        // `"ease-in-out"` keyword that was here is a different curve entirely, and the
        // largest single animation in the product is the last place to run a fourth one.
        easing: `cubic-bezier(${ease.inOut.join(", ")})`,
        pseudoElement: "::view-transition-new(root)",
      },
    );
  }, () => {});
}
