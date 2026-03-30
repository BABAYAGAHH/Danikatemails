import { UserRole } from "@prisma/client";
import { ApiError } from "@/lib/utils/http";

export function hasAnyRole(role: UserRole, allowedRoles: UserRole[]) {
  return allowedRoles.includes(role);
}

export function assertWorkspaceRole(role: UserRole, allowedRoles: UserRole[]) {
  if (!hasAnyRole(role, allowedRoles)) {
    throw new ApiError(403, "Forbidden");
  }
}
