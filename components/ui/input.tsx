import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { CONTROL, DISABLED, FOCUS, type ControlSize } from "./sizing";

export type InputSize = ControlSize;

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: InputSize;
  invalid?: boolean;
  forceState?: "hover" | "focus";
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = "md", invalid = false, forceState, disabled, className, ...props },
  ref,
) {
  const control = CONTROL[size];
  return (
    <input
      ref={ref}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      data-force={forceState}
      data-control={size}
      className={cn(
        "w-full border bg-(--surface-1) text-(--text-1) placeholder:text-(--text-2) placeholder:opacity-70",
        "border-(--line-2) hover:border-(--text-3) data-[force=hover]:border-(--text-3)",
        "transition-[border-color] duration-(--dur-instant) ease-(--ease-out) motion-reduce:transition-none",
        control.height,
        control.radius,
        control.text,
        control.padding,
        FOCUS,
        DISABLED,
        // An invalid field carries the Act-now line colour, because an error is the one
        // state where a form element is allowed to borrow a tier's hue.
        invalid && "border-(--act-line) focus-visible:outline-(--act-fg) data-[force=focus]:outline-(--act-fg)",
        className,
      )}
      {...props}
    />
  );
});
