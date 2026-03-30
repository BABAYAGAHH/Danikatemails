"use client";

import { UserRole } from "@prisma/client";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            type="button"
          />
          <div
            className="fixed inset-y-0 right-0 z-50 flex w-[min(88vw,24rem)] flex-col border-l border-border/70 bg-background/95 px-4 py-4 shadow-2xl"
            id="mobile-dashboard-nav"
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/70 pb-4">
              <div className="min-w-0">
                <div className="truncate text-base font-semibold">{workspaceName}</div>
                <div className="truncate text-xs text-muted-foreground">{workspaceSlug}</div>
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

            <div className="overflow-y-auto pb-4">
              <WorkspaceSwitcher currentWorkspaceId={currentWorkspaceId} workspaces={workspaces} />
              <DashboardNavLinks onNavigate={() => setOpen(false)} />
            </div>

            <div className="mt-auto rounded-2xl border border-border/70 bg-background/80 p-4">
              <div className="mb-3">
                <div className="truncate text-sm font-medium">{displayName}</div>
                <div className="truncate text-xs text-muted-foreground">{userEmail}</div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <ThemeToggle showLabel={false} />
                <LogoutButton className="flex-1" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
