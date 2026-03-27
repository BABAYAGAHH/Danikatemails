import { EmailEventType, OutreachStatus, Prisma, SenderStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  buildUnsubscribeUrl as buildUnsubscribeUrlValue,
  evaluateCampaignLaunchReadiness,
  evaluateContactEligibility
} from "@/lib/compliance/rules";
import { env } from "@/lib/utils/env";
import { AuditService } from "@/features/audit/audit-service";

export class ComplianceService {
  static evaluateContactEligibility = evaluateContactEligibility;

  static async assertCampaignLaunchReady(input: {
    workspaceId: string;
    actorUserId: string;
    senderStatus: SenderStatus;
    htmlFooter: string;
    textFooter: string;
  }) {
    const workspace = await prisma.workspace.findUniqueOrThrow({
      where: { id: input.workspaceId }
    });

    const readiness = evaluateCampaignLaunchReadiness(workspace, {
      senderStatus: input.senderStatus,
      htmlFooter: input.htmlFooter,
      textFooter: input.textFooter
    });

    if (!readiness.ready) {
      await AuditService.record({
        workspaceId: input.workspaceId,
        actorUserId: input.actorUserId,
        action: "campaign.launch.blocked",
        entityType: "workspace",
        entityId: input.workspaceId,
        metadata: {
          reasons: readiness.reasons
        }
      });
      throw new Error(readiness.reasons.join("; "));
    }
  }

  static async buildUnsubscribeUrl(workspaceId: string, contactId: string) {
    const tokenRecord =
      (await prisma.unsubscribeToken.findFirst({
        where: {
          workspaceId,
          contactId
        },
        orderBy: { createdAt: "desc" }
      })) ??
      (await prisma.unsubscribeToken.create({
        data: {
          workspaceId,
          contactId,
          token: crypto.randomUUID()
        }
      }));

    return buildUnsubscribeUrlValue(env.APP_URL, tokenRecord.token);
  }

  static async suppressEmail(
    workspaceId: string,
    email: string,
    actorUserId?: string | null,
    reason = "Manual suppression",
    source = "app"
  ) {
    const suppression = await prisma.suppressionEntry.upsert({
      where: {
        workspaceId_email: {
          workspaceId,
          email: email.toLowerCase()
        }
      },
      create: {
        workspaceId,
        email: email.toLowerCase(),
        reason,
        source
      },
      update: {
        reason,
        source
      }
    });

    await prisma.contact.updateMany({
      where: {
        workspaceId,
        email: email.toLowerCase()
      },
      data: {
        outreachStatus: OutreachStatus.SUPPRESSED
      }
    });

    await AuditService.record({
      workspaceId,
      actorUserId,
      action: "contact.suppressed",
      entityType: "suppressionEntry",
      entityId: suppression.id,
      metadata: {
        email,
        reason,
        source
      }
    });

    return suppression;
  }

  static async unsubscribeContact(
    workspaceId: string,
    contactId: string,
    actorUserId?: string | null
  ) {
    const existing = await prisma.contact.findFirstOrThrow({
      where: {
        id: contactId,
        workspaceId
      },
      select: {
        id: true,
        email: true
      }
    });

    const contact = await prisma.contact.update({
      where: {
        id: existing.id
      },
      data: {
        outreachStatus: OutreachStatus.UNSUBSCRIBED
      }
    });

    await this.suppressEmail(workspaceId, contact.email, actorUserId, "Unsubscribed", "unsubscribe");

    await AuditService.record({
      workspaceId,
      actorUserId,
      action: "contact.unsubscribed",
      entityType: "contact",
      entityId: contactId,
      metadata: {
        email: contact.email
      }
    });

    return contact;
  }

  static async markHardBounce(
    workspaceId: string,
    contactId: string,
    actorUserId?: string | null,
    metadata?: Record<string, unknown>
  ) {
    const existing = await prisma.contact.findFirstOrThrow({
      where: {
        id: contactId,
        workspaceId
      },
      select: {
        id: true,
        email: true
      }
    });

    const contact = await prisma.contact.update({
      where: { id: existing.id },
      data: {
        outreachStatus: OutreachStatus.BOUNCED_HARD
      }
    });

    await this.suppressEmail(workspaceId, contact.email, actorUserId, "Hard bounce", "webhook");

    await AuditService.record({
      workspaceId,
      actorUserId,
      action: "contact.bounced_hard",
      entityType: "contact",
      entityId: contactId,
      metadata
    });

    return contact;
  }

  static async markComplaint(
    workspaceId: string,
    contactId: string,
    actorUserId?: string | null,
    metadata?: Record<string, unknown>
  ) {
    const existing = await prisma.contact.findFirstOrThrow({
      where: {
        id: contactId,
        workspaceId
      },
      select: {
        id: true,
        email: true
      }
    });

    const contact = await prisma.contact.update({
      where: { id: existing.id },
      data: {
        outreachStatus: OutreachStatus.COMPLAINED
      }
    });

    await this.suppressEmail(workspaceId, contact.email, actorUserId, "Spam complaint", "webhook");

    await AuditService.record({
      workspaceId,
      actorUserId,
      action: "contact.complained",
      entityType: "contact",
      entityId: contactId,
      metadata
    });

    return contact;
  }

  static async createEventFromStatus(
    workspaceId: string,
    outboundEmailId: string,
    campaignId: string | null,
    contactId: string | null,
    eventType: EmailEventType,
    metadata?: Prisma.InputJsonValue
  ) {
    return prisma.emailEvent.create({
      data: {
        workspaceId,
        outboundEmailId,
        campaignId,
        contactId,
        eventType,
        metadata
      }
    });
  }
}
