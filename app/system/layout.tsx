import { SystemNav } from "@/components/system/system-nav";
import { ThemeToggle } from "@/components/system/theme-toggle";

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-(--breakpoint-2xl) flex-col">
      <header className="sticky top-0 z-10 flex h-(--h-topbar) shrink-0 items-center justify-between border-b border-(--line-1) bg-(--bg) px-4 md:px-6">
        <p className="t-row text-(--text-1)">Relay design system</p>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <SystemNav />
        <main className="min-w-0 flex-1 px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
