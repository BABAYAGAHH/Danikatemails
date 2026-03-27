import { Prisma, UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";

const ACTIVE_WORKSPACE_COOKIE = "rr_workspace_id";

export async function getActiveWorkspaceId() {
  const cookieStore = await cookies();
  return cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value ?? null;
}

export async function setActiveWorkspaceId(workspaceId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

export async function resolveWorkspaceMembership(explicitWorkspaceId?: string | null) {
  const user = await requireUser();
  const preferredWorkspaceId = explicitWorkspaceId ?? (await getActiveWorkspaceId());

  const membership = await prisma.workspaceMember.findFirst({
    where: {
      userId: user.id,
      ...(preferredWorkspaceId ? { workspaceId: preferredWorkspaceId } : {})
    },
    include: {
      workspace: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!membership) {
    throw new Error("Workspace membership not found");
  }

  return {
    user,
    membership,
    workspace: membership.workspace
  };
}

export async function requireWorkspaceRole(
  roles: UserRole[],
  explicitWorkspaceId?: string | null
) {
  const context = await resolveWorkspaceMembership(explicitWorkspaceId);

  if (!roles.includes(context.membership.role)) {
    throw new Error("Forbidden");
  }

  return context;
}

export function workspaceScope<
  T extends
    | Prisma.ContactWhereInput
    | Prisma.CampaignWhereInput
    | Prisma.TemplateWhereInput
    | Prisma.CompanyWhereInput
    | Prisma.SenderIdentityWhereInput
    | Prisma.AuditLogWhereInput
    | Prisma.SegmentWhereInput
    | Prisma.SuppressionEntryWhereInput
>(workspaceId: string, clause?: T) {
  return {
    workspaceId,
    ...(clause ?? {})
  } as T;
}
