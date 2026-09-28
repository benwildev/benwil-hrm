import { prisma } from "@/lib/prisma";
import { requireEmployeeAccess } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { logAudit } from "@/server/audit/audit";

export async function listSalaryHistory(employeeId: string) {
  await requireEmployeeAccess(employeeId, PERMISSIONS.PAYROLL_MANAGE);
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
  const user = await requireEmployeeAccess(input.employeeId, PERMISSIONS.PAYROLL_MANAGE);
  if (!(input.basicSalary >= 0)) {
    throw new Error("Basic salary cannot be negative.");
  }
  const effectiveFrom = new Date(`${input.effectiveFrom}T00:00:00.000Z`);

  const created = await prisma.$transaction(async (tx) => {
    // Close out any currently-open salary record the day before the new one starts.
    const current = await tx.employeeSalary.findFirst({
      where: { employeeId: input.employeeId, effectiveTo: null },
    });
    if (current) {
      const effectiveTo = new Date(effectiveFrom.getTime() - 24 * 60 * 60 * 1000);
      if (effectiveTo.getTime() < current.effectiveFrom.getTime()) {
        throw new Error(
          "The new salary's effective date must be after the current salary record's effective date.",
        );
      }
      await tx.employeeSalary.update({ where: { id: current.id }, data: { effectiveTo } });
    }

    return tx.employeeSalary.create({
      data: {
        employeeId: input.employeeId,
        basicSalary: input.basicSalary,
        effectiveFrom,
      },
    });
  });

  await logAudit({
    actorId: user.id,
    action: "SALARY_CHANGED",
    entityType: "EmployeeSalary",
    entityId: created.id,
    newData: { employeeId: input.employeeId, basicSalary: input.basicSalary, effectiveFrom },
  });

  return created;
}
