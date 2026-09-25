import { cn } from "@/lib/cn";

/**
 * Sizes are the control ladder's steps, not a private scale: an avatar sitting in a
 * 40px control is 28, one in a 32px control is 24, and the 40 step is for the detail
 * panels that give a person a heading of their own.
 *
 * The type steps are the scale's own (`--t-mono-size`, `--t-meta-size`,
 * `--t-body-size`) rather than arbitrary values, so a disc cannot quietly add a ninth
 * font size to the page and fail craft check 2. Initials are two capitals with neither
 * ascender nor descender, so they optically float large inside a disc: each step sits a
 * notch below the size it would take in running text, at 600, with the tracking opened
 * slightly so the pair does not collide.
 */
const sizeClasses = {
  sm: "size-6 text-(length:--t-mono-size)",
  md: "size-7 text-(length:--t-meta-size)",
  lg: "size-10 text-(length:--t-body-size)",
} as const;

export interface PersonAvatarProps {
  initials: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}

/**
 * Neutral by design — avatars never carry tier or status hue (§4.2 color budget).
 *
 * v4: the fill was `--surface-3`, which resolves to `--n-0` in light **and** wire, the
 * same token as `--surface-1`. So on every light surface in the app the disc was pure
 * white on pure white: there was no avatar, only two grey letters floating beside a
 * name, in the roster, in /updates and in the top bar. Only dark mode ever drew one.
 *
 * It now takes `--surface-2` with a hairline, which is a real object in all three modes,
 * and `--text-2` for the initials — quiet enough that a column of them still reads as a
 * list of people rather than a row of badges.
 */
export function PersonAvatar({ initials, size = "md", className }: PersonAvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-(--line-1)",
        "bg-(--surface-2) font-semibold tracking-[0.01em] text-(--text-2) select-none",
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
