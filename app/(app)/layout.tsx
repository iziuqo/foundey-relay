"use client";

import dynamic from "next/dynamic";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/relay/sidebar";
import { TopBar } from "@/components/relay/top-bar";
import { BottomDock } from "@/components/relay/bottom-dock";
import { ToastBridge } from "@/components/relay/toast-bridge";
import { ShortcutsSheet } from "@/components/relay/shortcuts-sheet";
import { GlobalHotkeys } from "@/components/relay/global-hotkeys";

// G8: `cmdk` only pays for itself once someone opens the palette, so it isn't in
// the bundle every /work paint waits on (ssr: false — Server Components can't pass
// that option, so this file opts into "use client", which every child here already
// was). useOpenSearch (used by the always visible SearchTrigger) lives in its own
// module for the same reason (use-open-search.ts).
const CommandPalette = dynamic(
  () =>
    import("@/components/relay/command-palette").then((m) => m.CommandPalette),
  { ssr: false },
);

/** §8.2 shell: sidebar, top bar, bottom dock, toaster, and the @modal slot for the
 * item detail intercepting route (phase 4). */
export default function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {/* The one texture (§4.6): 1px dots at 24px pitch on the canvas, below the
            acuity limit at two metres, so it costs nothing there and gives the empty
            right side of /work at 1920 something to be. M1 defined the utility; nothing
            had applied it. */}
        <main className="canvas-texture min-w-0 flex-1 pb-[120px] lg:pb-0">
          {children}
        </main>
      </div>
      <BottomDock />
      <ToastBridge />
      {modal}
      <CommandPalette />
      <ShortcutsSheet />
      <GlobalHotkeys />
      {/* M6: bottom-left, out of the content column and out of the chrome. Sonner's own
          toast styling is off — every toast in this app is the `Toast` shell
          (toast-bridge.tsx), so there is one toast design rather than two. The mobile
          offset clears both the dock and /work's sticky primary; below 768 those are two
          fixed bars already, and a toast landing on either of them is craft check 10. */}
      {/* M6: bottom-left, out of the content column and out of the chrome. Sonner's own
          toast styling is off — every toast in this app is the `Toast` shell
          (toast-bridge.tsx), so there is one toast design rather than two. Where the
          corner actually is depends on which fixed furniture that width has (the rail,
          the dock, /work's sticky primary), so the offsets are breakpoint rules in
          globals.css rather than a single number here. */}
      <Toaster
        position="bottom-left"
        offset={{ left: "var(--toast-x)", right: "var(--toast-x)", bottom: "var(--toast-y)" }}
        mobileOffset={{ left: "var(--toast-x)", right: "var(--toast-x)", bottom: "var(--toast-y)" }}
        toastOptions={{ unstyled: true }}
      />
    </div>
  );
}
