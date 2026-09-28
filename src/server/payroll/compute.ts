import { prisma } from "@/lib/prisma";
import { Prisma, type Company } from "@/generated/prisma/client";
import { isWeekend, getHolidayChecker, getCompanyWeekendDays } from "@/server/attendance/calendar";

function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  for (let d = new Date(start); d.getTime() <= end.getTime(); d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
    days.push(new Date(d));
  }
  return days;
}

// Working days in the period = every day that isn't a weekend or company
// holiday.
function countWorkingDays(startDate: Date, endDate: Date, isHoliday: (d: Date) => boolean, weekendDays: number[]) {
  return eachDay(startDate, endDate).filter((d) => !isWeekend(d, weekendDays) && !isHoliday(d)).length;
}

// Company settings, the holiday calendar, and weekend-day config are the
// same for every employee in a payroll run — fetching them once and
// threading them through, instead of re-querying per employee, cuts a
// payroll run over N employees from ~3N queries for this shared data down
// to 3 total.
export type PayrollSharedContext = {
  company: Company | null;
  isHoliday: (day: Date) => boolean;
  weekendDays: number[];
};

export async function loadPayrollSharedContext(): Promise<PayrollSharedContext> {
  const [company, isHoliday, weekendDays] = await Promise.all([
    prisma.company.findUnique({ where: { id: "singleton" } }),
    getHolidayChecker(),
    getCompanyWeekendDays(),
  ]);
  return { company, isHoliday, weekendDays };
}

export type PayslipBreakdown = {
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  absentDays: number;
  lateDays: number;
  deductionDays: number;
  basicSalary: Prisma.Decimal;
  perDayRate: Prisma.Decimal;
  absenceDeduction: Prisma.Decimal;
  lateDeduction: Prisma.Decimal;
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
  shared?: PayrollSharedContext,
): Promise<PayslipBreakdown | null> {
  const ctx = shared ?? (await loadPayrollSharedContext());
  const { company, isHoliday, weekendDays } = ctx;

  const [salary, employee] = await Promise.all([
    prisma.employeeSalary.findFirst({
      where: {
        employeeId,
        effectiveFrom: { lte: periodEnd },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: periodStart } }],
      },
      orderBy: { effectiveFrom: "desc" },
    }),
    prisma.employee.findUnique({
      where: { id: employeeId },
      select: { joiningDate: true, resignationDate: true, terminationDate: true },
    }),
  ]);

  if (!salary) return null;

  const workingDays = countWorkingDays(periodStart, periodEnd, isHoliday, weekendDays);

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

  // Determine employee's active tenure within this specific pay period
  const hireDate = employee?.joiningDate ? new Date(employee.joiningDate) : null;
  const exitDate = employee?.resignationDate
    ? new Date(employee.resignationDate)
    : employee?.terminationDate
      ? new Date(employee.terminationDate)
      : null;

  let presentDays = 0;
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let absentDays = 0;
  let lateDays = 0;

  for (const day of eachDay(periodStart, periodEnd)) {
    if (isWeekend(day, weekendDays) || isHoliday(day)) continue;

    // If day is before hire date or after exit date, employee was not employed yet / already exited
    if (hireDate && day.getTime() < hireDate.getTime()) {
      continue;
    }
    if (exitDate && day.getTime() > exitDate.getTime()) {
      continue;
    }

    const record = recordByDate.get(day.toISOString());
    const status = record?.status;

    if (status === "PRESENT" || status === "LATE") {
      presentDays += 1;
      if (status === "LATE") {
        lateDays += 1;
      }
    } else if (status === "HALF_DAY") {
      presentDays += 0.5;
      absentDays += 0.5;
    } else if (status === "LEAVE") {
      if (isPaidLeaveOn(day)) paidLeaveDays += 1;
      else unpaidLeaveDays += 1;
    } else {
      // ABSENT or missing punch during employee's active employment
      absentDays += 1;
    }
  }

  const basicSalary = salary.basicSalary;

  // Determine calculation divisor basis from Company settings
  const enableAbsenceDeduction = company?.enableAbsenceDeduction ?? true;
  const basis = company?.absenceCalculationBasis ?? "WORKING_DAYS";
  const deductionRatePct = company?.absenceDeductionRate ? Number(company.absenceDeductionRate) : 100;

  let divisorDays = workingDays;
  if (basis === "CALENDAR_DAYS") {
    divisorDays = eachDay(periodStart, periodEnd).length;
  } else if (basis === "FIXED_30") {
    divisorDays = 30;
  } else if (basis === "FIXED_26") {
    divisorDays = 26;
  }
  if (divisorDays <= 0) divisorDays = 1;

  const perDayRate = basicSalary.dividedBy(divisorDays);
  const deductionDays = absentDays + unpaidLeaveDays;

  let absenceDeduction = new Prisma.Decimal(0);
  if (enableAbsenceDeduction && deductionDays > 0) {
    absenceDeduction = perDayRate.times(deductionDays).times(deductionRatePct).dividedBy(100);
    // Cap absence deduction so it cannot exceed basic salary
    if (absenceDeduction.greaterThan(basicSalary)) {
      absenceDeduction = basicSalary;
    }
  }

  // Determine late attendance penalty policy from Company settings
  const enableLateDeduction = company?.enableLateDeduction ?? false;
  const lateGraceCount = company?.lateGraceCount ?? 3;
  const lateBasis = company?.lateDeductionBasis ?? "ONE_DAY_PER_3_LATES";
  const lateDeductionRatePct = company?.lateDeductionRate ? Number(company.lateDeductionRate) : 100;

  let lateDeduction = new Prisma.Decimal(0);
  if (enableLateDeduction && lateDays > lateGraceCount) {
    const excessLates = lateDays - lateGraceCount;
    let penalizedDays = 0;

    if (lateBasis === "ONE_DAY_PER_3_LATES") {
      penalizedDays = Math.floor(excessLates / 3);
    } else if (lateBasis === "HALF_DAY") {
      penalizedDays = excessLates * 0.5;
    } else if (lateBasis === "FULL_DAY") {
      penalizedDays = excessLates * 1.0;
    } else if (lateBasis === "FIXED_PERCENTAGE") {
      penalizedDays = excessLates;
    }

    if (penalizedDays > 0) {
      lateDeduction = perDayRate.times(penalizedDays).times(lateDeductionRatePct).dividedBy(100);
      if (lateDeduction.greaterThan(basicSalary)) {
        lateDeduction = basicSalary;
      }
    }
  }

  const earnedBasic = Prisma.Decimal.max(basicSalary.minus(absenceDeduction).minus(lateDeduction), 0);

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

  // Symmetric accounting: Total Gross Earnings = Base Salary + Components
  // Total Deductions = Absence Deduction + Late Deduction + Deductions Components
  const totalEarnings = earnings.reduce((sum, e) => sum.plus(e.amount), basicSalary);
  const totalDeductions = deductions.reduce((sum, d) => sum.plus(d.amount), absenceDeduction.plus(lateDeduction));
  const netSalary = Prisma.Decimal.max(totalEarnings.minus(totalDeductions), 0);

  return {
    workingDays,
    presentDays,
    paidLeaveDays,
    unpaidLeaveDays,
    absentDays,
    lateDays,
    deductionDays,
    basicSalary,
    perDayRate,
    absenceDeduction,
    lateDeduction,
    earnedBasic,
    earnings,
    deductions,
    totalEarnings,
    totalDeductions,
    netSalary,
  };
}
