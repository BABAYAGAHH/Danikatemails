import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { WorkspaceService } from "@/features/workspace/workspace-service";
import { requireUser } from "@/lib/auth/session";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/utils/http";

export async function GET() {
  try {
    const user = await requireUser();
    const workspaces = await WorkspaceService.listForUser(user.id);
    return jsonOk(workspaces);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const workspace = await WorkspaceService.createWorkspace(
      user.id,
      await parseJsonBody(request, (value) => value)
    );
    return jsonOk(workspace, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { workspace, user } = await requireWorkspaceRole([UserRole.OWNER, UserRole.ADMIN]);
    const updated = await WorkspaceService.updateSettings(
      workspace.id,
      user.id,
      await parseJsonBody(request, (value) => value)
    );
    return jsonOk(updated);
  } catch (error) {
    return jsonError(error);
  }
}
