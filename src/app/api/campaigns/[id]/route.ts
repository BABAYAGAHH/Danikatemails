import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { CampaignService } from "@/features/campaigns/campaign-service";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspaceRole([
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MARKETER,
      UserRole.VIEWER
    ]);
    const { id } = await context.params;
    return jsonOk(await CampaignService.getById(workspace.id, id));
  } catch (error) {
    return jsonError(error);
  }
}
