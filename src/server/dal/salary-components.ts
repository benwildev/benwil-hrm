import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export async function listSalaryComponents() {
  await requirePermission(PERMISSIONS.PAYROLL_MANAGE);
  return prisma.salaryComponent.findMany({ orderBy: { name: "asc" } });
}

export async function listActiveSalaryComponents() {
  await requirePermission(PERMISSIONS.PAYROLL_MANAGE);
  return prisma.salaryComponent.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}

export async function createSalaryComponent(input: {
  name: string;
  componentType: "EARNING" | "DEDUCTION";
  calculationType: "FIXED" | "PERCENTAGE";
  defaultAmount: number;
}) {
  await requirePermission(PERMISSIONS.PAYROLL_MANAGE);
  return prisma.salaryComponent.create({ data: input });
}

export async function setSalaryComponentActive(id: string, isActive: boolean) {
  await requirePermission(PERMISSIONS.PAYROLL_MANAGE);
  await prisma.salaryComponent.update({ where: { id }, data: { isActive } });
}

export async function listEmployeeSalaryComponents(employeeId: string) {
  await requirePermission(PERMISSIONS.PAYROLL_MANAGE);
  return prisma.employeeSalaryComponent.findMany({
    where: { employeeId, effectiveTo: null },
    include: { salaryComponent: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function assignSalaryComponent(input: {
  employeeId: string;
  salaryComponentId: string;
  amount: number;
  effectiveFrom: string;
}) {
  await requirePermission(PERMISSIONS.PAYROLL_MANAGE);
  return prisma.employeeSalaryComponent.create({
    data: {
      employeeId: input.employeeId,
      salaryComponentId: input.salaryComponentId,
      amount: input.amount,
      effectiveFrom: new Date(`${input.effectiveFrom}T00:00:00.000Z`),
    },
  });
}

export async function removeSalaryComponent(id: string) {
  await requirePermission(PERMISSIONS.PAYROLL_MANAGE);
  await prisma.employeeSalaryComponent.update({
    where: { id },
    data: { effectiveTo: new Date() },
  });
}
