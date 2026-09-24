import type { EncodedTier } from "./tier-icon";

// §4.2 color budget: tier hues are only for tier icons/headers/hero border+glow/time
// pills. Shared here so hero, queue, and the truck clock pick the same classes.
export const tierFgClass: Record<EncodedTier, string> = {
  now: "text-(--act-fg)",
  next: "text-(--next-fg)",
  later: "text-(--when-fg)",
  fyi: "text-(--fyi-fg)",
};

export const tierStrokeClass: Record<EncodedTier, string> = {
  now: "stroke-(--act-fg)",
  next: "stroke-(--next-fg)",
  later: "stroke-(--when-fg)",
  fyi: "stroke-(--fyi-fg)",
};

export const tierBorderClass: Record<EncodedTier, string> = {
  now: "border-(--act-line)",
  next: "border-(--next-line)",
  later: "border-(--when-line)",
  fyi: "border-(--fyi-line)",
};

// §4.5: the hero's tier glow is dark-theme only, a blurred radial shadow behind the
// card. The fade from 12% to 6% after 2s is motion (phase 6); this is its resting 6%.
export const tierGlowShadowClass: Record<EncodedTier, string> = {
  now: "dark:shadow-[0_0_56px_var(--act-glow)]",
  next: "dark:shadow-[0_0_56px_var(--next-glow)]",
  later: "dark:shadow-[0_0_56px_var(--when-glow)]",
  fyi: "dark:shadow-[0_0_56px_var(--fyi-glow)]",
};
