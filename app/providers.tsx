"use client";

import { useEffect } from "react";
import { useStore } from "@/state/store";

/**
 * §8.3: the server and the first client render both use the seed state at the seed
 * time, so they match exactly and there's no hydration mismatch. Only after mount does
 * the store rehydrate from `localStorage` (persist with `skipHydration`) and pick up
 * whatever the last session left — that happens here, once, client side only.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useStore.persist.rehydrate();

    const root = document.documentElement;
    const applyAttrs = (theme: string, wireframe: boolean) => {
      root.setAttribute("data-theme", theme);
      root.setAttribute("data-fidelity", wireframe ? "wire" : "hi");
    };
    applyAttrs(useStore.getState().theme, useStore.getState().wireframe);
    return useStore.subscribe((state) => applyAttrs(state.theme, state.wireframe));
  }, []);

  return <>{children}</>;
}
