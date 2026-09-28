import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export async function listLeaveTypes() {
  return prisma.leaveType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}

export async function listAllLeaveTypes() {
  await requirePermission(PERMISSIONS.LEAVE_TYPES_MANAGE);
  return prisma.leaveType.findMany({ orderBy: { name: "asc" } });
}

export async function createLeaveType(input: {
  name: string;
  description?: string;
  daysPerYear: number;
  isPaid: boolean;
}) {
  await requirePermission(PERMISSIONS.LEAVE_TYPES_MANAGE);
  return prisma.leaveType.create({ data: input });
}

export async function setLeaveTypeActive(id: string, isActive: boolean) {
  await requirePermission(PERMISSIONS.LEAVE_TYPES_MANAGE);
  await prisma.leaveType.update({ where: { id }, data: { isActive } });
}
