import { cn } from "@/lib/cn";

/**
 * The card. One hairline plus one shadow step, and never a border with a shadow heavier
 * than e1 — the hero is the single exception, because it is the one object on the page
 * allowed to sit above the surface.
 *
 * `inner` exists for the dark-mode rule: alpha-white borders compound, so a bordered
 * card may not contain a bordered card. An inner box steps the surface instead.
 */
const toneClasses = {
  card: "bg-(--surface-1) border border-(--line-1) shadow-(--e1)",
  inner: "bg-(--surface-2)",
  raised: "bg-(--surface-1) border border-(--line-1) shadow-(--e2)",
  overlay: "bg-(--surface-3) border border-(--line-1) shadow-(--e3)",
} as const;

export type PanelTone = keyof typeof toneClasses;

export type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: PanelTone;
  /** Radius follows the object's size, not the component: 12 for a row-sized card, 16 for a surface. */
  radius?: "r-4" | "r-5";
};

export function Panel({ tone = "card", radius = "r-4", className, ...props }: PanelProps) {
  return (
    <div
      data-panel={tone}
      className={cn(radius === "r-5" ? "rounded-(--r-5)" : "rounded-(--r-4)", toneClasses[tone], className)}
      {...props}
    />
  );
}
