import { LawfulBasis } from "@prisma/client";
import { AlertTriangle, ArrowRightLeft, Mail, MousePointerClick, Users } from "lucide-react";
import Link from "next/link";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { AnalyticsService } from "@/features/analytics/analytics-service";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";
import { prisma } from "@/lib/db/prisma";
import { formatRate } from "@/lib/utils/format";

export default async function DashboardPage() {
  const { workspace } = await resolveWorkspaceMembership();
  const overview = await AnalyticsService.getOverview(workspace.id);
  const [missingLawfulBasis, senderIdentities] = await Promise.all([
    prisma.contact.count({
      where: {
        workspaceId: workspace.id,
        lawfulBasis: LawfulBasis.NOT_SET
      }
    }),
    prisma.senderIdentity.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: "desc" },
      take: 4
    })
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace Overview"
        title="Dashboard"
        description="Monitor contacts, campaigns, sender verification, and compliance flags across the current workspace."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard helper="Public business contacts stored" icon={<Users className="h-4 w-4 text-muted-foreground" />} label="Total contacts" value={overview.totalContacts} />
        <MetricCard helper="Currently running or scheduled" icon={<Mail className="h-4 w-4 text-muted-foreground" />} label="Active campaigns" value={overview.activeCampaigns} />
        <MetricCard helper={`Delivery rate ${formatRate(overview.delivered === 0 ? 0 : overview.delivered / Math.max(overview.emailsSent, 1))}`} icon={<ArrowRightLeft className="h-4 w-4 text-muted-foreground" />} label="Emails sent" value={overview.emailsSent} />
        <MetricCard helper={`Bounce rate ${formatRate(overview.bounceRate)}`} icon={<MousePointerClick className="h-4 w-4 text-muted-foreground" />} label="Click rate" value={formatRate(overview.clickRate)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Recent campaigns</h2>
              <p className="text-sm text-muted-foreground">Latest launch and status activity</p>
            </div>
            <Link className="text-sm font-medium text-primary" href="/dashboard/campaigns">
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/70">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Eligible</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentCampaigns.map((campaign) => (
                  <tr className="border-t border-border/60" key={campaign.id}>
                    <td className="px-4 py-3 font-medium">{campaign.name}</td>
                    <td className="px-4 py-3">{campaign.template.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={campaign.status} />
                    </td>
                    <td className="px-4 py-3">{campaign.eligibleRecipients}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Compliance alerts</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-2xl border border-border/70 px-4 py-3">
                <div className="font-medium">{missingLawfulBasis} contacts need lawful basis</div>
                <div className="mt-1 text-muted-foreground">These contacts will be blocked if workspace enforcement is enabled.</div>
              </div>
              <div className="rounded-2xl border border-border/70 px-4 py-3">
                <div className="font-medium">{overview.suppressedContacts} contacts are suppressed</div>
                <div className="mt-1 text-muted-foreground">Suppressed, unsubscribed, complained, or hard-bounced contacts are excluded automatically.</div>
              </div>
            </div>
          </div>

          <div className="panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Sender verification</h2>
                <p className="text-sm text-muted-foreground">Verified identities ready for launch</p>
              </div>
              <Link className="text-sm font-medium text-primary" href="/dashboard/senders">
                Manage
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {senderIdentities.map((sender) => (
                <div className="rounded-2xl border border-border/70 px-4 py-3" key={sender.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{sender.fromName}</div>
                      <div className="text-xs text-muted-foreground">{sender.fromEmail}</div>
                    </div>
                    <StatusBadge value={sender.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
