-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MARKETER', 'VIEWER');
CREATE TYPE "LawfulBasis" AS ENUM ('CONSENT', 'LEGITIMATE_INTEREST', 'EXISTING_CUSTOMER', 'NOT_SET');
CREATE TYPE "ConsentStatus" AS ENUM ('GRANTED', 'DENIED', 'UNKNOWN', 'OBJECTED');
CREATE TYPE "OutreachStatus" AS ENUM ('ACTIVE', 'UNSUBSCRIBED', 'SUPPRESSED', 'BOUNCED_HARD', 'COMPLAINED', 'INVALID');
CREATE TYPE "RegionProfile" AS ENUM ('US', 'UK', 'EU', 'OTHER');
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED');
CREATE TYPE "ContactType" AS ENUM ('GENERIC_INBOX', 'ROLE_INBOX', 'NAMED_BUSINESS_CONTACT');
CREATE TYPE "SourceType" AS ENUM ('CSV_IMPORT', 'MANUAL', 'PUBLIC_WEBSITE', 'REFERRAL', 'API');
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "EmailEventType" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED_SOFT', 'BOUNCED_HARD', 'COMPLAINED', 'UNSUBSCRIBED', 'REPLIED');
CREATE TYPE "SenderStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'DISABLED');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Workspace" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "physicalPostalAddress" TEXT,
  "requireLawfulBasisBeforeSend" BOOLEAN NOT NULL DEFAULT true,
  "defaultRegionProfile" "RegionProfile" NOT NULL DEFAULT 'OTHER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkspaceMember" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Company" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "domain" TEXT,
  "website" TEXT,
  "industry" TEXT,
  "employeeRange" TEXT,
  "country" TEXT,
  "region" TEXT,
  "city" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Contact" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "companyId" TEXT,
  "firstName" TEXT,
  "lastName" TEXT,
  "fullName" TEXT NOT NULL DEFAULT '',
  "jobTitle" TEXT,
  "email" TEXT NOT NULL,
  "contactType" "ContactType" NOT NULL,
  "sourceType" "SourceType" NOT NULL,
  "sourceUrl" TEXT,
  "sourceNote" TEXT,
  "lawfulBasis" "LawfulBasis" NOT NULL DEFAULT 'NOT_SET',
  "consentStatus" "ConsentStatus" NOT NULL DEFAULT 'UNKNOWN',
  "outreachStatus" "OutreachStatus" NOT NULL DEFAULT 'ACTIVE',
  "regionProfile" "RegionProfile" NOT NULL DEFAULT 'OTHER',
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "lastContactedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactImport" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "totalRows" INTEGER NOT NULL,
  "importedRows" INTEGER NOT NULL,
  "skippedRows" INTEGER NOT NULL,
  "duplicateRows" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactImport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SenderIdentity" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "fromName" TEXT NOT NULL,
  "fromEmail" TEXT NOT NULL,
  "replyToEmail" TEXT,
  "domain" TEXT NOT NULL,
  "status" "SenderStatus" NOT NULL DEFAULT 'PENDING',
  "dkimStatus" TEXT,
  "spfStatus" TEXT,
  "dmarcStatus" TEXT,
  "provider" TEXT NOT NULL,
  "providerExternalId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SenderIdentity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Template" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "previewText" TEXT,
  "htmlContent" TEXT NOT NULL,
  "textContent" TEXT NOT NULL,
  "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TemplateVersion" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "versionNumber" INTEGER NOT NULL,
  "subject" TEXT NOT NULL,
  "previewText" TEXT,
  "htmlContent" TEXT NOT NULL,
  "textContent" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TemplateVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Segment" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "filterJson" JSONB NOT NULL,
  "contactCountCache" INTEGER NOT NULL DEFAULT 0,
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Campaign" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "senderIdentityId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "segmentId" TEXT,
  "subjectOverride" TEXT,
  "previewTextOverride" TEXT,
  "htmlFooter" TEXT NOT NULL,
  "textFooter" TEXT NOT NULL,
  "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "scheduledAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "maxPerMinute" INTEGER NOT NULL DEFAULT 20,
  "maxPerHour" INTEGER NOT NULL DEFAULT 200,
  "maxPerDay" INTEGER NOT NULL DEFAULT 1000,
  "eligibleRecipients" INTEGER NOT NULL DEFAULT 0,
  "blockedRecipients" INTEGER NOT NULL DEFAULT 0,
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CampaignRecipient" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "blockedReason" TEXT,
  "personalizationJson" JSONB,
  "lastEventAt" TIMESTAMP(3),
  CONSTRAINT "CampaignRecipient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OutboundEmail" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "campaignId" TEXT,
  "recipientContactId" TEXT,
  "senderIdentityId" TEXT NOT NULL,
  "toEmail" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "providerMessageId" TEXT,
  "status" TEXT NOT NULL,
  "queuedAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OutboundEmail_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailEvent" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "outboundEmailId" TEXT NOT NULL,
  "campaignId" TEXT,
  "contactId" TEXT,
  "eventType" "EmailEventType" NOT NULL,
  "providerEventId" TEXT,
  "metadata" JSONB,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SuppressionEntry" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SuppressionEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UnsubscribeToken" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "UnsubscribeToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebhookEvent" (
  "id" TEXT NOT NULL,
  "workspaceId" TEXT,
  "provider" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "rawPayload" JSONB NOT NULL,
  "processed" BOOLEAN NOT NULL DEFAULT false,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");
CREATE UNIQUE INDEX "Contact_workspaceId_email_key" ON "Contact"("workspaceId", "email");
CREATE UNIQUE INDEX "TemplateVersion_templateId_versionNumber_key" ON "TemplateVersion"("templateId", "versionNumber");
CREATE UNIQUE INDEX "CampaignRecipient_campaignId_contactId_key" ON "CampaignRecipient"("campaignId", "contactId");
CREATE UNIQUE INDEX "SuppressionEntry_workspaceId_email_key" ON "SuppressionEntry"("workspaceId", "email");
CREATE UNIQUE INDEX "UnsubscribeToken_token_key" ON "UnsubscribeToken"("token");

CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");
CREATE INDEX "WorkspaceMember_workspaceId_role_idx" ON "WorkspaceMember"("workspaceId", "role");
CREATE INDEX "Company_workspaceId_idx" ON "Company"("workspaceId");
CREATE INDEX "Company_workspaceId_domain_idx" ON "Company"("workspaceId", "domain");
CREATE INDEX "Company_workspaceId_country_idx" ON "Company"("workspaceId", "country");
CREATE INDEX "Company_workspaceId_region_idx" ON "Company"("workspaceId", "region");
CREATE INDEX "Company_workspaceId_city_idx" ON "Company"("workspaceId", "city");
CREATE INDEX "Contact_workspaceId_outreachStatus_idx" ON "Contact"("workspaceId", "outreachStatus");
CREATE INDEX "Contact_workspaceId_regionProfile_idx" ON "Contact"("workspaceId", "regionProfile");
CREATE INDEX "Contact_workspaceId_lawfulBasis_idx" ON "Contact"("workspaceId", "lawfulBasis");
CREATE INDEX "Contact_workspaceId_consentStatus_idx" ON "Contact"("workspaceId", "consentStatus");
CREATE INDEX "Contact_workspaceId_updatedAt_idx" ON "Contact"("workspaceId", "updatedAt");
CREATE INDEX "ContactImport_workspaceId_createdAt_idx" ON "ContactImport"("workspaceId", "createdAt");
CREATE INDEX "ContactImport_workspaceId_status_idx" ON "ContactImport"("workspaceId", "status");
CREATE INDEX "SenderIdentity_workspaceId_domain_status_idx" ON "SenderIdentity"("workspaceId", "domain", "status");
CREATE INDEX "Template_workspaceId_status_idx" ON "Template"("workspaceId", "status");
CREATE INDEX "Template_workspaceId_updatedAt_idx" ON "Template"("workspaceId", "updatedAt");
CREATE INDEX "TemplateVersion_templateId_createdAt_idx" ON "TemplateVersion"("templateId", "createdAt");
CREATE INDEX "Segment_workspaceId_updatedAt_idx" ON "Segment"("workspaceId", "updatedAt");
CREATE INDEX "Campaign_workspaceId_status_updatedAt_idx" ON "Campaign"("workspaceId", "status", "updatedAt");
CREATE INDEX "Campaign_workspaceId_scheduledAt_idx" ON "Campaign"("workspaceId", "scheduledAt");
CREATE INDEX "CampaignRecipient_campaignId_contactId_status_idx" ON "CampaignRecipient"("campaignId", "contactId", "status");
CREATE INDEX "OutboundEmail_workspaceId_campaignId_toEmail_idx" ON "OutboundEmail"("workspaceId", "campaignId", "toEmail");
CREATE INDEX "OutboundEmail_providerMessageId_idx" ON "OutboundEmail"("providerMessageId");
CREATE INDEX "EmailEvent_workspaceId_outboundEmailId_eventType_idx" ON "EmailEvent"("workspaceId", "outboundEmailId", "eventType");
CREATE INDEX "EmailEvent_workspaceId_occurredAt_idx" ON "EmailEvent"("workspaceId", "occurredAt");
CREATE INDEX "SuppressionEntry_workspaceId_createdAt_idx" ON "SuppressionEntry"("workspaceId", "createdAt");
CREATE INDEX "UnsubscribeToken_workspaceId_contactId_idx" ON "UnsubscribeToken"("workspaceId", "contactId");
CREATE INDEX "AuditLog_workspaceId_entityType_entityId_createdAt_idx" ON "AuditLog"("workspaceId", "entityType", "entityId", "createdAt");
CREATE INDEX "WebhookEvent_provider_eventType_createdAt_idx" ON "WebhookEvent"("provider", "eventType", "createdAt");
CREATE INDEX "WebhookEvent_workspaceId_processed_idx" ON "WebhookEvent"("workspaceId", "processed");

ALTER TABLE "WorkspaceMember"
  ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WorkspaceMember"
  ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Company"
  ADD CONSTRAINT "Company_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contact"
  ADD CONSTRAINT "Contact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contact"
  ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ContactImport"
  ADD CONSTRAINT "ContactImport_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContactImport"
  ADD CONSTRAINT "ContactImport_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SenderIdentity"
  ADD CONSTRAINT "SenderIdentity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Template"
  ADD CONSTRAINT "Template_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Template"
  ADD CONSTRAINT "Template_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TemplateVersion"
  ADD CONSTRAINT "TemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TemplateVersion"
  ADD CONSTRAINT "TemplateVersion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Segment"
  ADD CONSTRAINT "Segment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Segment"
  ADD CONSTRAINT "Segment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Campaign"
  ADD CONSTRAINT "Campaign_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Campaign"
  ADD CONSTRAINT "Campaign_senderIdentityId_fkey" FOREIGN KEY ("senderIdentityId") REFERENCES "SenderIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Campaign"
  ADD CONSTRAINT "Campaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Campaign"
  ADD CONSTRAINT "Campaign_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Campaign"
  ADD CONSTRAINT "Campaign_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CampaignRecipient"
  ADD CONSTRAINT "CampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CampaignRecipient"
  ADD CONSTRAINT "CampaignRecipient_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OutboundEmail"
  ADD CONSTRAINT "OutboundEmail_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OutboundEmail"
  ADD CONSTRAINT "OutboundEmail_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OutboundEmail"
  ADD CONSTRAINT "OutboundEmail_recipientContactId_fkey" FOREIGN KEY ("recipientContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OutboundEmail"
  ADD CONSTRAINT "OutboundEmail_senderIdentityId_fkey" FOREIGN KEY ("senderIdentityId") REFERENCES "SenderIdentity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmailEvent"
  ADD CONSTRAINT "EmailEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmailEvent"
  ADD CONSTRAINT "EmailEvent_outboundEmailId_fkey" FOREIGN KEY ("outboundEmailId") REFERENCES "OutboundEmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EmailEvent"
  ADD CONSTRAINT "EmailEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailEvent"
  ADD CONSTRAINT "EmailEvent_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SuppressionEntry"
  ADD CONSTRAINT "SuppressionEntry_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UnsubscribeToken"
  ADD CONSTRAINT "UnsubscribeToken_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UnsubscribeToken"
  ADD CONSTRAINT "UnsubscribeToken_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WebhookEvent"
  ADD CONSTRAINT "WebhookEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
