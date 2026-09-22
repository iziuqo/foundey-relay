import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export interface RiskTileProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  /** Non-filtering tiles (Next truck) render without a pressed state. */
  pressed?: boolean;
  onClick?: () => void;
}

/**
 * §6.3 / §4.2: full width, min 12rem, every tile a toggle filter with a visible active
 * state (README P1 20 — the v1 tiles had none). Neutral surface at rest; the only tier
 * hue is the icon, never the tile background (color budget).
 */
export function RiskTile({ icon: Icon, label, value, sub, pressed, onClick }: RiskTileProps) {
  const interactive = Boolean(onClick);
  const Comp = interactive ? "button" : "div";
  return (
    <Comp
      type={interactive ? "button" : undefined}
      aria-pressed={interactive ? Boolean(pressed) : undefined}
      onClick={onClick}
      className={cn(
        "flex min-w-48 flex-1 flex-col gap-1.5 rounded-(--radius-control) border p-4 text-left transition-colors",
        pressed
          ? "border-(--accent) bg-(--surface-2)"
          : "border-(--border-1) bg-(--surface-1)",
        interactive && "hover:bg-(--surface-2) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg)",
      )}
    >
      <span className="flex items-center gap-2 text-(length:--text-meta) font-medium text-(--text-2)">
        <Icon className="size-(--size-icon-md) shrink-0" aria-hidden />
        {label}
      </span>
      <span className="tnum text-(length:--text-title) leading-(length:--leading-title) font-semibold text-(--text-1)">
        {value}
      </span>
      {sub && <span className="text-(length:--text-meta) text-(--text-2)">{sub}</span>}
    </Comp>
  );
}
