import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "size-(--size-control-sm) [&_svg]:size-(--size-icon-sm)",
  md: "size-(--size-control-md) [&_svg]:size-(--size-icon-md)",
  lg: "size-(--size-control-lg) [&_svg]:size-(--size-icon-lg)",
} as const;

const variantClasses = {
  ghost:
    "bg-transparent text-(--text-2) hover:bg-(--surface-2) hover:text-(--text-1) active:bg-(--surface-3) data-[force=hover]:bg-(--surface-2) data-[force=hover]:text-(--text-1) data-[force=active]:bg-(--surface-3)",
  secondary:
    "bg-(--surface-2) text-(--text-1) border border-(--border-1) hover:bg-(--surface-3) active:bg-(--surface-3) data-[force=hover]:bg-(--surface-3) data-[force=active]:bg-(--surface-3)",
} as const;

export type IconButtonSize = keyof typeof sizeClasses;
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
  return (
    <button
      ref={ref}
      type={props.type ?? "button"}
      disabled={disabled}
      data-force={forceState}
      className={cn(
        "inline-flex items-center justify-center rounded-(--radius-control)",
        "transition-[background-color,color,transform] duration-[90ms] ease-out",
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
      {children}
    </button>
  );
});
