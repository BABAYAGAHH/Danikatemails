import { UserRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { SegmentService } from "@/features/segments/segment-service";
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
    const segments = await SegmentService.list(workspace.id);
    return jsonOk(segments);
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
    const segment = await SegmentService.create(
      workspace.id,
      user.id,
      await parseJsonBody(request, (value) => value)
    );
    return jsonOk(segment, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
