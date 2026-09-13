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

/**
 * The single ownership gate for "an employee's own HR data vs. someone
 * managing it." Every DAL function that takes an `employeeId` and returns
 * private per-employee data (profile, documents, leave balances, salary,
 * attendance, payroll) must go through this instead of re-deriving its own
 * `canViewAll` check — that duplication is exactly how EMPLOYEES_VIEW (a
 * permission granted to every base "Employee" role, for browsing the
 * directory) previously got reused as a stand-in for "can see everyone's
 * private profile," which it must never mean.
 *
 * Pass the elevated permission that lets someone see ANY employee's record
 * for this resource (e.g. EMPLOYEES_MANAGE, PAYROLL_MANAGE, ATTENDANCE_VIEW_ALL).
 * Without it, the caller may only access their own record.
 */
export async function requireEmployeeAccess(employeeId: string, managePermission: PermissionKey) {
  const user = await requireUser();
  const canManage = user.permissions.includes(managePermission);
  if (!canManage && user.employeeId !== employeeId) {
    throw new ForbiddenError(managePermission);
  }
  return user;
}
