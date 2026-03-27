import { PageHeader } from "@/components/page-header";
import { SettingsForm } from "@/features/workspace/settings-form";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";

export default async function SettingsPage() {
  const { workspace } = await resolveWorkspaceMembership();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace Settings"
        title="Settings"
        description="Manage the compliance defaults, sending profile, and postal address for the current workspace."
      />
      <SettingsForm
        initialValues={{
          physicalPostalAddress: workspace.physicalPostalAddress ?? "",
          requireLawfulBasisBeforeSend: workspace.requireLawfulBasisBeforeSend,
          defaultRegionProfile: workspace.defaultRegionProfile
        }}
      />
    </div>
  );
}
