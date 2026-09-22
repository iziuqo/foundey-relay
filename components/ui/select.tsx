import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "h-(--size-control-sm) pl-2.5 pr-8 text-(length:--text-meta)",
  md: "h-(--size-control-md) pl-3 pr-9 text-(length:--text-body)",
  lg: "h-(--size-control-lg) pl-3.5 pr-10 text-(length:--text-body)",
} as const;

const iconPosition = {
  sm: "size-(--size-icon-sm) right-2",
  md: "size-(--size-icon-md) right-2.5",
  lg: "size-(--size-icon-lg) right-3",
} as const;

export type SelectSize = keyof typeof sizeClasses;

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  size?: SelectSize;
  forceState?: "hover" | "focus";
  /** Width lives on the wrapper (it positions the chevron), not on `className`, which
   *  targets the <select> itself — e.g. wrapperClassName="w-32" to narrow it. */
  wrapperClassName?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = "md", forceState, disabled, className, wrapperClassName, children, ...props },
  ref,
) {
  return (
    <span className={cn("relative inline-block w-full", wrapperClassName)}>
      <select
        ref={ref}
        disabled={disabled}
        data-force={forceState}
        className={cn(
          "w-full appearance-none rounded-(--radius-control) border bg-(--surface-1) text-(--text-1)",
          "border-(--border-1) hover:border-(--border-2) data-[force=hover]:border-(--border-2)",
          "outline-none transition-[border-color,box-shadow] duration-[90ms] ease-out",
          "focus-visible:border-(--focus) focus-visible:ring-2 focus-visible:ring-(--focus)",
          "data-[force=focus]:border-(--focus) data-[force=focus]:ring-2 data-[force=focus]:ring-(--focus)",
          "disabled:opacity-50 disabled:pointer-events-none",
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-(--text-3)", iconPosition[size])}
      />
    </span>
  );
});
