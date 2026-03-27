import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { CampaignService } from "@/features/campaigns/campaign-service";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/utils/http";

export async function GET() {
  try {
    const { workspace } = await requireWorkspaceRole([
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MARKETER,
      UserRole.VIEWER
    ]);
    return jsonOk(await CampaignService.list(workspace.id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workspace, user } = await requireWorkspaceRole([
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MARKETER
    ]);
    return jsonOk(
      await CampaignService.create(
        workspace.id,
        user.id,
        await parseJsonBody(request, (value) => value)
      ),
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
