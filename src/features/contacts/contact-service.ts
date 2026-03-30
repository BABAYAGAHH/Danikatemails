import { parse } from "csv-parse/sync";
import {
  ConsentStatus,
  ContactType,
  LawfulBasis,
  OutreachStatus,
  Prisma,
  RegionProfile,
  SourceType
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  bulkContactActionSchema,
  contactFiltersSchema,
  contactSchema,
  csvPreviewSchema
} from "@/lib/validators/schemas";
import { normalizeEmail } from "@/lib/utils/slugify";
import { AuditService } from "@/features/audit/audit-service";
import { ComplianceService } from "@/features/compliance/compliance-service";
import { SegmentService } from "@/features/segments/segment-service";

function buildFullName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function emptyToNull(value?: string | null) {
  return value && value.trim() ? value.trim() : null;
}

function inferMapping(headers: string[]) {
  const normalized = headers.map((header) => ({
    source: header,
    normalized: header.toLowerCase().replace(/[^a-z0-9]+/g, "")
  }));

  const aliases: Record<string, string[]> = {
    companyName: ["company", "companyname", "account"],
    domain: ["domain"],
    website: ["website", "url"],
    country: ["country"],
    stateRegion: ["state", "region", "stateregion"],
    city: ["city"],
    industry: ["industry"],
    employeeRange: ["employees", "employeerange", "companysize"],
    firstName: ["firstname", "first"],
    lastName: ["lastname", "last"],
    jobTitle: ["jobtitle", "title", "role"],
    email: ["email", "workemail"],
    sourceUrl: ["sourceurl", "urlsource"],
    sourceNote: ["sourcenote", "notes", "note"]
  };

  return Object.fromEntries(
    Object.entries(aliases)
      .map(([field, keys]) => {
        const match = normalized.find((item) => keys.includes(item.normalized));
        return match ? [field, match.source] : null;
      })
      .filter(Boolean) as Array<[string, string]>
  );
}

export class ContactService {
  static async ensureUniqueEmail(workspaceId: string, email: string, contactId?: string) {
    const normalizedEmail = normalizeEmail(email);
    const existing = await prisma.contact.findFirst({
      where: {
        workspaceId,
        email: normalizedEmail,
        ...(contactId ? { NOT: { id: contactId } } : {})
      }
    });

    if (existing) {
      throw new Error("A contact with this email already exists in the workspace");
    }

    return normalizedEmail;
  }

  static async upsertCompany(
    workspaceId: string,
    data: {
      companyName: string;
      domain?: string | null;
      website?: string | null;
      industry?: string | null;
      employeeRange?: string | null;
      country?: string | null;
      stateRegion?: string | null;
      city?: string | null;
    }
  ) {
    const domain = emptyToNull(data.domain)?.toLowerCase() ?? null;

    const existing = await prisma.company.findFirst({
      where: {
        workspaceId,
        OR: [
          ...(domain ? [{ domain }] : []),
          {
            name: {
              equals: data.companyName.trim(),
              mode: "insensitive"
            }
          }
        ]
      }
    });

    if (existing) {
      return prisma.company.update({
        where: { id: existing.id },
        data: {
          domain: domain ?? existing.domain,
          website: emptyToNull(data.website) ?? existing.website,
          industry: emptyToNull(data.industry) ?? existing.industry,
          employeeRange: emptyToNull(data.employeeRange) ?? existing.employeeRange,
          country: emptyToNull(data.country) ?? existing.country,
          region: emptyToNull(data.stateRegion) ?? existing.region,
          city: emptyToNull(data.city) ?? existing.city
        }
      });
    }

    return prisma.company.create({
      data: {
        workspaceId,
        name: data.companyName.trim(),
        domain,
        website: emptyToNull(data.website),
        industry: emptyToNull(data.industry),
        employeeRange: emptyToNull(data.employeeRange),
        country: emptyToNull(data.country),
        region: emptyToNull(data.stateRegion),
        city: emptyToNull(data.city)
      }
    });
  }

