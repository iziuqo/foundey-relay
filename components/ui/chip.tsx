import { cn } from "@/lib/cn";
import { CONTROL } from "./sizing";

/**
 * The one place components reach for tier tokens directly.
 *
 * A chip carries a tier's *text and border*, never a saturated fill: the colour budget
 * allows a tint under an Act-now row and the hero, and nothing else above chroma 0.03.
 * v1 shipped a solid red "Late by 2 h" pill in the Up next group — the most saturated
 * object on the screen, in the second tier, telling the eye the ranking was wrong.
 */
const tierClasses = {
  now: "bg-(--act-bg) text-(--act-fg) border-(--act-line)",
  next: "bg-(--next-bg) text-(--next-fg) border-(--next-line)",
  later: "bg-(--when-bg) text-(--when-fg) border-(--when-line)",
  fyi: "bg-(--fyi-bg) text-(--fyi-fg) border-(--fyi-line)",
  success: "bg-(--success-bg) text-(--success-fg) border-(--success-fg)/30",
  neutral: "bg-(--surface-2) text-(--text-2) border-(--line-1)",
} as const;

// Chips only ever take the two dense steps: a chip the height of a button is a button.
const sizeClasses = {
  sm: { height: "h-6", radius: "rounded-(--r-2)", text: "t-mono", padding: "px-1.5", gap: "gap-1", icon: "[&_svg]:size-3.5" },
  md: CONTROL.xs,
} as const;

export type ChipTier = keyof typeof tierClasses;
export type ChipSize = keyof typeof sizeClasses;

export type ChipProps = React.HTMLAttributes<HTMLSpanElement> & {
  tier?: ChipTier;
  size?: ChipSize;
};

export function Chip({ tier = "neutral", size = "md", className, children, ...props }: ChipProps) {
  const control = sizeClasses[size];
  return (
    <span
      data-chip={tier}
      className={cn(
        "inline-flex w-fit items-center border font-medium whitespace-nowrap",
        control.height,
        control.radius,
        control.text,
        control.padding,
        control.gap,
        control.icon,
        tierClasses[tier],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
