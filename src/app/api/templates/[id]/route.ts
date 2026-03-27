import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { TemplateService } from "@/features/templates/template-service";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/utils/http";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspaceRole([
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MARKETER,
      UserRole.VIEWER
    ]);
    const { id } = await context.params;
    return jsonOk(await TemplateService.getById(workspace.id, id));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { workspace, user } = await requireWorkspaceRole([
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MARKETER
    ]);
    const { id } = await context.params;
    return jsonOk(
      await TemplateService.update(
        workspace.id,
        id,
        user.id,
        await parseJsonBody(request, (value) => value)
      )
    );
  } catch (error) {
    return jsonError(error);
  }
}