  static async list(workspaceId: string, rawFilters?: unknown) {
    const filters = contactFiltersSchema.parse(rawFilters ?? {});

    return prisma.contact.findMany({
      where: SegmentService.buildContactWhere(workspaceId, filters),
      include: {
        company: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
  }

  static async getById(workspaceId: string, contactId: string) {
    return prisma.contact.findFirst({
      where: {
        workspaceId,
        id: contactId
      },
      include: {
        company: true,
        recipients: {
          include: {
            campaign: true
          },
          orderBy: {
            lastEventAt: "desc"
          }
        },
        emailEvents: {
          orderBy: {
            occurredAt: "desc"
          },
          take: 50
        }
      }
    });
  }

  static async create(workspaceId: string, userId: string, payload: unknown) {
    const data = contactSchema.parse(payload);
    const email = await this.ensureUniqueEmail(workspaceId, data.email);
    const company = await this.upsertCompany(workspaceId, data);

    const contact = await prisma.contact.create({
      data: {
        workspaceId,
        companyId: company.id,
        firstName: emptyToNull(data.firstName),
        lastName: emptyToNull(data.lastName),
        fullName: buildFullName(data.firstName, data.lastName),
        jobTitle: emptyToNull(data.jobTitle),
        email,
        contactType: data.contactType,
        sourceType: data.sourceType,
        sourceUrl: emptyToNull(data.sourceUrl),
        sourceNote: emptyToNull(data.sourceNote),
        lawfulBasis: data.lawfulBasis,
        consentStatus: data.consentStatus,
        outreachStatus: data.outreachStatus,
        regionProfile: data.regionProfile,
        tags: data.tags
      },
      include: {
        company: true
      }
    });

    await AuditService.record({
      workspaceId,
      actorUserId: userId,
      action: "contact.created",
      entityType: "contact",
      entityId: contact.id,
      metadata: {
        email: contact.email
      }
    });

    return contact;
  }

  static async update(workspaceId: string, contactId: string, userId: string, payload: unknown) {
    await prisma.contact.findFirstOrThrow({
      where: {
        id: contactId,
        workspaceId
      },
      select: {
        id: true
      }
    });

    const data = contactSchema.parse(payload);
    const email = await this.ensureUniqueEmail(workspaceId, data.email, contactId);
    const company = await this.upsertCompany(workspaceId, data);

    const contact = await prisma.contact.update({
      where: {
        id: contactId
      },
      data: {
        companyId: company.id,
        firstName: emptyToNull(data.firstName),
        lastName: emptyToNull(data.lastName),
        fullName: buildFullName(data.firstName, data.lastName),
        jobTitle: emptyToNull(data.jobTitle),
        email,
        contactType: data.contactType,
        sourceType: data.sourceType,
        sourceUrl: emptyToNull(data.sourceUrl),
        sourceNote: emptyToNull(data.sourceNote),
        lawfulBasis: data.lawfulBasis,
        consentStatus: data.consentStatus,
        outreachStatus: data.outreachStatus,
        regionProfile: data.regionProfile,
        tags: data.tags
      }
    });

    await AuditService.record({
      workspaceId,
      actorUserId: userId,
      action: "contact.updated",
      entityType: "contact",
      entityId: contactId,
      metadata: {
        email
      }
    });

    return contact;
  }

  static async delete(workspaceId: string, contactId: string, userId: string) {
    const contact = await prisma.contact.findFirstOrThrow({
      where: {
        id: contactId,
        workspaceId
      },
      select: {
        id: true,
        email: true,
        fullName: true
      }
    });

    await prisma.contact.delete({
      where: {
        id: contact.id
      }
    });

    await AuditService.record({
      workspaceId,
      actorUserId: userId,
      action: "contact.deleted",
      entityType: "contact",
      entityId: contact.id,
      metadata: {
        email: contact.email,
        fullName: contact.fullName
      }
    });

    return contact;
  }

  static async applyBulkAction(workspaceId: string, userId: string, payload: unknown) {
    const action = bulkContactActionSchema.parse(payload);
    const contacts = await prisma.contact.findMany({
      where: {
        workspaceId,
        id: {
          in: action.contactIds
        }
      }
    });

    if (action.action === "tag") {
      await Promise.all(
        contacts.map((contact) =>
          prisma.contact.update({
            where: { id: contact.id },
            data: {
              tags: Array.from(new Set([...contact.tags, ...action.tags]))
            }
          })
        )
      );

      await AuditService.record({
        workspaceId,
        actorUserId: userId,
        action: "contact.bulk_tagged",
        entityType: "contact",
        entityId: contacts.map((contact) => contact.id).join(","),
        metadata: {
          tags: action.tags
        }
      });

      return { updated: contacts.length };
    }

    await Promise.all(
      contacts.map((contact) =>
        ComplianceService.suppressEmail(
          workspaceId,
          contact.email,
          userId,
          action.reason,
          "bulk-action"
        )
      )
    );

    return { updated: contacts.length };
  }

  static previewCsvImport(payload: unknown) {
    const data = csvPreviewSchema.parse(payload);
    const rows = parse(data.csvContent, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as Array<Record<string, string>>;

    const headers = Object.keys(rows[0] ?? {});
    const inferredMapping = inferMapping(headers);

    return {
      fileName: data.fileName,
      detectedColumns: headers,
      inferredMapping,
      previewRows: rows.slice(0, 5),
      totalRows: rows.length
    };
  }

  static async importCsv(workspaceId: string, userId: string, payload: unknown) {
    const data = csvPreviewSchema.parse(payload);

    if (!data.mapping?.email || !data.mapping?.companyName) {
      throw new Error("CSV import requires mapped email and company name columns");
    }

    const rows = parse(data.csvContent, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as Array<Record<string, string>>;

    const existingContacts = await prisma.contact.findMany({
      where: { workspaceId },
      select: { email: true }
    });

    const existingEmails = new Set(existingContacts.map((contact) => normalizeEmail(contact.email)));
    const seenEmails = new Set<string>();

    let importedRows = 0;
    let skippedRows = 0;
    let duplicateRows = 0;

    for (const row of rows) {
      const mapped = {
        companyName: row[data.mapping.companyName] ?? "",
        domain: row[data.mapping.domain ?? ""] ?? "",
        website: row[data.mapping.website ?? ""] ?? "",
        country: row[data.mapping.country ?? ""] ?? "",
        stateRegion: row[data.mapping.stateRegion ?? ""] ?? "",
        city: row[data.mapping.city ?? ""] ?? "",
        industry: row[data.mapping.industry ?? ""] ?? "",
        employeeRange: row[data.mapping.employeeRange ?? ""] ?? "",
        firstName: row[data.mapping.firstName ?? ""] ?? "",
        lastName: row[data.mapping.lastName ?? ""] ?? "",
        jobTitle: row[data.mapping.jobTitle ?? ""] ?? "",
        email: row[data.mapping.email] ?? "",
        contactType: ContactType.NAMED_BUSINESS_CONTACT,
        sourceType: SourceType.CSV_IMPORT,
        sourceUrl: row[data.mapping.sourceUrl ?? ""] ?? "",
        sourceNote: row[data.mapping.sourceNote ?? ""] ?? data.fileName,
        lawfulBasis: LawfulBasis.NOT_SET,
        consentStatus: ConsentStatus.UNKNOWN,
        outreachStatus: OutreachStatus.ACTIVE,
        regionProfile: RegionProfile.OTHER,
        tags: data.tags
      };

      const parsed = contactSchema.safeParse(mapped);

      if (!parsed.success) {
        skippedRows += 1;
        continue;
      }

      const email = normalizeEmail(parsed.data.email);

      if (existingEmails.has(email) || seenEmails.has(email)) {
        duplicateRows += 1;
        continue;
      }

      seenEmails.add(email);
      await this.create(workspaceId, userId, parsed.data);
      importedRows += 1;
    }

    const importLog = await prisma.contactImport.create({
      data: {
        workspaceId,
        fileName: data.fileName,
        totalRows: rows.length,
        importedRows,
        skippedRows,
        duplicateRows,
        status: "COMPLETED",
        createdByUserId: userId
      }
    });

    await AuditService.record({
      workspaceId,
      actorUserId: userId,
      action: "contact.imported",
      entityType: "contactImport",
      entityId: importLog.id,
      metadata: {
        importedRows,
        skippedRows,
        duplicateRows
      }
    });

    return {
      importId: importLog.id,
      importedRows,
      skippedRows,
      duplicateRows,
      totalRows: rows.length
    };
  }
}
