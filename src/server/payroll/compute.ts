import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { isWeekend, getHolidayChecker } from "@/server/attendance/calendar";

function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  for (let d = new Date(start); d.getTime() <= end.getTime(); d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
    days.push(new Date(d));
  }
  return days;
}

// Working days in the period = every day that isn't a weekend or company
// holiday. There's no separate "payroll settings" table in this schema, so
// the per-day rate is derived directly from the period's real calendar
// rather than a configurable "standard days per month" — simpler and always
// consistent with what attendance/leave actually track against.
async function countWorkingDays(startDate: Date, endDate: Date) {
  const isHoliday = await getHolidayChecker();
  return eachDay(startDate, endDate).filter((d) => !isWeekend(d) && !isHoliday(d)).length;
}

export type PayslipBreakdown = {
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  deductionDays: number;
  basicSalary: Prisma.Decimal;
  perDayRate: Prisma.Decimal;
  absenceDeduction: Prisma.Decimal;
  earnedBasic: Prisma.Decimal;
  earnings: { name: string; amount: Prisma.Decimal; description: string }[];
  deductions: { name: string; amount: Prisma.Decimal; description: string }[];
  totalEarnings: Prisma.Decimal;
  totalDeductions: Prisma.Decimal;
  netSalary: Prisma.Decimal;
};

export async function computeEmployeePayslip(
  employeeId: string,
  periodStart: Date,
  periodEnd: Date,
): Promise<PayslipBreakdown | null> {
  const salary = await prisma.employeeSalary.findFirst({
    where: {
      employeeId,
      effectiveFrom: { lte: periodEnd },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: periodStart } }],
    },
    orderBy: { effectiveFrom: "desc" },
  });
  if (!salary) return null;

  const workingDays = await countWorkingDays(periodStart, periodEnd);
  const isHoliday = await getHolidayChecker();

  const records = await prisma.attendanceRecord.findMany({
    where: { employeeId, attendanceDate: { gte: periodStart, lte: periodEnd } },
  });
  const recordByDate = new Map(records.map((r) => [r.attendanceDate.toISOString(), r]));

  const approvedLeave = await prisma.leaveRequest.findMany({
    where: {
      employeeId,
      status: "APPROVED",
      startDate: { lte: periodEnd },
      endDate: { gte: periodStart },
    },
    include: { leaveType: true },
  });

  function isPaidLeaveOn(day: Date) {
    return approvedLeave.some(
      (lr) => lr.startDate.getTime() <= day.getTime() && lr.endDate.getTime() >= day.getTime() && lr.leaveType.isPaid,
    );
  }

  let presentDays = 0;
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let absentDays = 0;

  for (const day of eachDay(periodStart, periodEnd)) {
    if (isWeekend(day) || isHoliday(day)) continue;

    const record = recordByDate.get(day.toISOString());
    const status = record?.status;

    if (status === "PRESENT" || status === "LATE") {
      presentDays += 1;
    } else if (status === "HALF_DAY") {
      presentDays += 0.5;
      absentDays += 0.5;
    } else if (status === "LEAVE") {
      if (isPaidLeaveOn(day)) paidLeaveDays += 1;
      else unpaidLeaveDays += 1;
    } else {
      // ABSENT, or no record at all for a working day — both count as absent.
      absentDays += 1;
    }
  }

  const basicSalary = salary.basicSalary;
  const perDayRate = workingDays > 0 ? basicSalary.dividedBy(workingDays) : new Prisma.Decimal(0);
  const deductionDays = absentDays + unpaidLeaveDays;
  const absenceDeduction = perDayRate.times(deductionDays);
  const earnedBasic = Prisma.Decimal.max(basicSalary.minus(absenceDeduction), 0);

  const components = await prisma.employeeSalaryComponent.findMany({
    where: {
      employeeId,
      effectiveFrom: { lte: periodEnd },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: periodStart } }],
    },
    include: { salaryComponent: true },
  });

  const earnings: PayslipBreakdown["earnings"] = [];
  const deductions: PayslipBreakdown["deductions"] = [];

  for (const c of components) {
    if (!c.salaryComponent.isActive) continue;
    const amount =
      c.salaryComponent.calculationType === "PERCENTAGE"
        ? basicSalary.times(c.amount).dividedBy(100)
        : c.amount;
    const entry = { name: c.salaryComponent.name, amount, description: `${c.salaryComponent.name} (${employeeId})` };
    if (c.salaryComponent.componentType === "EARNING") earnings.push(entry);
    else deductions.push(entry);
  }

  const totalEarnings = earnings.reduce((sum, e) => sum.plus(e.amount), earnedBasic);
  const totalDeductions = deductions.reduce((sum, d) => sum.plus(d.amount), new Prisma.Decimal(0));
  const netSalary = totalEarnings.minus(totalDeductions);

  return {
    workingDays,
    presentDays,
    paidLeaveDays,
    unpaidLeaveDays,
    absentDays,
    deductionDays,
    basicSalary,
    perDayRate,
    absenceDeduction,
    earnedBasic,
    earnings,
    deductions,
    totalEarnings,
    totalDeductions,
    netSalary,
  };
}
