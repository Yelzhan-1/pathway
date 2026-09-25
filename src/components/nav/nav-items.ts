import {
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Map,
  User,
  type LucideIcon,
} from "lucide-react";

import { strings } from "@/lib/strings";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: strings.nav.dashboard, icon: LayoutDashboard },
  { href: "/profile", label: strings.nav.profile, icon: User },
  { href: "/cv", label: strings.nav.cv, icon: FileText },
  { href: "/universities", label: strings.nav.universities, icon: GraduationCap },
  { href: "/roadmap", label: strings.nav.roadmap, icon: Map },
  { href: "/tasks", label: strings.nav.tasks, icon: ClipboardList },
];
