import { NextRequest } from "next/server";
import { WorkspaceService } from "@/features/workspace/workspace-service";
import { requireUser } from "@/lib/auth/session";
import { setActiveWorkspaceId } from "@/lib/auth/workspace";
import { workspaceSwitchSchema } from "@/lib/validators/schemas";
import { ApiError, jsonError, jsonOk, parseJsonBody } from "@/lib/utils/http";

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const { workspaceId } = await parseJsonBody(request, (value) =>
      workspaceSwitchSchema.parse(value)
    );
    const membership = await WorkspaceService.getMembershipForUser(user.id, workspaceId);

    if (!membership) {
      throw new ApiError(403, "Workspace membership not found");
    }

    await setActiveWorkspaceId(workspaceId);

    return jsonOk({
      workspaceId,
      role: membership.role,
      workspace: membership.workspace
    });
  } catch (error) {
    return jsonError(error);
  }
}
