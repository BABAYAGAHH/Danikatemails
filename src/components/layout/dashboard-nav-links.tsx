"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavigation } from "@/components/layout/dashboard-navigation";
import { cn } from "@/lib/utils/cn";

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNavLinks({
  onNavigate
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {dashboardNavigation.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
              active && "bg-primary/10 text-foreground ring-1 ring-primary/20"
            )}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            <Icon className={cn("h-4 w-4", active && "text-primary")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
