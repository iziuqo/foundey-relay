import { cn } from "@/lib/cn";

/**
 * Every list, the palette, the rail and the detail sheet get one of these. An empty
 * state is a designed state, not the absence of one — and it says what will appear
 * here, not "no data".
 */
export function EmptyState({
  title,
  description,
  action,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn("flex flex-col items-center gap-2 px-6 py-10 text-center", className)}
      {...props}
    >
      <p className="t-row text-(--text-1)">{title}</p>
      {description && <p className="t-body max-w-[46ch] text-(--text-2)">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
