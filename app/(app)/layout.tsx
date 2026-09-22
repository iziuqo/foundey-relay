import { Toaster } from "sonner";
import { Sidebar } from "@/components/relay/sidebar";
import { TopBar } from "@/components/relay/top-bar";
import { BottomDock } from "@/components/relay/bottom-dock";
import { ToastBridge } from "@/components/relay/toast-bridge";

/** §8.2 shell: sidebar, top bar, bottom dock, toaster. The @modal slot for the item
 * detail intercepting route lands in phase 4. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomDock />
      <ToastBridge />
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
