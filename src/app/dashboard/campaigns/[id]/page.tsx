import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { CampaignActionButtons } from "@/features/campaigns/campaign-action-buttons";
import { CampaignService } from "@/features/campaigns/campaign-service";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";

export default async function CampaignDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { workspace } = await resolveWorkspaceMembership();
  const { id } = await params;
  const campaign = await CampaignService.getById(workspace.id, id);

  if (!campaign) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Campaign Detail"
        title={campaign.name}
        description={`${campaign.template.name} • ${campaign.senderIdentity.fromEmail}`}
        action={<CampaignActionButtons campaignId={campaign.id} status={campaign.status} />}
      />

      <div className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="text-lg font-semibold">Review</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd><StatusBadge value={campaign.status} /></dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Eligible recipients</dt>
                <dd>{campaign.eligibleRecipients}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Blocked recipients</dt>
                <dd>{campaign.blockedRecipients}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Analytics events</dt>
                <dd>{Object.values(campaign.analytics).reduce((sum, count) => sum + count, 0)}</dd>
              </div>
            </dl>
          </div>

          <div className="panel p-6">
            <h2 className="text-lg font-semibold">Event counts</h2>
            <div className="mt-4 space-y-3 text-sm">
              {Object.entries(campaign.analytics).map(([key, count]) => (
                <div className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3" key={key}>
                  <span>{key.replace(/_/g, " ").toLowerCase()}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Blocked reason</th>
              </tr>
            </thead>
            <tbody>
              {campaign.recipients.map((recipient) => (
                <tr className="border-t border-border/60" key={recipient.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{recipient.contact.fullName || recipient.email}</div>
                    <div className="text-xs text-muted-foreground">{recipient.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={recipient.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{recipient.blockedReason ?? "Eligible"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
