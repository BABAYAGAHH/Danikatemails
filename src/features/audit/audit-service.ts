import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type AuditRecordInput = {
  workspaceId: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
};

export class AuditService {
  static async record(input: AuditRecordInput) {
    return prisma.auditLog.create({
      data: {
        ...input,
        metadata: input.metadata as Prisma.InputJsonValue | undefined
      }
    });
  }

  static async list(workspaceId: string) {
    return prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        actorUser: true
      }
    });
  }
}
