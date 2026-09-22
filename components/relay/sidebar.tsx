"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { appNav } from "./app-nav";
import { RelayMark } from "./mark";

/** §5 shell: collapsed icon sidebar (64px) at 1024, full (15rem) at 1280+. Below 1024
 * there's no sidebar — the top bar and BottomDock carry navigation instead. */
export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="hidden shrink-0 flex-col gap-1 border-r border-(--border-1) bg-(--surface-1) p-2 lg:flex lg:w-16 xl:w-60 xl:p-4"
    >
      <div className="mb-4 flex items-center gap-2 px-2 py-1">
        <RelayMark className="size-6 shrink-0" />
        <span className="hidden text-(length:--text-title) font-semibold text-(--text-1) xl:inline">{copy.appName}</span>
      </div>
      {appNav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-(--radius-control) px-3 py-2.5 text-(length:--text-meta) font-medium transition-colors",
              active ? "bg-(--surface-2) text-(--text-1)" : "text-(--text-2) hover:bg-(--surface-2) hover:text-(--text-1)",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus)",
            )}
          >
            <item.icon className="size-(--size-icon-md) shrink-0" aria-hidden />
            <span className="hidden truncate xl:inline">{item.label}</span>
            {item.stub && <span className="hidden text-(length:--text-meta) text-(--text-3) xl:inline">{item.stub}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
