import { cn } from "@/lib/cn";

// Color budget §4.2: tier hues are only for tier chips/icons/headers/glow, so this is
// the one place components reach for --act-*/--next-*/--when-*/--fyi-*.
const tierClasses = {
  now: "bg-(--act-bg) text-(--act-fg) border-(--act-border)",
  next: "bg-(--next-bg) text-(--next-fg) border-(--next-border)",
  later: "bg-(--when-bg) text-(--when-fg) border-(--when-border)",
  fyi: "bg-(--fyi-bg) text-(--fyi-fg) border-(--fyi-border)",
  success: "bg-(--success-bg) text-(--success-fg) border-(--success-border)",
  neutral: "bg-(--surface-2) text-(--text-2) border-(--border-1)",
} as const;

const sizeClasses = {
  sm: "h-(--size-chip-sm) px-2 text-(length:--text-kbd) gap-1 [&_svg]:size-(--size-icon-sm)",
  md: "h-(--size-chip-md) px-2.5 text-(length:--text-meta) gap-1.5 [&_svg]:size-(--size-icon-sm)",
} as const;

export type ChipTier = keyof typeof tierClasses;
export type ChipSize = keyof typeof sizeClasses;

export type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  tier?: ChipTier;
  size?: ChipSize;
};

export function Chip({ tier = "neutral", size = "md", className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "tnum inline-flex w-fit items-center whitespace-nowrap rounded-(--radius-chip) border font-medium",
        tierClasses[tier],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
