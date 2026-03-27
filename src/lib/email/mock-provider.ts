import { EmailEventType, SenderStatus } from "@prisma/client";
import {
  EmailProvider,
  EmailSendPayload,
  EmailSendResult,
  NormalizedEmailEvent,
  SenderVerificationPayload,
  SenderVerificationResult
} from "@/lib/email/provider";

export class MockEmailProvider implements EmailProvider {
  name = "mock";

  async sendEmail(_payload: EmailSendPayload): Promise<EmailSendResult> {
    return {
      accepted: true,
      providerMessageId: `mock-${crypto.randomUUID()}`,
      status: "queued"
    };
  }

  async verifySenderIdentity(
    payload: SenderVerificationPayload
  ): Promise<SenderVerificationResult> {
    return {
      status: SenderStatus.VERIFIED,
      dkimStatus: "verified",
      spfStatus: "verified",
      dmarcStatus: "monitoring",
      providerExternalId: `${payload.domain}-mock`
    };
  }

  async parseWebhookEvent(payload: unknown): Promise<NormalizedEmailEvent[]> {
    const rows = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { events?: unknown[] })?.events)
        ? (payload as { events: unknown[] }).events
        : [payload];

    return rows.flatMap((row) => {
      if (!row || typeof row !== "object") {
        return [];
      }

      const event = row as {
        id?: string;
        messageId?: string;
        email?: string;
        type?: string;
        occurredAt?: string;
      };

      const mapping: Record<string, EmailEventType> = {
        queued: EmailEventType.QUEUED,
        sent: EmailEventType.SENT,
        delivered: EmailEventType.DELIVERED,
        opened: EmailEventType.OPENED,
        clicked: EmailEventType.CLICKED,
        bounced_soft: EmailEventType.BOUNCED_SOFT,
        bounced_hard: EmailEventType.BOUNCED_HARD,
        complained: EmailEventType.COMPLAINED,
        unsubscribed: EmailEventType.UNSUBSCRIBED,
        replied: EmailEventType.REPLIED
      };

      const eventType = mapping[event.type ?? ""];

      if (!eventType) {
        return [];
      }

      return [
        {
          providerEventId: event.id ?? null,
          providerMessageId: event.messageId ?? null,
          email: event.email ?? null,
          eventType,
          occurredAt: event.occurredAt ? new Date(event.occurredAt) : new Date(),
          metadata: {
            provider: "mock"
          }
        }
      ];
    });
  }
}
