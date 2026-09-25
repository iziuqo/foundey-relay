import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { CONTROL, DISABLED, FOCUS, type ControlSize } from "./sizing";

// The chevron's inset mirrors the control's own padding, so the gap on the right of the
// glyph matches the gap on the left of the text.
const chevron = {
  xs: "icon-sm right-2",
  sm: "icon-sm right-2.5",
  md: "icon-md right-3",
  lg: "icon-lg right-4",
} as const;

const textPadding = {
  xs: "pl-2.5 pr-7",
  sm: "pl-3 pr-8",
  md: "pl-3.5 pr-9",
  lg: "pl-5 pr-11",
} as const;

export type SelectSize = ControlSize;

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
  const control = CONTROL[size];
  return (
    <span className={cn("relative inline-block w-full", wrapperClassName)}>
      <select
        ref={ref}
        disabled={disabled}
        data-force={forceState}
        data-control={size}
        className={cn(
          "w-full appearance-none border bg-(--surface-1) text-(--text-1)",
          "border-(--line-2) hover:border-(--text-3) data-[force=hover]:border-(--text-3)",
          "transition-[border-color] duration-(--dur-instant) ease-(--ease-out) motion-reduce:transition-none",
          control.height,
          control.radius,
          control.text,
          textPadding[size],
          FOCUS,
          DISABLED,
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-(--text-2)", chevron[size])}
      />
    </span>
  );
});
