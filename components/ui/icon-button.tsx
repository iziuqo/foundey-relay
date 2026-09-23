import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { CONTROL, DISABLED, FOCUS, PRESS, TAP, type ControlSize } from "./sizing";

const variantClasses = {
  ghost: [
    "bg-transparent text-(--text-2)",
    "hover:bg-(--surface-2) hover:text-(--text-1) active:bg-(--surface-2)",
    "data-[force=hover]:bg-(--surface-2) data-[force=hover]:text-(--text-1) data-[force=active]:bg-(--surface-2)",
  ].join(" "),
  secondary: [
    "bg-(--surface-1) text-(--text-1) border border-(--line-2)",
    "hover:bg-(--surface-2) active:bg-(--surface-2)",
    "data-[force=hover]:bg-(--surface-2) data-[force=active]:bg-(--surface-2)",
  ].join(" "),
} as const;

export type IconButtonSize = ControlSize;
export type IconButtonVariant = keyof typeof variantClasses;

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  /** Required: an icon-only control has no visible text (WCAG 4.1.2). */
  "aria-label": string;
  forceState?: "hover" | "active" | "focus";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = "md", variant = "ghost", forceState, disabled, className, children, ...props },
  ref,
) {
  const control = CONTROL[size];
  return (
    <button
      ref={ref}
      type={props.type ?? "button"}
      disabled={disabled}
      data-force={forceState}
      data-control={size}
      className={cn(
        "inline-flex items-center justify-center",
        // Square, so its height still comes from the same contract entry as the text
        // buttons it shares a row with.
        control.square,
        control.radius,
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
      {children}
    </button>
  );
});
