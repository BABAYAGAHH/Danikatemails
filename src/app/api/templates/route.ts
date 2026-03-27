import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { TemplateService } from "@/features/templates/template-service";
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
    return jsonOk(await TemplateService.list(workspace.id));
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
    const template = await TemplateService.create(
      workspace.id,
      user.id,
      await parseJsonBody(request, (value) => value)
    );
    return jsonOk(template, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
