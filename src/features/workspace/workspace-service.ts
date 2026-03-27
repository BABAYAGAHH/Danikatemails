import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { AuditService } from "@/features/audit/audit-service";
import { workspaceCreateSchema, workspaceSettingsSchema } from "@/lib/validators/schemas";

export class WorkspaceService {
  static async listForUser(userId: string) {
    return prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });
  }

  static async createWorkspace(userId: string, payload: unknown) {
    const data = workspaceCreateSchema.parse(payload);

    const workspace = await prisma.workspace.create({
      data: {
        ...data,
        members: {
          create: {
            userId,
            role: UserRole.OWNER
          }
        }
      }
    });

    await AuditService.record({
      workspaceId: workspace.id,
      actorUserId: userId,
      action: "workspace.created",
      entityType: "workspace",
      entityId: workspace.id,
      metadata: {
        slug: workspace.slug
      }
    });

    return workspace;
  }

  static async updateSettings(workspaceId: string, userId: string, payload: unknown) {
    const data = workspaceSettingsSchema.parse(payload);

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data
    });

    await AuditService.record({
      workspaceId,
      actorUserId: userId,
      action: "workspace.settings.updated",
      entityType: "workspace",
      entityId: workspaceId,
      metadata: data
    });

    return workspace;
  }
}
