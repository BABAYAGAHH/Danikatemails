import {
  CampaignStatus,
  EmailEventType,
  OutreachStatus
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getWorkspaceOverview(workspaceId: string) {
  const [
    totalContacts,
    eligibleContacts,
    suppressedContacts,
    activeCampaigns,
    events,
    recentCampaigns,
    topRegions,
    topIndustries
  ] = await Promise.all([
    prisma.contact.count({
      where: { workspaceId }
    }),
    prisma.contact.count({
      where: {
        workspaceId,
        outreachStatus: OutreachStatus.ACTIVE
      }
    }),
    prisma.contact.count({
      where: {
        workspaceId,
        outreachStatus: {
          in: [
            OutreachStatus.SUPPRESSED,
            OutreachStatus.UNSUBSCRIBED,
            OutreachStatus.BOUNCED_HARD,
            OutreachStatus.COMPLAINED,
            OutreachStatus.INVALID
          ]
        }
      }
    }),
    prisma.campaign.count({
      where: {
        workspaceId,
        status: {
          in: [CampaignStatus.RUNNING, CampaignStatus.SCHEDULED]
        }
      }
    }),
    prisma.emailEvent.groupBy({
      by: ["eventType"],
      where: {
        workspaceId
      },
      _count: {
        _all: true
      }
    }),
    prisma.campaign.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        senderIdentity: true,
        template: true
      }
    }),
    prisma.$queryRaw<Array<{ label: string; count: number }>>`
      SELECT COALESCE("country", 'Unknown') AS label, COUNT(*)::int AS count
      FROM "Company"
      WHERE "workspaceId" = ${workspaceId}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 5
    `,
    prisma.$queryRaw<Array<{ label: string; count: number }>>`
      SELECT COALESCE("industry", 'Unknown') AS label, COUNT(*)::int AS count
      FROM "Company"
      WHERE "workspaceId" = ${workspaceId}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT 5
    `
  ]);

  const counts = new Map<EmailEventType, number>();

  for (const event of events) {
    counts.set(event.eventType, event._count._all);
  }

  const sent = counts.get(EmailEventType.SENT) ?? 0;
  const delivered = counts.get(EmailEventType.DELIVERED) ?? 0;
  const opened = counts.get(EmailEventType.OPENED) ?? 0;
  const clicked = counts.get(EmailEventType.CLICKED) ?? 0;
  const bounced =
    (counts.get(EmailEventType.BOUNCED_SOFT) ?? 0) + (counts.get(EmailEventType.BOUNCED_HARD) ?? 0);
  const unsubscribed = counts.get(EmailEventType.UNSUBSCRIBED) ?? 0;

  return {
    totalContacts,
    eligibleContacts,
    suppressedContacts,
    activeCampaigns,
    emailsSent: sent,
    delivered,
    openRate: delivered === 0 ? 0 : opened / delivered,
    clickRate: delivered === 0 ? 0 : clicked / delivered,
    bounceRate: sent === 0 ? 0 : bounced / sent,
    unsubscribeRate: delivered === 0 ? 0 : unsubscribed / delivered,
    recentCampaigns,
    topRegions,
    topIndustries
  };
}
