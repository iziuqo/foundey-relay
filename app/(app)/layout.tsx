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
  () => import("@/components/relay/command-palette").then((m) => m.CommandPalette),
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
        <main className="canvas-texture min-w-0 flex-1 pb-[120px] lg:pb-0">{children}</main>
      </div>
      <BottomDock />
      <ToastBridge />
      {modal}
      <CommandPalette />
      <ShortcutsSheet />
      <GlobalHotkeys />
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast:
              "!rounded-(--radius-control) !border !border-(--border-1) !bg-(--surface-1) !text-(--text-1) !shadow-(--shadow-e3)",
            actionButton: "!bg-(--accent-solid) !text-(--accent-solid-fg)",
            description: "!text-(--text-2)",
          },
        }}
      />
    </div>
  );
}
