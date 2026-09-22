import { ListChecks, Users, Bell, Search, type LucideIcon } from "lucide-react";
import { copy } from "@/lib/copy";

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Not built yet — noted with the phase that lands it (plan §10 build order). */
  stub?: string;
}

export const appNav: AppNavItem[] = [
  { href: "/work", label: copy.nav.work, icon: ListChecks },
  { href: "/team", label: copy.nav.team, icon: Users, stub: "Phase 5" },
  { href: "/updates", label: copy.nav.updates, icon: Bell, stub: "Phase 5" },
  { href: "/lookup", label: copy.nav.lookup, icon: Search },
];
