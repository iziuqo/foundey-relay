export interface SystemNavItem {
  slug: string;
  label: string;
  href: string;
  /** Not built yet — Patterns and Rules land in Phase 7 (plan §10). */
  stub?: boolean;
}

export const systemNav: SystemNavItem[] = [
  { slug: "", label: "Foundations", href: "/system" },
  { slug: "components", label: "Components", href: "/system/components" },
  { slug: "patterns", label: "Patterns", href: "/system/patterns", stub: true },
  { slug: "rules", label: "Rules", href: "/system/rules", stub: true },
];
