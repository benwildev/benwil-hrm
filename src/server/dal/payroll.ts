import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requirePermission, requireUser, requireEmployeeAccess, ForbiddenError } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { computeEmployeePayslip, loadPayrollSharedContext } from "@/server/payroll/compute";
import { logAudit } from "@/server/audit/audit";

export async function listPayrollPeriods() {
  const user = await requireUser();
  if (
    user.roleName === "Employee" &&
    !user.permissions.includes(PERMISSIONS.PAYROLL_RUN) &&
    !user.permissions.includes(PERMISSIONS.PAYROLL_MANAGE)
  ) {
    throw new ForbiddenError("payroll:manage");
  }
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
  const user = await requireUser();
  if (
    user.roleName === "Employee" &&
    !user.permissions.includes(PERMISSIONS.PAYROLL_RUN) &&
    !user.permissions.includes(PERMISSIONS.PAYROLL_MANAGE)
  ) {
    throw new ForbiddenError("payroll:manage");
  }
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
  const record = await prisma.payrollRecord.findUniqueOrThrow({
    where: { id },
    include: {
      employee: {
        include: {
          department: true,
          designation: true,
        },
      },
      items: true,
      payrollPeriod: true,
      payslip: true,
    },
  });

  await requireEmployeeAccess(record.employeeId, PERMISSIONS.PAYROLL_VIEW_ALL);

  return record;
}

