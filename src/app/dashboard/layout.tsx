import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth/session";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";
import { WorkspaceService } from "@/features/workspace/workspace-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const memberships = await WorkspaceService.listForUser(user.id);

  if (memberships.length === 0) {
    redirect("/onboarding");
  }

  const { workspace } = await resolveWorkspaceMembership(memberships[0]?.workspaceId);

  return (
    <AppShell
      userEmail={user.email}
      userName={user.name}
      workspaceName={workspace.name}
      workspaceSlug={workspace.slug}
    >
      {children}
    </AppShell>
  );
}
