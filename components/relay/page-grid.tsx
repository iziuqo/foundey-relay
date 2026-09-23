import { cn } from "@/lib/cn";

/**
 * §5.1 shell: the named two-track grid every screen assembles from — a main column
 * and a rail, never a bespoke flex/grid re-derived per page (that ad hoc approach is
 * what produced v2's 1024-is-wider-than-1440 inversion). `.page-grid` carries the
 * breakpoint math (globals.css); these three components just apply it consistently.
 */
export function PageGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("page-grid", className)} {...props} />;
}

export function PageMain({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("page-main flex flex-col gap-6", className)} {...props} />;
}

/** Zero interactive elements (§7.3) — it is reference material, and the first thing
 * to go below 1200px. Renders only through the CSS rule in globals.css, not JS. */
export function PageRail({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <aside aria-label="Reference" className={cn("page-rail", className)} {...props} />;
}
