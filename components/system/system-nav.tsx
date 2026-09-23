"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { FOCUS } from "@/components/ui/sizing";
import { systemNav } from "./nav";

/**
 * The section list. A column beside the page from 768; a row of tabs that scrolls
 * sideways below it, so five sections never eat a phone's first screen. The current one
 * is marked by weight and a surface, never by hue — the accent is not on the nav
 * whitelist (plan §4.2).
 */
export function SystemNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="System sections"
      className="shrink-0 border-b border-(--line-1) md:sticky md:top-(--h-topbar) md:h-[calc(100dvh-var(--h-topbar))] md:w-52 md:overflow-y-auto md:border-r md:border-b-0"
    >
      <ul className="flex gap-1 overflow-x-auto p-2 md:flex-col md:p-3">
        {systemNav.map((item) => {
          const current = pathname === item.href;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "tap-48 flex h-(--h-md) items-center rounded-(--r-3) px-3 t-meta max-md:h-(--h-lg)",
                  FOCUS,
                  current
                    ? "bg-(--surface-2) font-semibold text-(--text-1)"
                    : "font-medium text-(--text-2) hover:bg-(--surface-2) hover:text-(--text-1)",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
