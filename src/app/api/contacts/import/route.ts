import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { ContactService } from "@/features/contacts/contact-service";
import { requireWorkspaceRole } from "@/lib/auth/workspace";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp, jsonError, jsonOk, parseJsonBody } from "@/lib/utils/http";

export async function POST(request: NextRequest) {
  try {
    const { workspace, user } = await requireWorkspaceRole([
      UserRole.OWNER,
      UserRole.ADMIN,
      UserRole.MARKETER
    ]);
    const ip = getRequestIp(request);
    const rateLimit = checkRateLimit(`contacts-import:${workspace.id}:${ip}`, 20, 60_000);

    if (!rateLimit.allowed) {
      throw new Error("Import rate limit exceeded");
    }

    const body = await parseJsonBody(request, (value) => value as { preview?: boolean } & Record<string, unknown>);
    const result = body.preview
      ? ContactService.previewCsvImport(body)
      : await ContactService.importCsv(workspace.id, user.id, body);
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
