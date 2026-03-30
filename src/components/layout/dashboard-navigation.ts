import type { Route } from "next";
import {
  BarChart3,
  BookCopy,
  FileClock,
  LayoutDashboard,
  MailCheck,
  Map,
  Settings2,
  Shield,
  ShieldOff,
  Users,
  type LucideIcon
} from "lucide-react";

export type DashboardNavigationItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
};

export const dashboardNavigation: DashboardNavigationItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/imports", label: "Imports", icon: FileClock },
  { href: "/dashboard/segments", label: "Segments", icon: Map },
  { href: "/dashboard/templates", label: "Templates", icon: BookCopy },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: MailCheck },
  { href: "/dashboard/senders", label: "Senders", icon: Shield },
  { href: "/dashboard/suppression", label: "Suppression", icon: ShieldOff },
  { href: "/dashboard/audit", label: "Audit", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings2 }
];
