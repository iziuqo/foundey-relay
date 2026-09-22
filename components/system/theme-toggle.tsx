"use client";

import { useStore } from "@/state/store";
import { Button } from "@/components/ui/button";
import { switchTheme } from "@/lib/theme-transition";

export function ThemeToggle() {
  const theme = useStore((s) => s.theme);
  const wireframe = useStore((s) => s.wireframe);
  const setTheme = useStore((s) => s.setTheme);
  const toggleWireframe = useStore((s) => s.toggleWireframe);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={(e) =>
          switchTheme(() => setTheme(theme === "dark" ? "light" : "dark"), {
            x: e.clientX,
            y: e.clientY,
          })
        }
        aria-pressed={theme === "dark"}
      >
        {theme === "dark" ? "Dark" : "Light"}
      </Button>
      <Button variant="secondary" size="sm" onClick={toggleWireframe} aria-pressed={wireframe}>
        {wireframe ? "Wire" : "Hi-fi"}
      </Button>
    </div>
  );
}
