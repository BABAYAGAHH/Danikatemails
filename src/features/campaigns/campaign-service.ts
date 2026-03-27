import {
  CampaignStatus,
  EmailEventType,
  Prisma
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { campaignSchema } from "@/lib/validators/schemas";
import { AuditService } from "@/features/audit/audit-service";
import { ComplianceService } from "@/features/compliance/compliance-service";
import { SegmentService } from "@/features/segments/segment-service";
import { enqueueCampaignRecipientJob } from "@/lib/queue/campaign-queue";
import { getEmailProvider } from "@/lib/email";

function throttleSpacingMs(campaign: {
  maxPerMinute: number;
  maxPerHour: number;
  maxPerDay: number;
}) {
  return Math.max(
    Math.ceil(60_000 / campaign.maxPerMinute),
    Math.ceil(3_600_000 / campaign.maxPerHour),
    Math.ceil(86_400_000 / campaign.maxPerDay)
  );
}

export class CampaignService {
  static async list(workspaceId: string) {
    return prisma.campaign.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      include: {
        senderIdentity: true,
        template: true,
        segment: true
      }
    });
  }

  static async getById(workspaceId: string, campaignId: string) {
    const campaign = await prisma.campaign.findFirst({
      where: {
        workspaceId,
        id: campaignId
      },
      include: {
        senderIdentity: true,
        template: true,
        segment: true,
        recipients: {
          include: {
            contact: {
              include: {
                company: true
              }
            }
          },
          orderBy: {
            lastEventAt: "desc"
          }
        },
        outboundEmails: {
          orderBy: {
            createdAt: "desc"
          },
          take: 100
        }
      }
    });

    if (!campaign) {
      return null;
    }

    const events = await prisma.emailEvent.groupBy({
      by: ["eventType"],
      where: {
        workspaceId,
        campaignId
      },
      _count: {
        _all: true
      }
    });

    return {
      ...campaign,
      analytics: events.reduce<Record<string, number>>((accumulator, event) => {
        accumulator[event.eventType] = event._count._all;
        return accumulator;
      }, {})
    };
  }

  static async create(workspaceId: string, userId: string, payload: unknown) {
    const data = campaignSchema.parse(payload);

    const campaign = await prisma.campaign.create({
      data: {
        workspaceId,
        createdByUserId: userId,
        name: data.name,
        senderIdentityId: data.senderIdentityId,
        templateId: data.templateId,
        segmentId: data.segmentId || null,
        subjectOverride: data.subjectOverride || null,
        previewTextOverride: data.previewTextOverride || null,
        htmlFooter: data.htmlFooter,
        textFooter: data.textFooter,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        maxPerMinute: data.maxPerMinute,
        maxPerHour: data.maxPerHour,
        maxPerDay: data.maxPerDay
      }
    });

    await AuditService.record({
      workspaceId,
      actorUserId: userId,
      action: "campaign.created",
      entityType: "campaign",
      entityId: campaign.id
    });

    return campaign;
  }

  static async launch(workspaceId: string, campaignId: string, userId: string) {
    const campaign = await prisma.campaign.findFirstOrThrow({
      where: {
        workspaceId,
        id: campaignId
      },
      include: {
        workspace: true,
        senderIdentity: true,
        template: true,
        segment: true
      }
    });

    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new Error("Only draft campaigns can be launched");
    }

    await ComplianceService.assertCampaignLaunchReady({
      workspaceId,
      actorUserId: userId,
      senderStatus: campaign.senderIdentity.status,
      htmlFooter: campaign.htmlFooter,
      textFooter: campaign.textFooter
    });

    const contacts = await SegmentService.resolveContacts(workspaceId, campaign.segmentId);
    const spacingMs = throttleSpacingMs(campaign);
    const startDelay =
      campaign.scheduledAt && campaign.scheduledAt.getTime() > Date.now()
        ? campaign.scheduledAt.getTime() - Date.now()
        : 0;

    const jobs = [] as Array<{
      recipientId: string;
      outboundEmailId: string;
      delayMs: number;
    }>;

    let eligibleRecipients = 0;
    let blockedRecipients = 0;

    await prisma.$transaction(async (tx) => {
      for (const [index, contact] of contacts.entries()) {
        const eligibility = ComplianceService.evaluateContactEligibility(contact, campaign.workspace);
        const unsubscribeUrl = await ComplianceService.buildUnsubscribeUrl(workspaceId, contact.id);

        const recipient = await tx.campaignRecipient.create({
          data: {
            campaignId: campaign.id,
            contactId: contact.id,
            email: contact.email,
            status: eligibility.eligible ? "queued" : "blocked",
            blockedReason: eligibility.eligible ? null : eligibility.reasons.join("; "),
            personalizationJson: {
              firstName: contact.firstName,
              lastName: contact.lastName,
              companyName: contact.company?.name ?? "",
              industry: contact.company?.industry ?? "",
              city: contact.company?.city ?? "",
              region: contact.regionProfile,
              senderName: campaign.senderIdentity.fromName,
              workspaceName: campaign.workspace.name,
              unsubscribeUrl
            }
          }
        });

        if (!eligibility.eligible) {
          blockedRecipients += 1;
          continue;
        }

        eligibleRecipients += 1;

        const outboundEmail = await tx.outboundEmail.create({
          data: {
            workspaceId,
            campaignId: campaign.id,
            recipientContactId: contact.id,
            senderIdentityId: campaign.senderIdentityId,
            toEmail: contact.email,
            subject: campaign.subjectOverride || campaign.template.subject,
            status: EmailEventType.QUEUED,
            queuedAt: new Date()
          }
        });

        await tx.emailEvent.create({
          data: {
            workspaceId,
            outboundEmailId: outboundEmail.id,
            campaignId: campaign.id,
            contactId: contact.id,
            eventType: EmailEventType.QUEUED,
            metadata: {
              provider: getEmailProvider().name
            }
          }
        });

        jobs.push({
          recipientId: recipient.id,
          outboundEmailId: outboundEmail.id,
          delayMs: startDelay + index * spacingMs
        });
      }

      await tx.campaign.update({
        where: { id: campaign.id },
        data: {
          status:
            campaign.scheduledAt && campaign.scheduledAt.getTime() > Date.now()
              ? CampaignStatus.SCHEDULED
              : CampaignStatus.RUNNING,
          startedAt:
            campaign.scheduledAt && campaign.scheduledAt.getTime() > Date.now()
              ? null
              : new Date(),
          eligibleRecipients,
          blockedRecipients
        }
      });
    });

    await Promise.all(
      jobs.map((job, index) =>
        enqueueCampaignRecipientJob(
          {
            campaignId: campaign.id,
            workspaceId,
            recipientId: job.recipientId,
            outboundEmailId: job.outboundEmailId,
            delayIndex: index
          },
          job.delayMs
        )
      )
    );

    await AuditService.record({
      workspaceId,
      actorUserId: userId,
      action: "campaign.launched",
      entityType: "campaign",
      entityId: campaign.id,
      metadata: {
        eligibleRecipients,
        blockedRecipients
      }
    });

    return {
      campaignId: campaign.id,
      eligibleRecipients,
      blockedRecipients
    };
  }

  static async pause(workspaceId: string, campaignId: string, userId: string) {
    await prisma.campaign.findFirstOrThrow({
      where: {
        id: campaignId,
        workspaceId
      },
      select: {
        id: true
      }
    });

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.PAUSED
      }
    });

    await AuditService.record({
      workspaceId,
      actorUserId: userId,
      action: "campaign.paused",
      entityType: "campaign",
      entityId: campaignId
    });

    return campaign;
  }

  static async cancel(workspaceId: string, campaignId: string, userId: string) {
    await prisma.campaign.findFirstOrThrow({
      where: {
        id: campaignId,
        workspaceId
      },
      select: {
        id: true
      }
    });

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.CANCELLED,
        completedAt: new Date()
      }
    });

    await AuditService.record({
      workspaceId,
      actorUserId: userId,
      action: "campaign.cancelled",
      entityType: "campaign",
      entityId: campaignId
    });

    return campaign;
  }

  static async ingestProviderWebhook(rawPayload: unknown, headers?: Headers) {
    const provider = getEmailProvider();
    const webhook = await prisma.webhookEvent.create({
      data: {
        provider: provider.name,
        eventType: "email.webhook",
        rawPayload: rawPayload as Prisma.InputJsonValue,
        processed: false
      }
    });

    const events = await provider.parseWebhookEvent(rawPayload, headers);

    for (const event of events) {
      if (!event.providerMessageId && !event.email) {
        continue;
      }

      const outboundEmail = await prisma.outboundEmail.findFirst({
        where: {
          OR: [
            ...(event.providerMessageId
              ? [{ providerMessageId: event.providerMessageId }]
              : []),
            ...(event.email ? [{ toEmail: event.email.toLowerCase() }] : [])
          ]
        },
        include: {
          recipientContact: true,
          campaign: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });

      if (!outboundEmail) {
        continue;
      }

      await prisma.emailEvent.create({
        data: {
          workspaceId: outboundEmail.workspaceId,
          outboundEmailId: outboundEmail.id,
          campaignId: outboundEmail.campaignId,
          contactId: outboundEmail.recipientContactId,
          eventType: event.eventType,
          providerEventId: event.providerEventId ?? null,
          metadata: event.metadata as Prisma.InputJsonValue | undefined,
          occurredAt: event.occurredAt
        }
      });

      await prisma.outboundEmail.update({
        where: {
          id: outboundEmail.id
        },
        data: {
          status: event.eventType,
          deliveredAt:
            event.eventType === EmailEventType.DELIVERED ? event.occurredAt : undefined,
          failedAt:
            event.eventType === EmailEventType.BOUNCED_HARD ? event.occurredAt : undefined
        }
      });

      if (outboundEmail.campaignId && outboundEmail.recipientContactId) {
        await prisma.campaignRecipient.updateMany({
          where: {
            campaignId: outboundEmail.campaignId,
            contactId: outboundEmail.recipientContactId
          },
          data: {
            status: event.eventType.toLowerCase(),
            lastEventAt: event.occurredAt
          }
        });
      }

      if (
        outboundEmail.recipientContactId &&
        event.eventType === EmailEventType.BOUNCED_HARD
      ) {
        await ComplianceService.markHardBounce(
          outboundEmail.workspaceId,
          outboundEmail.recipientContactId,
          null,
          event.metadata as Record<string, unknown> | undefined
        );
      }

      if (outboundEmail.recipientContactId && event.eventType === EmailEventType.COMPLAINED) {
        await ComplianceService.markComplaint(
          outboundEmail.workspaceId,
          outboundEmail.recipientContactId,
          null,
          event.metadata as Record<string, unknown> | undefined
        );
      }

      if (
        outboundEmail.recipientContactId &&
        event.eventType === EmailEventType.UNSUBSCRIBED
      ) {
        await ComplianceService.unsubscribeContact(
          outboundEmail.workspaceId,
          outboundEmail.recipientContactId,
          null
        );
      }
    }

    await prisma.webhookEvent.update({
      where: { id: webhook.id },
      data: {
        processed: true,
        processedAt: new Date()
      }
    });

    return {
      processed: events.length
    };
  }
}
