export interface SystemNavItem {
  slug: string;
  label: string;
  href: string;
}

export const systemNav: SystemNavItem[] = [
  { slug: "", label: "Foundations", href: "/system" },
  { slug: "components", label: "Components", href: "/system/components" },
  { slug: "patterns", label: "Patterns", href: "/system/patterns" },
  { slug: "rules", label: "Rules", href: "/system/rules" },
];
