import { EmailEventType, Prisma, SenderStatus } from "@prisma/client";

export type EmailSendPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export type EmailSendResult = {
  accepted: boolean;
  providerMessageId: string;
  status: string;
};

export type SenderVerificationPayload = {
  domain: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string | null;
};

export type SenderVerificationResult = {
  status: SenderStatus;
  dkimStatus?: string | null;
  spfStatus?: string | null;
  dmarcStatus?: string | null;
  providerExternalId?: string | null;
};

export type NormalizedEmailEvent = {
  providerEventId?: string | null;
  providerMessageId?: string | null;
  email?: string | null;
  eventType: EmailEventType;
  occurredAt: Date;
  metadata?: Prisma.InputJsonValue;
};

export interface EmailProvider {
  name: string;
  sendEmail(payload: EmailSendPayload): Promise<EmailSendResult>;
  verifySenderIdentity(payload: SenderVerificationPayload): Promise<SenderVerificationResult>;
  parseWebhookEvent(payload: unknown, headers?: Headers): Promise<NormalizedEmailEvent[]>;
  warmupStatus?(): Promise<{ status: string }>;
}
