import { EmailEventType, SenderStatus } from "@prisma/client";
import { Resend } from "resend";
import { env } from "@/lib/utils/env";
import {
  EmailProvider,
  EmailSendPayload,
  EmailSendResult,
  NormalizedEmailEvent,
  SenderVerificationPayload,
  SenderVerificationResult
} from "@/lib/email/provider";

const resendTypeMap: Record<string, EmailEventType> = {
  "email.sent": EmailEventType.SENT,
  "email.delivered": EmailEventType.DELIVERED,
  "email.opened": EmailEventType.OPENED,
  "email.clicked": EmailEventType.CLICKED,
  "email.bounced": EmailEventType.BOUNCED_HARD,
  "email.complained": EmailEventType.COMPLAINED
};

export class ResendEmailProvider implements EmailProvider {
  name = "resend";
  private client = new Resend(env.RESEND_API_KEY);

  async sendEmail(payload: EmailSendPayload): Promise<EmailSendResult> {
    const result = await this.client.emails.send({
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo ?? undefined,
      tags: Object.entries(payload.metadata ?? {}).map(([name, value]) => ({
        name,
        value: String(value)
      }))
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return {
      accepted: true,
      providerMessageId: result.data?.id ?? crypto.randomUUID(),
      status: "queued"
    };
  }

  async verifySenderIdentity(
    payload: SenderVerificationPayload
  ): Promise<SenderVerificationResult> {
    return {
      status: SenderStatus.PENDING,
      dkimStatus: "pending",
      spfStatus: "pending",
      dmarcStatus: "configure manually",
      providerExternalId: payload.domain
    };
  }

  async parseWebhookEvent(payload: unknown): Promise<NormalizedEmailEvent[]> {
    const body = payload as {
      data?: {
        created_at?: string;
        email_id?: string;
        id?: string;
        to?: string[];
      };
      type?: string;
    };

    const eventType = resendTypeMap[body.type ?? ""];

    if (!eventType) {
      return [];
    }

    return [
      {
        providerEventId: body.data?.id ?? null,
        providerMessageId: body.data?.email_id ?? null,
        email: body.data?.to?.[0] ?? null,
        eventType,
        occurredAt: body.data?.created_at ? new Date(body.data.created_at) : new Date(),
        metadata: {
          provider: "resend"
        }
      }
    ];
  }
}
