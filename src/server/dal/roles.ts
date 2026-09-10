import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/dal/session";
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
