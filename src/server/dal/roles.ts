import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireUser } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { logAudit } from "@/server/audit/audit";
import { assertStrongPassword } from "@/server/auth/password-policy";

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
  const actor = await requirePermission(PERMISSIONS.ROLES_MANAGE);
  const role = await prisma.role.create({ data: { name: input.name, description: input.description } });
  await logAudit({ actorId: actor.id, action: "ROLE_CREATED", entityType: "Role", entityId: role.id, newData: input });
  return role;
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  const actor = await requirePermission(PERMISSIONS.ROLES_MANAGE);
  const before = await prisma.rolePermission.findMany({ where: { roleId }, select: { permissionId: true } });
  await prisma.$transaction([
    prisma.rolePermission.deleteMany({ where: { roleId } }),
    prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      skipDuplicates: true,
    }),
  ]);
  await logAudit({
    actorId: actor.id,
    action: "ROLE_PERMISSIONS_CHANGED",
    entityType: "Role",
    entityId: roleId,
    oldData: { permissionIds: before.map((p) => p.permissionId) },
    newData: { permissionIds },
  });
}

export async function renameRole(roleId: string, input: { name: string; description?: string }) {
  const actor = await requirePermission(PERMISSIONS.ROLES_MANAGE);
  const role = await prisma.role.findUniqueOrThrow({ where: { id: roleId } });
  if (role.isSystem && input.name !== role.name) {
    throw new Error("System roles cannot be renamed.");
  }
  const updated = await prisma.role.update({ where: { id: roleId }, data: input });
  await logAudit({
    actorId: actor.id,
    action: "ROLE_UPDATED",
    entityType: "Role",
    entityId: roleId,
    oldData: { name: role.name, description: role.description },
    newData: input,
  });
  return updated;
}

export async function deleteRole(roleId: string) {
  const actor = await requirePermission(PERMISSIONS.ROLES_MANAGE);
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
  await logAudit({ actorId: actor.id, action: "ROLE_DELETED", entityType: "Role", entityId: roleId, oldData: { name: role.name } });
}

export async function updateUserRole(userId: string, roleId: string) {
  const actor = await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  const before = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { roleId: true } });
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { roleId },
  });
  await logAudit({
    actorId: actor.id,
    action: "USER_ROLE_CHANGED",
    entityType: "User",
    entityId: userId,
    oldData: { roleId: before.roleId },
    newData: { roleId },
  });
  return updated;
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const actor = await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  assertStrongPassword(newPassword);
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
  await logAudit({ actorId: actor.id, action: "USER_PASSWORD_RESET_BY_ADMIN", entityType: "User", entityId: userId });
  return updated;
}

export async function createUserPortalAccess(
  employeeId: string,
  input: { email: string; roleId: string; password: string }
) {
  const actor = await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  if (!input.email || !input.roleId || !input.password) {
    throw new Error("Email, role, and password are required.");
  }
  assertStrongPassword(input.password);

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

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: input.email.toLowerCase().trim(),
        passwordHash,
        roleId: input.roleId,
        status: "ACTIVE",
      },
    });

    await tx.employee.update({
      where: { id: employeeId },
      data: { userId: created.id },
    });

    return created;
  });

  await logAudit({
    actorId: actor.id,
    action: "USER_PORTAL_ACCESS_CREATED",
    entityType: "Employee",
    entityId: employeeId,
    newData: { userId: user.id, email: user.email, roleId: input.roleId },
  });

  return user;
}

export async function updateOwnPassword(currentPassword: string, newPassword: string) {
  const sessionUser = await requireUser();
  assertStrongPassword(newPassword);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
  });
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Current password is incorrect.");
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const updated = await prisma.user.update({
    where: { id: sessionUser.id },
    data: { passwordHash },
  });
  await logAudit({ actorId: sessionUser.id, action: "USER_PASSWORD_CHANGED_SELF", entityType: "User", entityId: sessionUser.id });
  return updated;
}

