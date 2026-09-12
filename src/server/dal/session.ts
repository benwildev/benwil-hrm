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

import { prisma } from "@/lib/prisma";

export const getSession = cache(async () => {
  const session = await auth();
  if (session?.user && !session.user.employeeId && session.user.id) {
    try {
      const emp = await prisma.employee.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (emp) {
        session.user.employeeId = emp.id;
      }
    } catch {
      // ignore
    }
  }
  return session;
});

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
