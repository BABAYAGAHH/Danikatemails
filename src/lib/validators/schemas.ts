import {
  CampaignStatus,
  ConsentStatus,
  ContactType,
  LawfulBasis,
  OutreachStatus,
  RegionProfile,
  SenderStatus,
  SourceType,
  TemplateStatus,
  UserRole
} from "@prisma/client";
import { z } from "zod";

export const workspaceCreateSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  physicalPostalAddress: z.string().min(8).max(500),
  requireLawfulBasisBeforeSend: z.boolean().default(true),
  defaultRegionProfile: z.nativeEnum(RegionProfile).default(RegionProfile.OTHER)
});

export const workspaceSettingsSchema = z.object({
  physicalPostalAddress: z.string().min(8).max(500),
  requireLawfulBasisBeforeSend: z.boolean(),
  defaultRegionProfile: z.nativeEnum(RegionProfile)
});

export const contactSchema = z.object({
  companyName: z.string().min(1).max(160),
  domain: z.string().max(255).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  country: z.string().max(120).optional().or(z.literal("")),
  stateRegion: z.string().max(120).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  industry: z.string().max(120).optional().or(z.literal("")),
  employeeRange: z.string().max(64).optional().or(z.literal("")),
  firstName: z.string().max(120).optional().or(z.literal("")),
  lastName: z.string().max(120).optional().or(z.literal("")),
  jobTitle: z.string().max(160).optional().or(z.literal("")),
  email: z.string().email(),
  contactType: z.nativeEnum(ContactType).default(ContactType.NAMED_BUSINESS_CONTACT),
  sourceType: z.nativeEnum(SourceType).default(SourceType.MANUAL),
  sourceUrl: z.string().url().optional().or(z.literal("")),
  sourceNote: z.string().max(500).optional().or(z.literal("")),
  lawfulBasis: z.nativeEnum(LawfulBasis).default(LawfulBasis.NOT_SET),
  consentStatus: z.nativeEnum(ConsentStatus).default(ConsentStatus.UNKNOWN),
  outreachStatus: z.nativeEnum(OutreachStatus).default(OutreachStatus.ACTIVE),
  regionProfile: z.nativeEnum(RegionProfile).default(RegionProfile.OTHER),
  tags: z.array(z.string().min(1).max(50)).default([])
});

export const contactFiltersSchema = z.object({
  search: z.string().optional(),
  regionProfile: z.array(z.nativeEnum(RegionProfile)).optional(),
  lawfulBasis: z.array(z.nativeEnum(LawfulBasis)).optional(),
  consentStatus: z.array(z.nativeEnum(ConsentStatus)).optional(),
  outreachStatus: z.array(z.nativeEnum(OutreachStatus)).optional(),
  industries: z.array(z.string()).optional(),
  employeeRanges: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

export const bulkContactActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("tag"),
    contactIds: z.array(z.string().min(1)).min(1),
    tags: z.array(z.string().min(1)).min(1)
  }),
  z.object({
    action: z.literal("suppress"),
    contactIds: z.array(z.string().min(1)).min(1),
    reason: z.string().min(2).max(200).default("Manual suppression")
  })
]);

export const segmentFilterSchema = z.object({
  regionProfile: z.array(z.nativeEnum(RegionProfile)).optional(),
  countries: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  employeeRanges: z.array(z.string()).optional(),
  lawfulBasis: z.array(z.nativeEnum(LawfulBasis)).optional(),
  consentStatus: z.array(z.nativeEnum(ConsentStatus)).optional(),
  outreachStatuses: z.array(z.nativeEnum(OutreachStatus)).optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional()
});

export const segmentSchema = z.object({
  name: z.string().min(2).max(120),
  filterJson: segmentFilterSchema
});

export const templateSchema = z.object({
  name: z.string().min(2).max(120),
  subject: z.string().min(2).max(200),
  previewText: z.string().max(200).optional().or(z.literal("")),
  htmlContent: z.string().min(10),
  textContent: z.string().min(10),
  status: z.nativeEnum(TemplateStatus).default(TemplateStatus.DRAFT)
});

export const senderIdentitySchema = z.object({
  fromName: z.string().min(2).max(120),
  fromEmail: z.string().email(),
  replyToEmail: z.string().email().optional().or(z.literal("")),
  domain: z.string().min(3).max(255),
  provider: z.string().min(2).max(50).default("mock"),
  status: z.nativeEnum(SenderStatus).optional()
});

export const campaignSchema = z.object({
  name: z.string().min(2).max(120),
  senderIdentityId: z.string().min(1),
  templateId: z.string().min(1),
  segmentId: z.string().optional().or(z.literal("")),
  subjectOverride: z.string().max(200).optional().or(z.literal("")),
  previewTextOverride: z.string().max(200).optional().or(z.literal("")),
  htmlFooter: z.string().min(10),
  textFooter: z.string().min(10),
  scheduledAt: z.string().datetime().optional().or(z.literal("")),
  maxPerMinute: z.number().int().min(1).max(500).default(20),
  maxPerHour: z.number().int().min(1).max(10_000).default(200),
  maxPerDay: z.number().int().min(1).max(100_000).default(1000)
});

export const campaignStatusUpdateSchema = z.object({
  status: z.nativeEnum(CampaignStatus)
});

export const csvPreviewSchema = z.object({
  fileName: z.string().min(1),
  csvContent: z.string().min(1),
  preview: z.boolean().default(false),
  mapping: z.record(z.string()).optional(),
  tags: z.array(z.string()).default([])
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRole).default(UserRole.MARKETER)
});
