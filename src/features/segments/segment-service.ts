import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { segmentFilterSchema, segmentSchema } from "@/lib/validators/schemas";
import { AuditService } from "@/features/audit/audit-service";

type SegmentFilterInput = Prisma.JsonValue;

export class SegmentService {
  static buildContactWhere(workspaceId: string, rawFilter: SegmentFilterInput): Prisma.ContactWhereInput {
    const filter = segmentFilterSchema.parse(rawFilter);
    const andConditions: Prisma.ContactWhereInput[] = [{ workspaceId }];

    if (filter.regionProfile?.length) {
      andConditions.push({
        regionProfile: {
          in: filter.regionProfile
        }
      });
    }

    if (filter.lawfulBasis?.length) {
      andConditions.push({
        lawfulBasis: {
          in: filter.lawfulBasis
        }
      });
    }

    if (filter.consentStatus?.length) {
      andConditions.push({
        consentStatus: {
          in: filter.consentStatus
        }
      });
    }

    if (filter.outreachStatuses?.length) {
      andConditions.push({
        outreachStatus: {
          in: filter.outreachStatuses
        }
      });
    }

    if (filter.tags?.length) {
      andConditions.push({
        tags: {
          hasSome: filter.tags
        }
      });
    }

    const companyConditions: Prisma.CompanyWhereInput = {};

    if (filter.countries?.length) {
      companyConditions.country = { in: filter.countries };
    }

    if (filter.regions?.length) {
      companyConditions.region = { in: filter.regions };
    }

    if (filter.industries?.length) {
      companyConditions.industry = { in: filter.industries };
    }

    if (filter.employeeRanges?.length) {
      companyConditions.employeeRange = { in: filter.employeeRanges };
    }

    if (Object.keys(companyConditions).length) {
      andConditions.push({
        company: {
          is: companyConditions
        }
      });
    }

    if (filter.search?.trim()) {
      andConditions.push({
        OR: [
          { email: { contains: filter.search, mode: "insensitive" } },
          { fullName: { contains: filter.search, mode: "insensitive" } },
          { jobTitle: { contains: filter.search, mode: "insensitive" } },
          {
            company: {
              is: {
                name: {
                  contains: filter.search,
                  mode: "insensitive"
                }
              }
            }
          }
        ]
      });
    }

    return {
      AND: andConditions
    };
  }

  static async list(workspaceId: string) {
    return prisma.segment.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" }
    });
  }

  static async getById(workspaceId: string, segmentId: string) {
    return prisma.segment.findFirst({
      where: {
        id: segmentId,
        workspaceId
      }
    });
  }

  static async create(workspaceId: string, userId: string, payload: unknown) {
    const data = segmentSchema.parse(payload);
    const contactCountCache = await prisma.contact.count({
      where: this.buildContactWhere(workspaceId, data.filterJson)
    });

    const segment = await prisma.segment.create({
      data: {
        workspaceId,
        name: data.name,
        filterJson: data.filterJson,
        contactCountCache,
        createdByUserId: userId
      }
    });

    await AuditService.record({
      workspaceId,
      actorUserId: userId,
      action: "segment.created",
      entityType: "segment",
      entityId: segment.id,
      metadata: {
        contactCountCache
      }
    });

    return segment;
  }

  static async resolveContacts(workspaceId: string, segmentId?: string | null) {
    if (!segmentId) {
      return prisma.contact.findMany({
        where: { workspaceId },
        include: { company: true }
      });
    }

    const segment = await this.getById(workspaceId, segmentId);

    if (!segment) {
      throw new Error("Segment not found");
    }

    return prisma.contact.findMany({
      where: this.buildContactWhere(workspaceId, segment.filterJson),
      include: { company: true }
    });
  }
}
