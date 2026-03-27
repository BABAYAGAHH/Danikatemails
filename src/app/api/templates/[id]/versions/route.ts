import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { TemplateService } from "@/features/templates/template-service";
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
    const template = await TemplateService.getById(workspace.id, id);
    return jsonOk(template?.versions ?? []);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { workspace } = await requireWorkspaceRole([
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MARKETER
    ]);
    const { id } = await context.params;
    return jsonOk(await TemplateService.createVersion(workspace.id, id), { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
