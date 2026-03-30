import { NextRequest } from "next/server";
import { AuthService } from "@/features/auth/auth-service";
import { setActiveWorkspaceId } from "@/lib/auth/workspace";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/utils/http";

export async function POST(request: NextRequest) {
  try {
    const result = await AuthService.register(await parseJsonBody(request, (value) => value));
    await setActiveWorkspaceId(result.workspace.id);

    return jsonOk(
      {
        user: result.user,
        workspace: result.workspace
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
