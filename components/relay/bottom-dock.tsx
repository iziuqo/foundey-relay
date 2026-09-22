"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { appNav } from "./app-nav";

/** §5 / §3.3 Fey+Fabric reference: floating bottom dock, the only nav below 1024. */
export function BottomDock() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-(--radius-hero) border border-(--border-1) bg-(--surface-1) p-1.5 shadow-(--shadow-e3) lg:hidden"
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
              "flex min-h-12 min-w-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-(--radius-control) py-1.5 text-(length:--text-meta)",
              active ? "text-(--accent)" : "text-(--text-2)",
            )}
          >
            <item.icon className="size-(--size-icon-md)" aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
