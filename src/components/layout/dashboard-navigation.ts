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
  description: string;
  icon: LucideIcon;
};

export const dashboardNavigation: DashboardNavigationItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    description: "Monitor KPIs, sender health, and compliance alerts across the active workspace.",
    icon: LayoutDashboard
  },
  {
    href: "/dashboard/contacts",
    label: "Contacts",
    description: "Review business contacts, filter lead data, and manage compliant outreach records.",
    icon: Users
  },
  {
    href: "/dashboard/imports",
    label: "Imports",
    description: "Validate CSV uploads, review duplicate rows, and track import history.",
    icon: FileClock
  },
  {
    href: "/dashboard/segments",
    label: "Segments",
    description: "Define saved lead filters by region, industry, and compliance eligibility.",
    icon: Map
  },
  {
    href: "/dashboard/templates",
    label: "Templates",
    description: "Create and maintain reusable outreach templates with compliant content blocks.",
    icon: BookCopy
  },
  {
    href: "/dashboard/campaigns",
    label: "Campaigns",
    description: "Prepare compliant email campaigns, review eligibility, and monitor status.",
    icon: MailCheck
  },
  {
    href: "/dashboard/senders",
    label: "Senders",
    description: "Manage verified sender identities and review domain authentication status.",
    icon: Shield
  },
  {
    href: "/dashboard/suppression",
    label: "Suppression",
    description: "Protect sends by excluding unsubscribed, bounced, and complained contacts.",
    icon: ShieldOff
  },
  {
    href: "/dashboard/audit",
    label: "Audit",
    description: "Trace compliance actions, operational changes, and team activity.",
    icon: BarChart3
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    description: "Update workspace defaults, postal details, and compliance enforcement policies.",
    icon: Settings2
  }
];

export function isActiveDashboardPath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getCurrentDashboardNavigation(pathname: string | null): DashboardNavigationItem {
  if (!pathname) {
    return dashboardNavigation[0]!;
  }

  return (
    dashboardNavigation.find((item) => isActiveDashboardPath(pathname, item.href)) ??
    dashboardNavigation[0]!
  );
}
