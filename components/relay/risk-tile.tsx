import { useEffect, useRef, useState } from "react";
import NumberFlow from "@number-flow/react";
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

/** M11: flashes the tile's border once when a numeric value increases — never on a
 * decrease (a count going down is good news, nothing to flag) and never on mount. */
function useFlashOnIncrease(value: string | number): boolean {
  const [flash, setFlash] = useState(false);
  const prev = useRef<number | null>(typeof value === "number" ? value : null);
  useEffect(() => {
    if (typeof value !== "number") return;
    if (prev.current !== null && value > prev.current) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 600);
      prev.current = value;
      return () => clearTimeout(timer);
    }
    prev.current = value;
  }, [value]);
  return flash;
}

/**
 * §6.3 / §4.2: full width, min 12rem, every tile a toggle filter with a visible active
 * state (README P1 20 — the v1 tiles had none). Neutral surface at rest; the only tier
 * hue is the icon, never the tile background (color budget). M11: the count rolls
 * (NumberFlow) and the border flashes once on an increase.
 */
export function RiskTile({ icon: Icon, label, value, sub, pressed, onClick }: RiskTileProps) {
  const interactive = Boolean(onClick);
  const Comp = interactive ? "button" : "div";
  const flash = useFlashOnIncrease(value);
  return (
    <Comp
      type={interactive ? "button" : undefined}
      aria-pressed={interactive ? Boolean(pressed) : undefined}
      onClick={onClick}
      className={cn(
        "flex min-w-48 flex-1 flex-col gap-1.5 rounded-(--radius-control) border p-4 text-left transition-colors duration-[240ms]",
        pressed
          ? "border-(--accent) bg-(--surface-2)"
          : "border-(--border-1) bg-(--surface-1)",
        flash && "border-(--act-border)",
        interactive && "hover:bg-(--surface-2) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--focus) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg)",
      )}
    >
      <span className="flex items-center gap-2 text-(length:--text-meta) font-medium text-(--text-2)">
        <Icon className="size-(--size-icon-md) shrink-0" aria-hidden />
        {label}
      </span>
      <span className="tnum text-(length:--text-title) leading-(length:--leading-title) font-semibold text-(--text-1)">
        {typeof value === "number" ? <NumberFlow value={value} /> : value}
      </span>
      {sub && <span className="text-(length:--text-meta) text-(--text-2)">{sub}</span>}
    </Comp>
  );
}
