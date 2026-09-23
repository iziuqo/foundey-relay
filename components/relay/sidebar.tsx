"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { copy } from "@/lib/copy";
import { cn } from "@/lib/cn";
import { appNav } from "./app-nav";
import { RelayMark } from "./mark";

/** §5 shell: collapsed icon rail (64px) at 1024, full (240px) at 1280+. Below 1024
 * there's no rail — the top bar and BottomDock carry navigation instead. The active
 * item is the only "where am I" cue at the shell level — the top bar never repeats
 * a page name, so there is exactly one location announcement, not three (plan §10.2
 * M3 trap). */
export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      data-testid="nav-rail"
      className="hidden shrink-0 flex-col gap-1 border-r border-(--line-1) bg-(--surface-1) p-2 lg:flex lg:w-16 xl:w-60 xl:p-4"
    >
      <div className="mb-4 flex items-center gap-2 px-2 py-1">
        <RelayMark className="size-6 shrink-0" />
        <span className="t-section hidden text-(--text-1) xl:inline">{copy.appName}</span>
      </div>
      {appNav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "t-meta flex items-center gap-3 rounded-(--r-3) px-3 py-2.5 transition-colors",
              active ? "bg-(--surface-2) text-(--text-1)" : "text-(--text-2) hover:bg-(--surface-2) hover:text-(--text-1)",
              "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus)",
            )}
          >
            <item.icon className="size-(--icon-lg) shrink-0" aria-hidden />
            <span className="hidden truncate xl:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
