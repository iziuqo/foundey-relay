import { cn } from "@/lib/cn";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-(length:--text-meta) font-medium text-(--text-2)", className)}
      {...props}
    />
  );
}
