import { prisma } from "@/lib/prisma";
import { requirePermission, requireUser } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export async function listSalaryHistory(employeeId: string) {
  const user = await requireUser();
  const canViewAll = user.permissions.includes(PERMISSIONS.PAYROLL_MANAGE);
  if (!canViewAll && user.employeeId !== employeeId) {
    throw new Error("Not authorized to view this employee's salary.");
  }
  return prisma.employeeSalary.findMany({
    where: { employeeId },
    orderBy: { effectiveFrom: "desc" },
  });
}

export async function getCurrentSalary(employeeId: string) {
  return prisma.employeeSalary.findFirst({
    where: { employeeId, effectiveTo: null },
    orderBy: { effectiveFrom: "desc" },
  });
}

export async function setEmployeeSalary(input: {
  employeeId: string;
  basicSalary: number;
  effectiveFrom: string;
}) {
  await requirePermission(PERMISSIONS.PAYROLL_MANAGE);
  const effectiveFrom = new Date(`${input.effectiveFrom}T00:00:00.000Z`);

  return prisma.$transaction(async (tx) => {
    // Close out any currently-open salary record the day before the new one starts.
    const current = await tx.employeeSalary.findFirst({
      where: { employeeId: input.employeeId, effectiveTo: null },
    });
    if (current) {
      const effectiveTo = new Date(effectiveFrom.getTime() - 24 * 60 * 60 * 1000);
      if (effectiveTo.getTime() >= current.effectiveFrom.getTime()) {
        await tx.employeeSalary.update({ where: { id: current.id }, data: { effectiveTo } });
      }
    }

    return tx.employeeSalary.create({
      data: {
        employeeId: input.employeeId,
        basicSalary: input.basicSalary,
        effectiveFrom,
      },
    });
  });
}
