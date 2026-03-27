import {
  ConsentStatus,
  LawfulBasis,
  OutreachStatus,
  SenderStatus
} from "@prisma/client";

export type EligibilityContactSnapshot = {
  email: string;
  lawfulBasis: LawfulBasis;
  consentStatus: ConsentStatus;
  outreachStatus: OutreachStatus;
};

export type WorkspaceComplianceSnapshot = {
  requireLawfulBasisBeforeSend: boolean;
  physicalPostalAddress?: string | null;
};

export type CampaignComplianceSnapshot = {
  htmlFooter: string;
  textFooter: string;
  senderStatus: SenderStatus;
};

const blockedStatuses = new Set<OutreachStatus>([
  OutreachStatus.UNSUBSCRIBED,
  OutreachStatus.SUPPRESSED,
  OutreachStatus.BOUNCED_HARD,
  OutreachStatus.COMPLAINED,
  OutreachStatus.INVALID
]);

export function evaluateContactEligibility(
  contact: EligibilityContactSnapshot,
  workspaceSettings: WorkspaceComplianceSnapshot
) {
  const reasons: string[] = [];

  if (blockedStatuses.has(contact.outreachStatus)) {
    reasons.push(`Outreach blocked: ${contact.outreachStatus.toLowerCase()}`);
  }

  if (
    workspaceSettings.requireLawfulBasisBeforeSend &&
    contact.lawfulBasis === LawfulBasis.NOT_SET
  ) {
    reasons.push("Lawful basis required before send");
  }

  if (
    contact.consentStatus === ConsentStatus.DENIED ||
    contact.consentStatus === ConsentStatus.OBJECTED
  ) {
    reasons.push(`Consent status blocks outreach: ${contact.consentStatus.toLowerCase()}`);
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
}

export function evaluateCampaignLaunchReadiness(
  workspaceSettings: WorkspaceComplianceSnapshot,
  campaign: CampaignComplianceSnapshot
) {
  const reasons: string[] = [];

  if (!workspaceSettings.physicalPostalAddress?.trim()) {
    reasons.push("Workspace physical postal address is required");
  }

  const footerBundle = `${campaign.htmlFooter}\n${campaign.textFooter}`.toLowerCase();

  if (!footerBundle.includes("unsubscribe")) {
    reasons.push("Campaign footer must include unsubscribe copy");
  }

  if (campaign.senderStatus !== SenderStatus.VERIFIED) {
    reasons.push("Sender identity must be verified");
  }

  return {
    ready: reasons.length === 0,
    reasons
  };
}

export function buildUnsubscribeUrl(baseUrl: string, token: string) {
  return `${baseUrl.replace(/\/$/, "")}/api/unsubscribe/${token}`;
}
