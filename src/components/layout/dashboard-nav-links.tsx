"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardNavigation, isActiveDashboardPath } from "@/components/layout/dashboard-navigation";
import { cn } from "@/lib/utils/cn";

export function DashboardNavLinks({
  onNavigate,
  variant = "sidebar"
}: {
  onNavigate?: () => void;
  variant?: "sidebar" | "mobile";
}) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";

  return (
    <nav className={cn("space-y-2", isMobile && "space-y-3")}>
      {dashboardNavigation.map((item) => {
        const Icon = item.icon;
        const active = isActiveDashboardPath(pathname, item.href);

        return (
          <Link
            className={cn(
              "group transition",
              isMobile
                ? "flex items-start gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-foreground shadow-sm hover:border-primary/25 hover:bg-muted/70"
                : "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
              active &&
                (isMobile
                  ? "border-primary/30 bg-primary/10 ring-1 ring-primary/20"
                  : "bg-primary/10 text-foreground ring-1 ring-primary/20")
            )}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            {isMobile ? (
              <>
                <span
                  className={cn(
                    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition group-hover:text-foreground",
                    active && "bg-primary/15 text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </>
            ) : (
              <>
                <Icon className={cn("h-4 w-4", active && "text-primary")} />
                {item.label}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
