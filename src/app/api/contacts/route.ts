import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { ContactService } from "@/features/contacts/contact-service";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/utils/http";

export async function GET(request: NextRequest) {
  try {
    const { workspace } = await requireWorkspaceRole([
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MARKETER,
      UserRole.VIEWER
    ]);
    const searchParams = new URL(request.url).searchParams;
    const contacts = await ContactService.list(workspace.id, {
      search: searchParams.get("search") ?? undefined
    });
    return jsonOk(contacts);
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
    const body = await parseJsonBody(request, (value) => value);
    const result =
      typeof body === "object" && body && "action" in body
        ? await ContactService.applyBulkAction(workspace.id, user.id, body)
        : await ContactService.create(workspace.id, user.id, body);
    return jsonOk(result, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { workspace, user } = await requireWorkspaceRole([
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MARKETER
    ]);
    const body = await parseJsonBody(request, (value) => value as { id?: string } & Record<string, unknown>);
    if (!body.id) {
      throw new Error("Contact id is required");
    }
    const contact = await ContactService.update(workspace.id, body.id, user.id, body);
    return jsonOk(contact);
  } catch (error) {
    return jsonError(error);
  }
}
