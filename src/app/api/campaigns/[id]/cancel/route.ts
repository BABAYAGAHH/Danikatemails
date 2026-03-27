import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { CampaignService } from "@/features/campaigns/campaign-service";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { jsonError, jsonOk } from "@/lib/utils/http";

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { workspace, user } = await requireWorkspaceRole([
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MARKETER
    ]);
    const { id } = await context.params;
    return jsonOk(await CampaignService.cancel(workspace.id, id, user.id));
  } catch (error) {
    return jsonError(error);
  }
}
