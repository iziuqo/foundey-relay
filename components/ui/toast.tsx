import { cn } from "@/lib/cn";

/**
 * The toast shell: 360×56, overlay surface, e3, bottom-left.
 *
 * Placement is a decision, not a default. v1's undo toast never appeared on screen at
 * all; v2's measured 301×33 and landed over the top bar's search field with a sub-44px
 * Undo target. Bottom-left (reference t01, Todoist) keeps it clear of both the content
 * column and the chrome, and clear of the handheld dock.
 *
 * M8 wires this to Sonner and adds the entrance; this is the geometry and the anatomy.
 */
export function Toast({
  message,
  detail,
  action,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  message: React.ReactNode;
  detail?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-14 w-90 items-center gap-3 rounded-(--r-5) border border-(--line-1) bg-(--surface-3) px-4 shadow-(--e3)",
        className,
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        <p className="t-meta truncate text-(--text-1)">{message}</p>
        {detail && <p className="t-meta truncate text-(--text-2)">{detail}</p>}
      </div>
      {action}
    </div>
  );
}
