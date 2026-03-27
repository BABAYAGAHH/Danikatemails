import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { CampaignService } from "@/features/campaigns/campaign-service";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";

export default async function CampaignsPage() {
  const { workspace } = await resolveWorkspaceMembership();
  const campaigns = await CampaignService.list(workspace.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Outbound Programs"
        title="Campaigns"
        description="Review drafts, scheduled sends, active runs, and final analytics for every workspace campaign."
        action={
          <Link className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="/dashboard/campaigns/new">
            New campaign
          </Link>
        }
      />

      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <Link className="panel block p-5 transition hover:border-primary/40" href={`/dashboard/campaigns/${campaign.id}`} key={campaign.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-semibold">{campaign.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {campaign.template.name} • {campaign.senderIdentity.fromEmail}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Eligible {campaign.eligibleRecipients} / Blocked {campaign.blockedRecipients}
                </div>
                <StatusBadge value={campaign.status} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
