import { cn } from "@/lib/cn";

/**
 * A keyboard hint. Mono, because a key is an identifier and not prose — the same rule
 * that puts order numbers and bin codes in Plex and everything else in Inter.
 */
export function Kbd({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        "t-mono inline-flex h-5 min-w-5 items-center justify-center rounded-(--r-1) border border-(--line-1)",
        "bg-(--surface-2) px-1 text-(--text-2)",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
