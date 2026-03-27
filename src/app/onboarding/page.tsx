import { redirect } from "next/navigation";
import { WorkspaceCreateForm } from "@/features/workspace/workspace-create-form";
import { requireUser } from "@/lib/auth/session";
import { WorkspaceService } from "@/features/workspace/workspace-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OnboardingPage() {
  const user = await requireUser();
  const workspaces = await WorkspaceService.listForUser(user.id);

  if (workspaces.length > 0) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
      <div className="w-full">
        <div className="mb-8 max-w-2xl">
          <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Onboarding</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Create your first workspace</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Start with the workspace profile and compliance defaults. You can add sender identities, templates, and contacts once this is in place.
          </p>
        </div>
        <WorkspaceCreateForm />
      </div>
    </main>
  );
}
