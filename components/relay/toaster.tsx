"use client";

import { useEffect } from "react";
import { Toaster as Sonner, toast } from "sonner";

/**
 * The one module that imports Sonner, so that the layout and the bridge can both load it
 * *lazily* (G8, LOG M14): Sonner is 15KB gzipped and nothing is toasted until someone acts,
 * so it should not be in the bundle a first paint waits on. `cmdk` got the same treatment
 * in G8's first pass (app/(app)/layout.tsx).
 *
 * The trap in loading it late is a toast fired before the Toaster exists, which Sonner
 * drops silently: the Toaster subscribes to the toast store in an effect and starts empty.
 * `toasterReady` resolves after that effect (a child's effect runs before its parent's), and
 * the bridge awaits it before it toasts.
 */
let markReady: () => void = () => {};
export const toasterReady = new Promise<void>((resolve) => {
  markReady = resolve;
});

export { toast };

export default function Toaster() {
  useEffect(() => markReady(), []);
  return (
    <Sonner
      position="bottom-left"
      offset={{ left: "var(--toast-x)", right: "var(--toast-x)", bottom: "var(--toast-y)" }}
      mobileOffset={{ left: "var(--toast-x)", right: "var(--toast-x)", bottom: "var(--toast-y)" }}
      toastOptions={{ unstyled: true }}
    />
  );
}
