import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "size-6 text-(length:--t-mono-size)",
  md: "size-8 text-(length:--t-meta-size)",
  lg: "size-10 text-(length:--t-body-size)",
} as const;

export interface PersonAvatarProps {
  initials: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}

/** Neutral by design — avatars never carry tier or status hue (§4.2 color budget). */
export function PersonAvatar({ initials, size = "md", className }: PersonAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-(--surface-3) font-semibold text-(--text-2)",
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
