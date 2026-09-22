import { ListChecks, Users, Bell, Search, type LucideIcon } from "lucide-react";
import { copy } from "@/lib/copy";

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const appNav: AppNavItem[] = [
  { href: "/work", label: copy.nav.work, icon: ListChecks },
  { href: "/team", label: copy.nav.team, icon: Users },
  { href: "/updates", label: copy.nav.updates, icon: Bell },
  { href: "/lookup", label: copy.nav.lookup, icon: Search },
];
