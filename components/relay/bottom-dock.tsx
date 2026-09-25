"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { appNav } from "./app-nav";

/** §5.5 shell: a flush, full-width dock — not the floating rounded pill v2 shipped,
 * which sat 12px off the edge and overlapped a fixed action bar by 1px (e02: the fix
 * is a dock that persists across the view without floating over content). It stays
 * `fixed` (a nav that should never scroll away needs viewport, not flow, positioning)
 * but drops the margin and radius that made v2's read as a floating prototype chip. */
export function BottomDock() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      data-testid="bottom-dock"
      className="fixed inset-x-0 bottom-0 z-40 flex h-(--h-dock) shrink-0 items-stretch justify-around border-t border-(--line-1) bg-(--surface-1) lg:hidden"
    >
      {appNav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            className={cn(
              "t-meta flex flex-1 flex-col items-center justify-center gap-0.5",
              active ? "text-(--accent)" : "text-(--text-2)",
            )}
          >
            <item.icon className="icon-lg" aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
