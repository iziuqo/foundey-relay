import { cn } from "@/lib/cn";

/**
 * No shimmer. The demo store resolves in under 50ms, and a shimmer loop is a lie about
 * latency — it tells the eye to wait for something that has already arrived. The block
 * holds the space, then the content crossfades in over 180ms (motion catalog M16).
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("rounded-(--r-2) bg-(--surface-2)", className)} {...props} />;
}
