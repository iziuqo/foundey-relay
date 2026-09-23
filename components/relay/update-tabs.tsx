"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { transition } from "@/lib/motion";
import { FOCUS } from "@/components/ui/sizing";
import type { UpdateTab } from "@/lib/selectors";

export interface UpdateTabsProps {
  tabs: { id: UpdateTab; label: string; count: number }[];
  active: UpdateTab;
  onChange: (tab: UpdateTab) => void;
}

/** Hand rolled instead of a library: three tabs, arrow-key nav, real `tablist`/`tab`
 * semantics (README P1 13 — v1's Segmented had none). */
export function UpdateTabs({ tabs, active, onChange }: UpdateTabsProps) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = e.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
    refs.current[next]?.focus();
    onChange(tabs[next].id);
  }

  return (
    <div role="tablist" aria-label="Updates" className="flex w-fit gap-1 rounded-(--r-4) bg-(--surface-2) p-1">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => {
            refs.current[index] = el;
          }}
          role="tab"
          type="button"
          id={`update-tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`update-panel-${tab.id}`}
          tabIndex={active === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={(e) => onKeyDown(e, index)}
          className={cn(
            "tap-48 relative flex items-center gap-1.5 rounded-(--r-2) px-3 py-1.5 t-meta",
            FOCUS,
            active === tab.id ? "text-(--text-1)" : "text-(--text-2) hover:text-(--text-1)",
          )}
        >
          {/* M10: the active pill glides between tabs (a shared layoutId) instead of
              jumping — each tab renders it only while active, so it's always exactly
              one element moving, not one per tab fading in place. */}
          {active === tab.id && (
            <motion.div
              layoutId="update-tab-pill"
              transition={transition.glide}
              className="absolute inset-0 -z-10 rounded-(--r-2) bg-(--surface-1) shadow-(--e1)"
            />
          )}
          {tab.label}
          {tab.count > 0 && <span className="text-(--text-2)">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
