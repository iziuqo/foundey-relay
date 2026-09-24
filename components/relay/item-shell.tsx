"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";
import { tierBorderClass, tierGlowShadowClass } from "./tier-tokens";
import type { EncodedTier } from "./tier-icon";

export interface ItemShellProps {
  itemId: string;
  tier: EncodedTier;
  variant: "row" | "hero";
  /**
   * False takes this layer out of the shared-element tree for one render. M5 (undo) is
   * the only caller that does: the restored hero's counterpart row is the row it is
   * about to *replace*, so leaving the `layoutId` on would morph the two into each
   * other and play the promotion in reverse — the one thing the catalog says undo must
   * never look like.
   */
  shared?: boolean;
  className?: string;
}

/**
 * M1's shared-element morph, isolated to a purely decorative background layer. The row
 * that's about to become the hero (`variant="row"`, transparent — matches the row's
 * current no-card look exactly) and the hero itself (`variant="hero"`, the real card
 * chrome) share one `layoutId`. When the row unmounts and the hero mounts with the same
 * id in the same render (a done action promoting the next item), Motion FLIPs this
 * layer's position, size, and radius between the two.
 *
 * Real content (icon, title, buttons) is never inside this element — deliberately.
 * Motion's layout animation scales the whole box smoothly, but a 56px row growing into
 * a ~200px hero card would visibly stretch any text riding along with it. Content sits
 * in a normal sibling instead and crossfades on its own terms (Hero's own "fades up
 * 8px", §7.2 M1), so nothing gets distorted mid-morph.
 */
export function ItemShell({ itemId, tier, variant, shared = true, className }: ItemShellProps) {
  return (
    <motion.div
      layoutId={shared ? `item-shell-${itemId}` : undefined}
      layout={shared}
      transition={spring.layout}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10",
        variant === "hero"
          ? cn(
              "rounded-(--r-5) border bg-(--surface-1)",
              tierBorderClass[tier],
              tierGlowShadowClass[tier],
              tier === "now" && "bg-(--act-bg)",
            )
          : "rounded-(--r-4) border border-transparent bg-transparent",
        className,
      )}
    />
  );
}