export async function listMyPayslips() {
  const user = await requireUser();
  let employeeId = user.employeeId;
  if (!employeeId) {
    const emp = await prisma.employee.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (emp) employeeId = emp.id;
  }
  if (!employeeId) return [];
  return prisma.payrollRecord.findMany({
    where: { employeeId },
    include: {
      payrollPeriod: true,
      items: true,
      payslip: true,
      employee: {
        include: {
          department: true,
          designation: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function runPayrollPeriod(periodId: string) {
  const user = await requirePermission(PERMISSIONS.PAYROLL_RUN);
  const period = await prisma.payrollPeriod.findUniqueOrThrow({ where: { id: periodId } });

  if (period.status === "LOCKED") {
    throw new Error("This payroll period has been finalized and locked.");
  }

  const hasPaidRecords = await prisma.payrollRecord.findFirst({
    where: { payrollPeriodId: periodId, paymentStatus: "PAID" },
  });
  if (hasPaidRecords) {
    throw new Error("Cannot recalculate payroll because some payments have already been marked as PAID in this period.");
  }

  const employees = await prisma.employee.findMany({
    where: {
      deletedAt: null,
      employmentStatus: { in: ["ACTIVE", "ON_LEAVE"] },
      // Exempt admin accounts that have no salary configured
      OR: [
        { user: null },
        { user: { role: { name: { not: "Admin" } } } },
        {
          salaries: {
            some: {
              effectiveFrom: { lte: period.endDate },
              OR: [{ effectiveTo: null }, { effectiveTo: { gte: period.startDate } }],
            },
          },
        },
      ],
    },
    select: { id: true },
  });

  // Pre-calculate payslips so computation errors happen before database
  // mutations. Company settings/holiday calendar/weekend config are the
  // same for every employee in this run, so they're loaded once up front
  // rather than being re-fetched inside computeEmployeePayslip for each one.
  const sharedContext = await loadPayrollSharedContext();
  const computedList: { employeeId: string; breakdown: NonNullable<Awaited<ReturnType<typeof computeEmployeePayslip>>> }[] = [];
  for (const employee of employees) {
    const breakdown = await computeEmployeePayslip(employee.id, period.startDate, period.endDate, sharedContext);
    if (breakdown) {
      computedList.push({ employeeId: employee.id, breakdown });
    }
  }

  // Execute deletion, inserts, and status update atomically in a single transaction
  const result = await prisma.$transaction(
    async (tx) => {
      await tx.payrollPeriod.update({ where: { id: periodId }, data: { status: "PROCESSING" } });
      await tx.payrollRecord.deleteMany({ where: { payrollPeriodId: periodId } });

      for (const { employeeId, breakdown } of computedList) {
        const record = await tx.payrollRecord.create({
          data: {
            payrollPeriodId: periodId,
            employeeId,
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
            amount: breakdown.basicSalary,
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
          ...(breakdown.lateDeduction.greaterThan(0)
            ? [
                {
                  payrollRecordId: record.id,
                  name: "Late Attendance Deduction",
                  type: "DEDUCTION" as const,
                  amount: breakdown.lateDeduction,
                  description: `${breakdown.lateDays} late arrival(s)`,
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

        await tx.payrollItem.createMany({ data: items });
      }

      return tx.payrollPeriod.update({
        where: { id: periodId },
        data: { status: "COMPLETED", processedAt: new Date(), processedById: user.id },
      });
    },
    { timeout: 60000, maxWait: 10000 },
  );

  await logAudit({
    actorId: user.id,
    action: "PAYROLL_RUN",
    entityType: "PayrollPeriod",
    entityId: periodId,
    newData: { year: period.year, month: period.month, recordCount: computedList.length },
  });

  return result;
}

export async function lockPayrollPeriod(periodId: string) {
  const user = await requirePermission(PERMISSIONS.PAYROLL_RUN);
  const result = await prisma.payrollPeriod.update({ where: { id: periodId }, data: { status: "LOCKED" } });
  await logAudit({
    actorId: user.id,
    action: "PAYROLL_LOCKED",
    entityType: "PayrollPeriod",
    entityId: periodId,
  });
  return result;
}

export async function markPayslipPaid(recordId: string) {
  const user = await requirePermission(PERMISSIONS.PAYROLL_RUN);
  const record = await prisma.payrollRecord.findUniqueOrThrow({
    where: { id: recordId },
    include: { payrollPeriod: true },
  });
  if (record.payrollPeriod.status === "LOCKED") {
    throw new Error("Cannot modify records in a locked payroll period.");
  }

  const updated = await prisma.payrollRecord.update({
    where: { id: recordId },
    data: { paymentStatus: "PAID", paidAt: new Date() },
  });

  await logAudit({
    actorId: user.id,
    action: "PAYSLIP_MARKED_PAID",
    entityType: "PayrollRecord",
    entityId: recordId,
  });

  return updated;
}

export type DisbursePayslipInput = {
  paymentMethod: string;
  paymentReference?: string;
  paymentNote?: string;
  paidAt?: Date;
};

export async function disbursePayslip(recordId: string, input: DisbursePayslipInput) {
  const user = await requirePermission(PERMISSIONS.PAYROLL_RUN);
  const record = await prisma.payrollRecord.findUniqueOrThrow({
    where: { id: recordId },
    include: { payrollPeriod: true },
  });
  if (record.payrollPeriod.status === "LOCKED") {
    throw new Error("Cannot disburse payment for a locked payroll period.");
  }

  const updated = await prisma.payrollRecord.update({
    where: { id: recordId },
    data: {
      paymentStatus: "PAID",
      paidAt: input.paidAt ?? new Date(),
      paymentMethod: input.paymentMethod,
      paymentReference: input.paymentReference || null,
      paymentNote: input.paymentNote || null,
      disbursedById: user.id,
    },
  });

  await logAudit({
    actorId: user.id,
    action: "PAYROLL_DISBURSED",
    entityType: "PayrollRecord",
    entityId: recordId,
    newData: { paymentMethod: input.paymentMethod, paymentReference: input.paymentReference },
  });

  return updated;
}

export async function resetPayslipPaymentStatus(recordId: string) {
  const user = await requirePermission(PERMISSIONS.PAYROLL_RUN);
  const record = await prisma.payrollRecord.findUniqueOrThrow({
    where: { id: recordId },
    include: { payrollPeriod: true },
  });

  if (record.payrollPeriod.status === "LOCKED") {
    throw new Error("Cannot modify records in a locked payroll period.");
  }

  const updated = await prisma.payrollRecord.update({
    where: { id: recordId },
    data: {
      paymentStatus: "PENDING",
      paidAt: null,
      paymentReference: null,
      paymentNote: null,
      disbursedById: null,
    },
  });

  await logAudit({
    actorId: user.id,
    action: "PAYROLL_PAYMENT_STATUS_RESET",
    entityType: "PayrollRecord",
    entityId: recordId,
    oldData: { paymentStatus: record.paymentStatus },
  });

  return updated;
}

export type AdjustPayslipInput = {
  absenceDeduction?: number;
  lateDeduction?: number;
  bonusAmount?: number;
  bonusName?: string;
  deductionAmount?: number;
  deductionName?: string;
  adjustmentNote?: string;
};

export async function adjustPayslip(recordId: string, input: AdjustPayslipInput) {
  const user = await requirePermission(PERMISSIONS.PAYROLL_RUN);
  const record = await prisma.payrollRecord.findUniqueOrThrow({
    where: { id: recordId },
    include: { items: true, payrollPeriod: true },
  });

  if (record.payrollPeriod.status === "LOCKED") {
    throw new Error("Cannot adjust a finalized and locked payroll period.");
  }
  if (record.paymentStatus === "PAID") {
    throw new Error(
      "This payslip has already been paid and its amounts can no longer be adjusted. Reset its payment status first if this was a mistake.",
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Override absence deduction if specified
    if (input.absenceDeduction !== undefined) {
      const existingAbsence = record.items.find((i) => i.name === "Absence Deduction");
      if (input.absenceDeduction <= 0) {
        if (existingAbsence) {
          await tx.payrollItem.delete({ where: { id: existingAbsence.id } });
        }
      } else {
        const desc = input.adjustmentNote
          ? `Adjusted by admin: ${input.adjustmentNote}`
          : "Absence deduction adjusted by administrator";
        if (existingAbsence) {
          await tx.payrollItem.update({
            where: { id: existingAbsence.id },
            data: { amount: input.absenceDeduction, description: desc },
          });
        } else {
          await tx.payrollItem.create({
            data: {
              payrollRecordId: recordId,
              name: "Absence Deduction",
              type: "DEDUCTION",
              amount: input.absenceDeduction,
              description: desc,
            },
          });
        }
      }
    }

    // 1b. Override late attendance deduction if specified
    if (input.lateDeduction !== undefined) {
      const existingLate = record.items.find((i) => i.name === "Late Attendance Deduction");
      if (input.lateDeduction <= 0) {
        if (existingLate) {
          await tx.payrollItem.delete({ where: { id: existingLate.id } });
        }
      } else {
        const desc = input.adjustmentNote
          ? `Adjusted by admin: ${input.adjustmentNote}`
          : "Late attendance deduction adjusted by administrator";
        if (existingLate) {
          await tx.payrollItem.update({
            where: { id: existingLate.id },
            data: { amount: input.lateDeduction, description: desc },
          });
        } else {
          await tx.payrollItem.create({
            data: {
              payrollRecordId: recordId,
              name: "Late Attendance Deduction",
              type: "DEDUCTION",
              amount: input.lateDeduction,
              description: desc,
            },
          });
        }
      }
    }

    // 2. Add bonus / extra earning if provided
    if (input.bonusAmount && input.bonusAmount > 0) {
      await tx.payrollItem.create({
        data: {
          payrollRecordId: recordId,
          name: input.bonusName || "Admin Bonus",
          type: "EARNING",
          amount: input.bonusAmount,
          description: input.adjustmentNote || "Special bonus adjustment",
        },
      });
    }

    // 3. Add custom deduction if provided
    if (input.deductionAmount && input.deductionAmount > 0) {
      await tx.payrollItem.create({
        data: {
          payrollRecordId: recordId,
          name: input.deductionName || "Special Deduction",
          type: "DEDUCTION",
          amount: input.deductionAmount,
          description: input.adjustmentNote || "Special deduction adjustment",
        },
      });
    }

    // 4. Recompute totalEarnings, totalDeductions, netSalary
    const allItems = await tx.payrollItem.findMany({ where: { payrollRecordId: recordId } });
    const totalEarnings = allItems
      .filter((i) => i.type === "EARNING")
      .reduce((sum, i) => sum.plus(i.amount), new Prisma.Decimal(0));
    const totalDeductions = allItems
      .filter((i) => i.type === "DEDUCTION")
      .reduce((sum, i) => sum.plus(i.amount), new Prisma.Decimal(0));
    const netSalary = Prisma.Decimal.max(totalEarnings.minus(totalDeductions), 0);

    return tx.payrollRecord.update({
      where: { id: recordId },
      data: {
        totalEarnings,
        totalDeductions,
        netSalary,
      },
    });
  });

  await logAudit({
    actorId: user.id,
    action: "PAYSLIP_ADJUSTED",
    entityType: "PayrollRecord",
    entityId: recordId,
    oldData: { totalEarnings: record.totalEarnings, totalDeductions: record.totalDeductions, netSalary: record.netSalary },
    newData: { totalEarnings: result.totalEarnings, totalDeductions: result.totalDeductions, netSalary: result.netSalary, adjustmentNote: input.adjustmentNote },
  });

  return result;
}
