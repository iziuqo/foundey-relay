import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { CONTROL, DISABLED, FOCUS, PRESS, TAP, type ControlSize } from "./sizing";

/**
 * Primary is filled with --text-1, not the accent. Measured on v2, the indigo fill was
 * chroma ≈72 sitting inside a card tinted at ≈14 — the loudest object on a screen whose
 * whole argument is that loudness follows rank. Near-black on white reads as *the*
 * button at two metres, at 17:1, and costs no hue. The accent survives as focus and
 * links, which is all the colour budget allows it (v3 plan §4.2).
 */
const variantClasses = {
  primary: [
    "bg-(--primary-bg) text-(--primary-fg)",
    "hover:opacity-90 active:opacity-100",
    "data-[force=hover]:opacity-90 data-[force=active]:opacity-100",
  ].join(" "),
  secondary: [
    "bg-(--surface-1) text-(--text-1) border border-(--line-2)",
    "hover:bg-(--surface-2) active:bg-(--surface-2)",
    "data-[force=hover]:bg-(--surface-2) data-[force=active]:bg-(--surface-2)",
  ].join(" "),
  ghost: [
    "bg-transparent text-(--text-1)",
    "hover:bg-(--surface-2) active:bg-(--surface-2)",
    "data-[force=hover]:bg-(--surface-2) data-[force=active]:bg-(--surface-2)",
  ].join(" "),
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = ControlSize;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Forces a pseudo-class-like visual state for /system's state matrix. Not for app code. */
  forceState?: "hover" | "active" | "focus";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, forceState, disabled, className, children, ...props },
  ref,
) {
  const control = CONTROL[size];
  return (
    <button
      ref={ref}
      type={props.type ?? "button"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-force={forceState}
      data-control={size}
      className={cn(
        "inline-flex items-center justify-center font-medium whitespace-nowrap select-none",
        control.height,
        control.radius,
        control.text,
        control.padding,
        control.gap,
        control.icon,
        FOCUS,
        PRESS,
        DISABLED,
        TAP,
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden />}
      {/* Loading keeps its accessible name (aria-busy carries the state to AT) — it
          never becomes a button with no name for screen reader users. */}
      <span className={loading ? "sr-only" : undefined}>{children}</span>
    </button>
  );
});
