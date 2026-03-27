import { CampaignStatus, EmailEventType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getEmailProvider } from "@/lib/email";
import { TemplateService } from "@/features/templates/template-service";
import { ComplianceService } from "@/features/compliance/compliance-service";

export class EmailDispatchService {
  static async dispatchRecipient(input: {
    campaignId: string;
    workspaceId: string;
    recipientId: string;
    outboundEmailId: string;
  }) {
    const outboundEmail = await prisma.outboundEmail.findFirstOrThrow({
      where: {
        id: input.outboundEmailId,
        workspaceId: input.workspaceId
      },
      include: {
        workspace: true,
        campaign: {
          include: {
            template: true,
            senderIdentity: true
          }
        },
        recipientContact: {
          include: {
            company: true
          }
        },
        senderIdentity: true
      }
    });

    if (!outboundEmail.campaign || !outboundEmail.recipientContact) {
      throw new Error("Outbound email is missing campaign or contact context");
    }

    if (
      outboundEmail.campaign.status === CampaignStatus.PAUSED ||
      outboundEmail.campaign.status === CampaignStatus.CANCELLED
    ) {
      await prisma.outboundEmail.update({
        where: { id: outboundEmail.id },
        data: {
          status: outboundEmail.campaign.status
        }
      });

      return {
        skipped: true,
        reason: outboundEmail.campaign.status
      };
    }

    const eligibility = ComplianceService.evaluateContactEligibility(
      outboundEmail.recipientContact,
      outboundEmail.workspace
    );

    if (!eligibility.eligible) {
      await prisma.outboundEmail.update({
        where: { id: outboundEmail.id },
        data: {
          status: "BLOCKED",
          failedAt: new Date()
        }
      });

      await prisma.campaignRecipient.update({
        where: { id: input.recipientId },
        data: {
          status: "blocked",
          blockedReason: eligibility.reasons.join("; "),
          lastEventAt: new Date()
        }
      });

      return {
        skipped: true,
        reason: eligibility.reasons.join("; ")
      };
    }

    const unsubscribeUrl = await ComplianceService.buildUnsubscribeUrl(
      input.workspaceId,
      outboundEmail.recipientContact.id
    );

    const variables = {
      firstName: outboundEmail.recipientContact.firstName ?? "",
      lastName: outboundEmail.recipientContact.lastName ?? "",
      companyName: outboundEmail.recipientContact.company?.name ?? "",
      industry: outboundEmail.recipientContact.company?.industry ?? "",
      city: outboundEmail.recipientContact.company?.city ?? "",
      region: outboundEmail.recipientContact.regionProfile,
      senderName: outboundEmail.senderIdentity.fromName,
      workspaceName: outboundEmail.workspace.name,
      unsubscribeUrl
    };

    const subject = TemplateService.render(
      outboundEmail.campaign.subjectOverride || outboundEmail.campaign.template.subject,
      variables
    );
    const html = TemplateService.render(
      `${outboundEmail.campaign.template.htmlContent}\n${outboundEmail.campaign.htmlFooter}`,
      variables
    );
    const text = TemplateService.render(
      `${outboundEmail.campaign.template.textContent}\n${outboundEmail.campaign.textFooter}`,
      variables
    );

    const provider = getEmailProvider();
    const result = await provider.sendEmail({
      from: `${outboundEmail.senderIdentity.fromName} <${outboundEmail.senderIdentity.fromEmail}>`,
      to: outboundEmail.toEmail,
      subject,
      html,
      text,
      replyTo: outboundEmail.senderIdentity.replyToEmail,
      metadata: {
        campaignId: outboundEmail.campaignId ?? "",
        outboundEmailId: outboundEmail.id,
        contactId: outboundEmail.recipientContact.id
      }
    });

    await prisma.outboundEmail.update({
      where: { id: outboundEmail.id },
      data: {
        providerMessageId: result.providerMessageId,
        status: EmailEventType.SENT,
        sentAt: new Date()
      }
    });

    await prisma.contact.update({
      where: { id: outboundEmail.recipientContact.id },
      data: {
        lastContactedAt: new Date()
      }
    });

    await prisma.campaignRecipient.update({
      where: { id: input.recipientId },
      data: {
        status: "sent",
        lastEventAt: new Date()
      }
    });

    await ComplianceService.createEventFromStatus(
      input.workspaceId,
      outboundEmail.id,
      outboundEmail.campaignId,
      outboundEmail.recipientContact.id,
      EmailEventType.SENT,
      {
        provider: provider.name,
        providerMessageId: result.providerMessageId
      }
    );

    if (outboundEmail.campaign.status === CampaignStatus.SCHEDULED) {
      await prisma.campaign.update({
        where: { id: outboundEmail.campaign.id },
        data: {
          status: CampaignStatus.RUNNING,
          startedAt: new Date()
        }
      });
    }

    return result;
  }
}
