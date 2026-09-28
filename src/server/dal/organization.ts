import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

// Departments, designations and shifts are all managed under the
// employees:manage permission since they only exist to support employee
// records, not as standalone modules.

export async function listDepartments() {
  return prisma.department.findMany({ orderBy: { name: "asc" } });
}

export async function createDepartment(input: { name: string; description?: string }) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  return prisma.department.create({ data: input });
}

export async function deleteDepartment(id: string) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  const inUse = await prisma.employee.count({ where: { departmentId: id } });
  if (inUse > 0) throw new Error("Cannot delete a department that still has employees assigned.");
  await prisma.department.delete({ where: { id } });
}

export async function listDesignations() {
  return prisma.designation.findMany({ orderBy: { name: "asc" } });
}

export async function createDesignation(input: { name: string; description?: string }) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  return prisma.designation.create({ data: input });
}

export async function deleteDesignation(id: string) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  const inUse = await prisma.employee.count({ where: { designationId: id } });
  if (inUse > 0) throw new Error("Cannot delete a designation that still has employees assigned.");
  await prisma.designation.delete({ where: { id } });
}

export async function listShifts() {
  return prisma.shift.findMany({ orderBy: { name: "asc" } });
}

export type ShiftInput = {
  name: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  gracePeriodMinutes: number;
  breakMinutes: number;
  isOvernight: boolean;
  requiredWorkMinutes?: number | null;
};

function toTimeDate(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m));
}

export async function createShift(input: ShiftInput) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  return prisma.shift.create({
    data: {
      name: input.name,
      startTime: toTimeDate(input.startTime),
      endTime: toTimeDate(input.endTime),
      gracePeriodMinutes: input.gracePeriodMinutes,
      breakMinutes: input.breakMinutes,
      isOvernight: input.isOvernight,
      requiredWorkMinutes: input.requiredWorkMinutes ?? null,
    },
  });
}

export async function deleteShift(id: string) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  const inUse = await prisma.employee.count({ where: { shiftId: id } });
  if (inUse > 0) throw new Error("Cannot delete a shift that still has employees assigned.");
  await prisma.shift.delete({ where: { id } });
}
