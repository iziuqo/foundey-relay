"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { useStore } from "@/state/store";
import { applyThemeAttrs } from "@/lib/theme-transition";

/**
 * §8.3: the server and the first client render both use the seed state at the seed
 * time, so they match exactly and there's no hydration mismatch. Only after mount does
 * the store rehydrate from `localStorage` (persist with `skipHydration`) and pick up
 * whatever the last session left — that happens here, once, client side only.
 *
 * `MotionConfig reducedMotion="user"` is Phase 6's one global switch (§7.1): every
 * Motion-driven transform and layout animation in the tree collapses to instant under
 * `prefers-reduced-motion: reduce`, while opacity and color keep animating — exactly
 * the split G6 and §7.2's per-moment reduced states ask for, with no per-component work.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useStore.persist.rehydrate();

    const state = useStore.getState();
    applyThemeAttrs(state.theme, state.wireframe);
    return useStore.subscribe((state, prev) => {
      if (state.theme === prev.theme && state.wireframe === prev.wireframe) return;
      applyThemeAttrs(state.theme, state.wireframe);
    });
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
