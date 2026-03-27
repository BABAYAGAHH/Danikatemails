import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { templateSchema } from "@/lib/validators/schemas";
import { AuditService } from "@/features/audit/audit-service";

type TemplateVariables = Record<string, string | null | undefined>;

function coerceTemplateVariables(sample?: Prisma.JsonObject): TemplateVariables {
  if (!sample) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(sample).map(([key, value]) => {
      if (value === null || value === undefined) {
        return [key, undefined];
      }

      if (typeof value === "string") {
        return [key, value];
      }

      return [key, String(value)];
    })
  );
}

export class TemplateService {
  static render(content: string, variables: TemplateVariables) {
    return content.replace(/\{\{\s*([a-zA-Z0-9]+)\s*\}\}/g, (_match, token: string) => {
      return variables[token] ?? "";
    });
  }

  static defaultPreviewVariables(workspaceName = "RegionReach Demo"): Record<string, string> {
    return {
      firstName: "Taylor",
      lastName: "Reed",
      companyName: "Northwind Systems",
      industry: "Technology",
      city: "San Francisco",
      region: "US",
      senderName: "Nadia Wright",
      workspaceName,
      unsubscribeUrl: "https://regionreach.dev/unsubscribe/demo"
    };
  }

  static async list(workspaceId: string) {
    return prisma.template.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 5
        }
      }
    });
  }

  static async getById(workspaceId: string, templateId: string) {
    return prisma.template.findFirst({
      where: {
        id: templateId,
        workspaceId
      },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" }
        }
      }
    });
  }

  static async create(workspaceId: string, userId: string, payload: unknown) {
    const data = templateSchema.parse(payload);

    return prisma.$transaction(async (tx) => {
      const template = await tx.template.create({
        data: {
          workspaceId,
          createdByUserId: userId,
          ...data,
          previewText: data.previewText || null
        }
      });

      await tx.templateVersion.create({
        data: {
          templateId: template.id,
          versionNumber: 1,
          subject: template.subject,
          previewText: template.previewText,
          htmlContent: template.htmlContent,
          textContent: template.textContent,
          createdByUserId: userId
        }
      });

      await AuditService.record({
        workspaceId,
        actorUserId: userId,
        action: "template.created",
        entityType: "template",
        entityId: template.id,
        metadata: {
          status: template.status
        }
      });

      return template;
    });
  }

  static async update(workspaceId: string, templateId: string, userId: string, payload: unknown) {
    const data = templateSchema.parse(payload);
    const existing = await prisma.template.findFirstOrThrow({
      where: {
        id: templateId,
        workspaceId
      },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1
        }
      }
    });

    return prisma.$transaction(async (tx) => {
      const template = await tx.template.update({
        where: { id: existing.id },
        data: {
          ...data,
          previewText: data.previewText || null
        }
      });

      const nextVersion = (existing.versions[0]?.versionNumber ?? 0) + 1;

      await tx.templateVersion.create({
        data: {
          templateId: template.id,
          versionNumber: nextVersion,
          subject: template.subject,
          previewText: template.previewText,
          htmlContent: template.htmlContent,
          textContent: template.textContent,
          createdByUserId: userId
        }
      });

      await AuditService.record({
        workspaceId,
        actorUserId: userId,
        action: "template.updated",
        entityType: "template",
        entityId: template.id,
        metadata: {
          versionNumber: nextVersion
        }
      });

      return template;
    });
  }

  static async createVersion(workspaceId: string, templateId: string) {
    const template = await prisma.template.findFirstOrThrow({
      where: {
        id: templateId,
        workspaceId
      },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1
        }
      }
    });

    return prisma.templateVersion.create({
      data: {
        templateId: template.id,
        versionNumber: (template.versions[0]?.versionNumber ?? 0) + 1,
        subject: template.subject,
        previewText: template.previewText,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        createdByUserId: template.createdByUserId
      }
    });
  }

  static async preview(templateId: string, workspaceId: string, sample?: Prisma.JsonObject) {
    const template = await this.getById(workspaceId, templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    const variables = {
      ...this.defaultPreviewVariables(),
      ...coerceTemplateVariables(sample)
    };

    return {
      subject: this.render(template.subject, variables),
      previewText: template.previewText ? this.render(template.previewText, variables) : null,
      html: this.render(template.htmlContent, variables),
      text: this.render(template.textContent, variables)
    };
  }
}
