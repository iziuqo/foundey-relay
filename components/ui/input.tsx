import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "h-(--size-control-sm) px-2.5 text-(length:--text-meta)",
  md: "h-(--size-control-md) px-3 text-(length:--text-body)",
  lg: "h-(--size-control-lg) px-3.5 text-(length:--text-body)",
} as const;

export type InputSize = keyof typeof sizeClasses;

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: InputSize;
  invalid?: boolean;
  forceState?: "hover" | "focus";
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = "md", invalid = false, forceState, disabled, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      data-force={forceState}
      className={cn(
        "w-full rounded-(--radius-control) border bg-(--surface-1) text-(--text-1) placeholder:text-(--text-3)",
        "border-(--border-1) hover:border-(--border-2) data-[force=hover]:border-(--border-2)",
        "outline-none transition-[border-color,box-shadow] duration-[90ms] ease-out",
        "focus-visible:border-(--focus) focus-visible:ring-2 focus-visible:ring-(--focus)",
        "data-[force=focus]:border-(--focus) data-[force=focus]:ring-2 data-[force=focus]:ring-(--focus)",
        "disabled:opacity-50 disabled:pointer-events-none",
        invalid &&
          "border-(--act-border) focus-visible:border-(--act-fg) focus-visible:ring-(--act-fg) data-[force=focus]:border-(--act-fg) data-[force=focus]:ring-(--act-fg)",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
