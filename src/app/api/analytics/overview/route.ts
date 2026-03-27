import { UserRole } from "@prisma/client";
import { AnalyticsService } from "@/features/analytics/analytics-service";
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
    return jsonOk(await AnalyticsService.getOverview(workspace.id));
  } catch (error) {
    return jsonError(error);
  }
}
