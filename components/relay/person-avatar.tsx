import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: "size-6 text-(length:--text-kbd)",
  md: "size-8 text-(length:--text-meta)",
  lg: "size-10 text-(length:--text-body)",
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
