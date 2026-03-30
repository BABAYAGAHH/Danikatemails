"use client";

import { UserRole } from "@prisma/client";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentDashboardNavigation } from "@/components/layout/dashboard-navigation";
import { DashboardNavLinks } from "@/components/layout/dashboard-nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/features/auth/logout-button";
import { WorkspaceSwitcher } from "@/features/workspace/workspace-switcher";

export function MobileNavMenu({
  currentWorkspaceId,
  workspaceName,
  workspaceSlug,
  workspaces,
  userName,
  userEmail
}: {
  currentWorkspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  workspaces: Array<{
    workspaceId: string;
    name: string;
    slug: string;
    role: UserRole;
  }>;
  userName?: string | null;
  userEmail: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const displayName = userName?.trim() || userEmail;
  const currentPage = getCurrentDashboardNavigation(pathname);
  const CurrentPageIcon = currentPage.icon;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <>
      <Button
        aria-controls="mobile-dashboard-nav"
        aria-expanded={open}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpen((current) => !current)}
        size="icon"
        type="button"
        variant="outline"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {open ? (
        <div className="lg:hidden">
          <button
            aria-label="Close navigation menu"
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md"
            onClick={() => setOpen(false)}
            type="button"
          />
          <aside
            className="fixed inset-0 z-50 flex flex-col bg-background/98 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] shadow-2xl"
            id="mobile-dashboard-nav"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  RegionReach
                </div>
                <div className="mt-2 truncate text-lg font-semibold">{workspaceName}</div>
                <div className="truncate text-sm text-muted-foreground">{workspaceSlug}</div>
                <Badge className="mt-3" variant="info">
                  Active workspace
                </Badge>
              </div>
              <Button
                aria-label="Close navigation menu"
                onClick={() => setOpen(false)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-4 rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-background to-accent/20 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Current page
              </div>
              <div className="mt-3 flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <CurrentPageIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-base font-semibold">{currentPage.label}</div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {currentPage.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pb-4">
              {workspaces.length > 1 ? (
                <WorkspaceSwitcher currentWorkspaceId={currentWorkspaceId} workspaces={workspaces} />
              ) : (
                <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Workspace
                  </div>
                  <div className="mt-2 text-sm font-medium">{workspaceName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{workspaceSlug}</div>
                </div>
              )}

              <div className="rounded-3xl border border-border/70 bg-background/75 p-3">
                <div className="px-2 pb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Navigation
                </div>
                <DashboardNavLinks onNavigate={() => setOpen(false)} variant="mobile" />
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/85 p-4">
              <div className="mb-3">
                <div className="truncate text-sm font-medium">{displayName}</div>
                <div className="truncate text-xs text-muted-foreground">{userEmail}</div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <ThemeToggle className="shrink-0" showLabel={false} />
                <LogoutButton className="flex-1" />
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
