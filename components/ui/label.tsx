import { cn } from "@/lib/cn";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

/** Every input gets one. v1 shipped three fields whose only label was a placeholder. */
export function Label({ className, ...props }: LabelProps) {
  return <label className={cn("t-meta text-(--text-2)", className)} {...props} />;
}
