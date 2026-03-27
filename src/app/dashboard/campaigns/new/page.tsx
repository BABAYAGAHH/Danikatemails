import { PageHeader } from "@/components/page-header";
import { CampaignForm } from "@/features/campaigns/campaign-form";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";
import { prisma } from "@/lib/db/prisma";

export default async function CampaignNewPage() {
  const { workspace } = await resolveWorkspaceMembership();
  const [senders, templates, segments] = await Promise.all([
    prisma.senderIdentity.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.template.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.segment.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Campaign Wizard"
        title="New Campaign"
        description="Select a verified sender, choose a segment and template, add the compliance footer, and save the draft."
      />
      <CampaignForm
        segments={segments.map((segment) => ({ id: segment.id, name: segment.name }))}
        senders={senders.map((sender) => ({
          id: sender.id,
          fromName: sender.fromName,
          fromEmail: sender.fromEmail
        }))}
        templates={templates.map((template) => ({ id: template.id, name: template.name }))}
        workspaceAddress={workspace.physicalPostalAddress ?? "Postal address required"}
      />
    </div>
  );
}
