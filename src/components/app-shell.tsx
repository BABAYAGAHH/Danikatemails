import type { Route } from "next";
import Link from "next/link";
import { BarChart3, BookCopy, FileClock, LayoutDashboard, MailCheck, Map, Settings2, Shield, ShieldOff, Users } from "lucide-react";
import { LogoutButton } from "@/features/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const navigation: Array<{
  href: Route;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
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

export function AppShell({
  workspaceName,
  workspaceSlug,
  userName,
  userEmail,
  children
}: {
  workspaceName: string;
  workspaceSlug: string;
  userName?: string | null;
  userEmail: string;
  children: React.ReactNode;
}) {
  const displayName = userName?.trim() || userEmail;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1480px] gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="panel sticky top-6 flex min-h-[calc(100vh-3rem)] flex-col p-5">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  RegionReach
                </div>
                <div className="mt-2 text-xl font-semibold">{workspaceName}</div>
                <Badge className="mt-3" variant="info">
                  {workspaceSlug}
                </Badge>
              </div>
            </div>

            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    )}
                    href={item.href}
                    key={item.href}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
              <div className="mb-3">
                <div className="truncate text-sm font-medium">{displayName}</div>
                <div className="truncate text-xs text-muted-foreground">{userEmail}</div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <ThemeToggle />
                <LogoutButton />
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="panel mb-6 flex items-center justify-between px-5 py-4 lg:hidden">
            <div>
              <div className="text-sm font-semibold">{workspaceName}</div>
              <div className="truncate text-xs text-muted-foreground">{workspaceSlug}</div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Badge variant="info">{displayName}</Badge>
              <LogoutButton />
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
