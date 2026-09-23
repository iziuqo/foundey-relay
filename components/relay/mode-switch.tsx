"use client";

import { Sun, Moon, Grid3x3 } from "lucide-react";
import { copy } from "@/lib/copy";
import { useStore } from "@/state/store";
import { switchTheme } from "@/lib/theme-transition";
import { IconButton } from "@/components/ui/icon-button";

type Mode = "light" | "dark" | "wire";

const MODES: { id: Mode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: copy.modeSwitch.light, icon: Sun },
  { id: "dark", label: copy.modeSwitch.dark, icon: Moon },
  { id: "wire", label: copy.modeSwitch.wire, icon: Grid3x3 },
];

/**
 * D2: light, dark and wire are three first-class modes, reachable from the top bar —
 * not a hi-fi toggle plus a wireframe setting buried in a demo menu. Wire is a
 * fidelity transform independent of theme (data-fidelity="wire" stacks on top of
 * data-theme, globals.css), so selecting it leaves the underlying theme as it was;
 * switching back to Light or Dark returns to it.
 */
export function ModeSwitch() {
  const theme = useStore((s) => s.theme);
  const wireframe = useStore((s) => s.wireframe);
  const setTheme = useStore((s) => s.setTheme);
  const setWireframe = useStore((s) => s.setWireframe);

  const active: Mode = wireframe ? "wire" : theme;

  function select(mode: Mode, origin: { x: number; y: number }) {
    if (mode === active) return;
    if (mode === "wire") {
      switchTheme(() => setWireframe(true), origin);
    } else {
      switchTheme(() => {
        setWireframe(false);
        setTheme(mode);
      }, origin);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={copy.modeSwitch.label}
      className="flex items-center gap-0.5 rounded-(--r-3) border border-(--line-1) bg-(--surface-1) p-0.5"
    >
      {MODES.map(({ id, label, icon: Icon }) => {
        const checked = active === id;
        return (
          <IconButton
            key={id}
            role="radio"
            aria-checked={checked}
            aria-label={label}
            title={label}
            size="sm"
            variant={checked ? "secondary" : "ghost"}
            className={checked ? undefined : "border border-transparent"}
            onClick={(e) => select(id, { x: e.clientX, y: e.clientY })}
          >
            <Icon aria-hidden />
          </IconButton>
        );
      })}
    </div>
  );
}
