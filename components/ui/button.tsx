import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

// Size contract, plan §4.4: button sm 32 / md 40 / lg 48, icon scales with it.
const sizeClasses = {
  sm: "h-(--size-control-sm) px-3 text-(length:--text-meta) gap-1.5 [&_svg]:size-(--size-icon-sm)",
  md: "h-(--size-control-md) px-4 text-(length:--text-body) gap-2 [&_svg]:size-(--size-icon-md)",
  lg: "h-(--size-control-lg) px-5 text-(length:--text-body) gap-2 [&_svg]:size-(--size-icon-lg)",
} as const;

// Color budget §4.2: primary is the one accent, nothing else claims it.
const variantClasses = {
  primary:
    "bg-(--accent-solid) text-(--accent-solid-fg) hover:brightness-110 active:brightness-95 data-[force=hover]:brightness-110 data-[force=active]:brightness-95",
  secondary:
    "bg-(--surface-2) text-(--text-1) border border-(--border-1) hover:bg-(--surface-3) active:bg-(--surface-3) data-[force=hover]:bg-(--surface-3) data-[force=active]:bg-(--surface-3)",
  ghost:
    "bg-transparent text-(--text-1) hover:bg-(--surface-2) active:bg-(--surface-3) data-[force=hover]:bg-(--surface-2) data-[force=active]:bg-(--surface-3)",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Forces a pseudo-class-like visual state for the /system states matrix and G1 screenshots. Not for app code. */
  forceState?: "hover" | "active" | "focus";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, forceState, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={props.type ?? "button"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-force={forceState}
      className={cn(
        "inline-flex items-center justify-center rounded-(--radius-control) font-medium whitespace-nowrap select-none",
        "transition-[filter,background-color,transform] duration-[90ms] ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg)",
        "data-[force=focus]:outline-none data-[force=focus]:ring-2 data-[force=focus]:ring-(--focus) data-[force=focus]:ring-offset-2 data-[force=focus]:ring-offset-(--bg)",
        "active:scale-[0.98] data-[force=active]:scale-[0.98]",
        "disabled:opacity-50 disabled:pointer-events-none",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {/* Loading keeps its accessible name (aria-busy communicates the state to AT) —
          it never becomes a button with no name for screen reader users. */}
      <span className={loading ? "sr-only" : undefined}>{children}</span>
    </button>
  );
});
