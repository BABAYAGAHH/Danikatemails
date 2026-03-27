import { prisma } from "@/lib/db/prisma";
import { getEmailProvider } from "@/lib/email";
import { senderIdentitySchema } from "@/lib/validators/schemas";
import { AuditService } from "@/features/audit/audit-service";

export class SenderIdentityService {
  static async list(workspaceId: string) {
    return prisma.senderIdentity.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" }
    });
  }

  static async create(workspaceId: string, userId: string, payload: unknown) {
    const data = senderIdentitySchema.parse(payload);
    const provider = getEmailProvider();
    const verification = await provider.verifySenderIdentity(data);

    const sender = await prisma.senderIdentity.create({
      data: {
        workspaceId,
        fromName: data.fromName,
        fromEmail: data.fromEmail.toLowerCase(),
        replyToEmail: data.replyToEmail || null,
        domain: data.domain.toLowerCase(),
        provider: data.provider,
        status: verification.status,
        dkimStatus: verification.dkimStatus ?? null,
        spfStatus: verification.spfStatus ?? null,
        dmarcStatus: verification.dmarcStatus ?? null,
        providerExternalId: verification.providerExternalId ?? null
      }
    });

    await AuditService.record({
      workspaceId,
      actorUserId: userId,
      action: "sender.created",
      entityType: "senderIdentity",
      entityId: sender.id,
      metadata: {
        status: sender.status
      }
    });

    return sender;
  }
}
