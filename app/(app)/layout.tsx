import { Toaster } from "sonner";
import { Sidebar } from "@/components/relay/sidebar";
import { TopBar } from "@/components/relay/top-bar";
import { BottomDock } from "@/components/relay/bottom-dock";
import { ToastBridge } from "@/components/relay/toast-bridge";
import { CommandPalette } from "@/components/relay/command-palette";
import { ShortcutsSheet } from "@/components/relay/shortcuts-sheet";
import { GlobalHotkeys } from "@/components/relay/global-hotkeys";

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
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
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
