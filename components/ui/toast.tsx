import { cn } from "@/lib/cn";

/**
 * The toast shell: 360×56, overlay surface, e3, bottom-left. Every toast in the app is
 * this shape — M8 routed the plain ones through it too, so there is no second toast
 * design living in Sonner's default stylesheet.
 *
 * Placement is a decision, not a default. v1's undo toast never appeared on screen at
 * all; v2's measured 301×33 and landed over the top bar's search field with a sub-44px
 * Undo target. Bottom-left (reference t01, Todoist) keeps it clear of both the content
 * column and the chrome.
 *
 * Below 768 it spans the width it is given rather than holding 360 inside a 390px
 * viewport, and the `<Toaster>`'s mobile offset lifts it above both the dock and
 * `/work`'s sticky primary — craft check 10 fails on any two fixed rectangles that
 * intersect at 390, and three stacked fixed bars is exactly how that happens.
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
      data-testid="toast"
      className={cn(
        "flex h-14 w-90 items-center gap-3 rounded-(--r-5) border border-(--line-1) bg-(--surface-3) px-4 shadow-(--e3)",
        "max-md:w-full",
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
