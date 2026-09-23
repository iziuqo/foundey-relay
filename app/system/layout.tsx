import Link from "next/link";
import { systemNav } from "@/components/system/nav";
import { ThemeToggle } from "@/components/system/theme-toggle";

export default function SystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-(--breakpoint-2xl) flex-col">
      <header className="flex h-(--size-control-lg) shrink-0 items-center justify-between border-b border-(--border-1) px-6">
        <p className="text-(length:--text-body) font-medium text-(--text-1)">Relay /system</p>
        <ThemeToggle />
      </header>
      <div className="flex flex-1">
        <nav aria-label="System sections" className="w-48 shrink-0 border-r border-(--border-1) p-4">
          <ul className="flex flex-col gap-1">
            {systemNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-(--radius-control) px-3 py-2 text-(length:--text-meta) font-medium text-(--text-2) hover:bg-(--surface-2) hover:text-(--text-1) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus)"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="min-w-0 flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
