/**
 * The inventory M11 mirrors into Figma: one row per component, naming the file it lives
 * in and the props that become variant properties. Keep it in step with the code — the
 * unit test in tests/unit/system-index.test.ts fails if a listed file does not exist.
 */
import type { ButtonProps } from "@/components/ui/button";
import type { ChipProps } from "@/components/ui/chip";
import type { IconButtonProps } from "@/components/ui/icon-button";
import type { InputProps } from "@/components/ui/input";
import type { PanelProps } from "@/components/ui/panel";
import type { SelectProps } from "@/components/ui/select";
import type { TierIconProps } from "@/components/relay/tier-icon";
import type { TimePillProps } from "@/components/relay/time-pill";

type Keys<P> = readonly (keyof P & string)[];

/**
 * The prop names each entry below is allowed to use, typed against the component's own
 * props: rename or remove a prop and this file stops compiling, which is what stops M11
 * building a Figma variant for something that no longer exists.
 */
export const propKeys = {
  Button: ["variant", "size", "icon", "loading"] satisfies Keys<ButtonProps>,
  IconButton: ["variant", "size"] satisfies Keys<IconButtonProps>,
  Input: ["size", "invalid"] satisfies Keys<InputProps>,
  Select: ["size"] satisfies Keys<SelectProps>,
  Chip: ["tier", "size"] satisfies Keys<ChipProps>,
  TimePill: ["dueAt", "tier", "size"] satisfies Keys<TimePillProps>,
  TierIcon: ["tier", "safety"] satisfies Keys<TierIconProps>,
  Panel: ["tone", "radius"] satisfies Keys<PanelProps>,
} as const;

export interface ComponentEntry {
  name: string;
  file: string;
  /** Prop name → its values. These are the Figma variant properties, one for one. */
  props: Record<string, string>;
  states: string;
}

export const componentIndex: ComponentEntry[] = [
  {
    name: "Button",
    file: "components/ui/button.tsx",
    props: { variant: "primary · secondary · ghost", size: "sm · md · lg", icon: "slot (optional)", loading: "boolean" },
    states: "default · hover · active · focus-visible · disabled · loading",
  },
  {
    name: "IconButton",
    file: "components/ui/icon-button.tsx",
    props: { variant: "ghost · secondary", size: "sm · md · lg" },
    states: "default · hover · active · focus-visible · disabled",
  },
  {
    name: "Input",
    file: "components/ui/input.tsx",
    props: { size: "sm · md · lg", invalid: "boolean" },
    states: "default · hover · focus-visible · disabled · invalid",
  },
  {
    name: "Select",
    file: "components/ui/select.tsx",
    props: { size: "sm · md · lg" },
    states: "default · hover · focus-visible · disabled",
  },
  {
    name: "Chip",
    file: "components/ui/chip.tsx",
    props: { tier: "now · next · later · fyi · success · neutral", size: "sm · md" },
    states: "static",
  },
  {
    name: "TimePill",
    file: "components/relay/time-pill.tsx",
    props: { dueAt: "ISO time (the pill reads late, due in, due at or tomorrow from it)", tier: "now · next · later · fyi", size: "sm · md" },
    states: "static",
  },
  {
    name: "TierIcon",
    file: "components/relay/tier-icon.tsx",
    props: { tier: "now · next · later · fyi", safety: "boolean (now only)" },
    states: "static",
  },
  {
    name: "Kbd",
    file: "components/ui/kbd.tsx",
    props: {},
    states: "static",
  },
  {
    name: "Panel",
    file: "components/ui/panel.tsx",
    props: { tone: "card · inner · raised · overlay", radius: "r-4 · r-5" },
    states: "static",
  },
  {
    name: "SectionBand",
    file: "components/ui/section-band.tsx",
    props: { icon: "slot", label: "text", count: "number" },
    states: "static",
  },
  {
    name: "Toast",
    file: "components/ui/toast.tsx",
    props: { message: "text", detail: "text (optional)", action: "slot" },
    states: "static · entering · leaving",
  },
  {
    name: "Skeleton",
    file: "components/ui/skeleton.tsx",
    props: {},
    states: "static — no shimmer",
  },
  {
    name: "EmptyState",
    file: "components/ui/empty-state.tsx",
    props: { icon: "slot", title: "text", description: "text", action: "slot" },
    states: "static",
  },
  {
    name: "ErrorState",
    file: "components/ui/error-state.tsx",
    props: { title: "text", description: "text", action: "slot" },
    states: "static",
  },
];
