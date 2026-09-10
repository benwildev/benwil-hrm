import { prisma } from "@/lib/prisma";
import { requirePermission, requireUser } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { computeEmployeePayslip } from "@/server/payroll/compute";

export async function listPayrollPeriods() {
  await requirePermission(PERMISSIONS.PAYROLL_VIEW_ALL);
  return prisma.payrollPeriod.findMany({
    include: { _count: { select: { records: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
}

export async function createPayrollPeriod(year: number, month: number) {
  await requirePermission(PERMISSIONS.PAYROLL_RUN);
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0));

  return prisma.payrollPeriod.create({
    data: { year, month, startDate, endDate, status: "DRAFT" },
  });
}

export async function getPayrollPeriod(id: string) {
  await requirePermission(PERMISSIONS.PAYROLL_VIEW_ALL);
  return prisma.payrollPeriod.findUniqueOrThrow({
    where: { id },
    include: {
      records: {
        include: { employee: { select: { id: true, fullName: true, employeeCode: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getPayrollRecord(id: string) {
  const user = await requireUser();
  const record = await prisma.payrollRecord.findUniqueOrThrow({
    where: { id },
    include: { employee: true, items: true, payrollPeriod: true, payslip: true },
  });

  const canViewAll = user.permissions.includes(PERMISSIONS.PAYROLL_VIEW_ALL);
  if (!canViewAll && user.employeeId !== record.employeeId) {
    throw new Error("Not authorized to view this payslip.");
  }

  return record;
}

export async function listMyPayslips() {
  const user = await requireUser();
  if (!user.employeeId) return [];
  return prisma.payrollRecord.findMany({
    where: { employeeId: user.employeeId },
    include: { payrollPeriod: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function runPayrollPeriod(periodId: string) {
  const user = await requirePermission(PERMISSIONS.PAYROLL_RUN);
  const period = await prisma.payrollPeriod.findUniqueOrThrow({ where: { id: periodId } });

  if (period.status === "COMPLETED" || period.status === "LOCKED") {
    throw new Error("This payroll period has already been finalized.");
  }

  const employees = await prisma.employee.findMany({
    where: { deletedAt: null, employmentStatus: { in: ["ACTIVE", "ON_LEAVE"] } },
    select: { id: true },
  });

  await prisma.payrollPeriod.update({ where: { id: periodId }, data: { status: "PROCESSING" } });

  // Regenerating a draft run replaces its records rather than accumulating duplicates.
  await prisma.payrollRecord.deleteMany({ where: { payrollPeriodId: periodId } });

  for (const employee of employees) {
    const breakdown = await computeEmployeePayslip(employee.id, period.startDate, period.endDate);
    if (!breakdown) continue; // no salary on file for this employee — skip

    const record = await prisma.payrollRecord.create({
      data: {
        payrollPeriodId: periodId,
        employeeId: employee.id,
        basicSalary: breakdown.basicSalary,
        totalEarnings: breakdown.totalEarnings,
        totalDeductions: breakdown.totalDeductions,
        netSalary: breakdown.netSalary,
        paymentStatus: "PENDING",
      },
    });

    const items = [
      {
        payrollRecordId: record.id,
        name: "Basic Salary",
        type: "EARNING" as const,
        amount: breakdown.earnedBasic,
        description: `${breakdown.presentDays} present, ${breakdown.paidLeaveDays} paid leave of ${breakdown.workingDays} working days`,
      },
      ...(breakdown.absenceDeduction.greaterThan(0)
        ? [
            {
              payrollRecordId: record.id,
              name: "Absence Deduction",
              type: "DEDUCTION" as const,
              amount: breakdown.absenceDeduction,
              description: `${breakdown.deductionDays} unpaid day(s) at ${breakdown.perDayRate.toFixed(2)}/day`,
            },
          ]
        : []),
      ...breakdown.earnings.map((e) => ({
        payrollRecordId: record.id,
        name: e.name,
        type: "EARNING" as const,
        amount: e.amount,
        description: e.description,
      })),
      ...breakdown.deductions.map((d) => ({
        payrollRecordId: record.id,
        name: d.name,
        type: "DEDUCTION" as const,
        amount: d.amount,
        description: d.description,
      })),
    ];

    await prisma.payrollItem.createMany({ data: items });
  }

  return prisma.payrollPeriod.update({
    where: { id: periodId },
    data: { status: "COMPLETED", processedAt: new Date(), processedById: user.id },
  });
}

export async function lockPayrollPeriod(periodId: string) {
  await requirePermission(PERMISSIONS.PAYROLL_RUN);
  return prisma.payrollPeriod.update({ where: { id: periodId }, data: { status: "LOCKED" } });
}

export async function markPayslipPaid(recordId: string) {
  await requirePermission(PERMISSIONS.PAYROLL_RUN);
  return prisma.payrollRecord.update({
    where: { id: recordId },
    data: { paymentStatus: "PAID", paidAt: new Date() },
  });
}
