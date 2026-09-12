import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireUser } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export async function listRoles() {
  await requirePermission(PERMISSIONS.ROLES_MANAGE);
  return prisma.role.findMany({
    include: {
      permissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function listRolesForAssignment() {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  return prisma.role.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function listPermissions() {
  await requirePermission(PERMISSIONS.ROLES_MANAGE);
  return prisma.permission.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
}

export async function getRole(roleId: string) {
  await requirePermission(PERMISSIONS.ROLES_MANAGE);
  return prisma.role.findUniqueOrThrow({
    where: { id: roleId },
    include: { permissions: { include: { permission: true } } },
  });
}

export async function createRole(input: { name: string; description?: string }) {
  await requirePermission(PERMISSIONS.ROLES_MANAGE);
  return prisma.role.create({ data: { name: input.name, description: input.description } });
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  await requirePermission(PERMISSIONS.ROLES_MANAGE);
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      skipDuplicates: true,
    }),
  ]);
}

export async function renameRole(roleId: string, input: { name: string; description?: string }) {
  await requirePermission(PERMISSIONS.ROLES_MANAGE);
  const role = await prisma.role.findUniqueOrThrow({ where: { id: roleId } });
  if (role.isSystem && input.name !== role.name) {
    throw new Error("System roles cannot be renamed.");
  }
  return prisma.role.update({ where: { id: roleId }, data: input });
}

export async function deleteRole(roleId: string) {
  await requirePermission(PERMISSIONS.ROLES_MANAGE);
  const role = await prisma.role.findUniqueOrThrow({
    where: { id: roleId },
    include: { _count: { select: { users: true } } },
  });
  if (role.isSystem) {
    throw new Error("System roles cannot be deleted.");
  }
  if (role._count.users > 0) {
    throw new Error("Cannot delete a role that still has users assigned.");
  }
  await prisma.role.delete({ where: { id: roleId } });
}

export async function updateUserRole(userId: string, roleId: string) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  return prisma.user.update({
    where: { id: userId },
    data: { roleId },
  });
}

export async function updateUserPassword(userId: string, newPassword: string) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function createUserPortalAccess(
  employeeId: string,
  input: { email: string; roleId: string; password: string }
) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  if (!input.email || !input.roleId || !input.password) {
    throw new Error("Email, role, and password are required.");
  }
  if (input.password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
    select: { id: true, userId: true },
  });

  if (employee.userId) {
    throw new Error("Employee already has a system portal login account.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase().trim() },
  });
  if (existingUser) {
    throw new Error("A user account with this email address already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        passwordHash,
        roleId: input.roleId,
        status: "ACTIVE",
      },
    });

    await tx.employee.update({
      where: { id: employeeId },
      data: { userId: user.id },
    });

    return user;
  });
}

export async function updateOwnPassword(currentPassword: string, newPassword: string) {
  const sessionUser = await requireUser();
  if (!newPassword || newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
  });
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Current password is incorrect.");
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  return prisma.user.update({
    where: { id: sessionUser.id },
    data: { passwordHash },
  });
}

