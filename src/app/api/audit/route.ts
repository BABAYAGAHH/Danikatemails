import { UserRole } from "@prisma/client";
import { AuditService } from "@/features/audit/audit-service";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET() {
  try {
    const { workspace } = await requireWorkspaceRole([
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MARKETER,
      UserRole.VIEWER
    ]);
    return jsonOk(await AuditService.list(workspace.id));
  } catch (error) {
    return jsonError(error);
  }
}
