import { cache } from "react";
import { auth } from "@/server/auth/auth";
import type { PermissionKey } from "@/lib/permissions";

export class ForbiddenError extends Error {
  constructor(permission: string) {
    super(`Missing required permission: ${permission}`);
    this.name = "ForbiddenError";
  }
}

export class UnauthenticatedError extends Error {
  constructor() {
    super("Not signed in");
    this.name = "UnauthenticatedError";
  }
}

export const getSession = cache(async () => auth());

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    throw new UnauthenticatedError();
  }
  return session.user;
}

export async function requirePermission(permission: PermissionKey) {
  const user = await requireUser();
  if (!user.permissions.includes(permission)) {
    throw new ForbiddenError(permission);
  }
  return user;
}

export function hasPermission(
  user: { permissions: string[] } | null | undefined,
  permission: PermissionKey,
) {
  return Boolean(user?.permissions.includes(permission));
}
