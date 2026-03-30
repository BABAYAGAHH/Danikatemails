import { UserRole } from "@prisma/client";
import { DashboardNavLinks } from "@/components/layout/dashboard-nav-links";
import { MobileNavMenu } from "@/components/layout/mobile-nav-menu";
import { LogoutButton } from "@/features/auth/logout-button";
import { WorkspaceSwitcher } from "@/features/workspace/workspace-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";

export function AppShell({
  currentWorkspaceId,
  workspaceName,
  workspaceSlug,
  workspaces,
  userName,
  userEmail,
  children
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
  children: React.ReactNode;
}) {
  const displayName = userName?.trim() || userEmail;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1480px] gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-80 shrink-0 lg:block">
          <div className="panel sticky top-6 flex min-h-[calc(100vh-3rem)] flex-col p-5">
            <div className="mb-6 rounded-3xl border border-border/70 bg-gradient-to-br from-primary/14 via-background to-accent/20 p-5">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                RegionReach
              </div>
              <div className="mt-3 text-xl font-semibold">{workspaceName}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Compliance-first workspace command center
              </div>
              <Badge className="mt-4" variant="info">
                {workspaceSlug}
              </Badge>
            </div>

            <WorkspaceSwitcher currentWorkspaceId={currentWorkspaceId} workspaces={workspaces} />

            <div className="mb-4 px-2">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Navigation
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Open any workspace area with one click.
              </div>
            </div>

            <DashboardNavLinks />

            <div className="mt-auto rounded-3xl border border-border/70 bg-background/85 px-4 py-4">
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
              <ThemeToggle showLabel={false} />
              <MobileNavMenu
                currentWorkspaceId={currentWorkspaceId}
                userEmail={userEmail}
                userName={userName}
                workspaceName={workspaceName}
                workspaceSlug={workspaceSlug}
                workspaces={workspaces}
              />
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
