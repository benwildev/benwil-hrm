import { prisma } from "@/lib/prisma";
import type { AttendanceSource } from "@/generated/prisma/client";
import { findHolidayForDate, isWeekend, getCompanyWeekendDays } from "@/server/attendance/calendar";
import { computeShiftMetrics } from "@/server/attendance/metrics";

// All dates/times are handled in UTC for simplicity, since there is no
// per-company timezone setting in the schema yet. Attendance "date" is the
// UTC calendar date of the earliest punch of the day.

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function aggregateAttendanceForDate(employeeId: string, date: Date) {
  const day = startOfUtcDay(date);
  const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);

  const employee = await prisma.employee.findUniqueOrThrow({
    where: { id: employeeId },
    include: { shift: true },
  });

  // Overnight shifts can have their checkout past midnight — widen the
  // search window by a day in that case.
  const windowEnd = employee.shift?.isOvernight
    ? new Date(nextDay.getTime() + 24 * 60 * 60 * 1000)
    : nextDay;

  const punches = await prisma.biometricLog.findMany({
    where: { employeeId, punchTime: { gte: day, lt: windowEnd } },
    orderBy: { punchTime: "asc" },
  });

  const holiday = await findHolidayForDate(day);

  const approvedLeave = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status: "APPROVED",
      startDate: { lte: day },
      endDate: { gte: day },
    },
  });

  // A prior manual correction on either side of the record wins over
  // whatever the raw punches say — re-aggregating (e.g. because a later
  // punch import touched this date) must never silently undo an admin edit.
  const existing = await prisma.attendanceRecord.findUnique({
    where: { employeeId_attendanceDate: { employeeId, attendanceDate: day } },
  });

  const checkIn =
    existing?.checkInSource === "MANUAL" ? existing.checkIn : (punches[0]?.punchTime ?? null);
  const checkOut =
    existing?.checkOutSource === "MANUAL"
      ? existing.checkOut
      : punches.length > 1
        ? punches[punches.length - 1].punchTime
        : null;

  let status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKEND" = "ABSENT";
  let lateMinutes = 0;
  let earlyLeaveMinutes = 0;
  let workMinutes = 0;
  let overtimeMinutes = 0;
  let checkInSource: AttendanceSource | null = null;
  let checkOutSource: AttendanceSource | null = null;

  if (holiday) {
    status = "HOLIDAY";
  } else if (approvedLeave) {
    status = "LEAVE";
  } else if (!checkIn) {
    const weekendDays = await getCompanyWeekendDays();
    status = isWeekend(day, weekendDays) ? "WEEKEND" : "ABSENT";
  } else {
    checkInSource = existing?.checkInSource === "MANUAL" ? "MANUAL" : "BIOMETRIC";
    if (checkOut) {
      checkOutSource = existing?.checkOutSource === "MANUAL" ? "MANUAL" : "BIOMETRIC";
    }

    status = "PRESENT";

    const metrics = computeShiftMetrics(day, checkIn, checkOut, employee.shift);
    lateMinutes = metrics.lateMinutes;
    earlyLeaveMinutes = metrics.earlyLeaveMinutes;
    workMinutes = metrics.workMinutes;
    overtimeMinutes = metrics.overtimeMinutes;
    if (metrics.isLate) status = "LATE";
  }

  const result = await prisma.attendanceRecord.upsert({
    where: { employeeId_attendanceDate: { employeeId, attendanceDate: day } },
    create: {
      employeeId,
      shiftId: employee.shiftId,
      attendanceDate: day,
      checkIn,
      checkOut,
      workMinutes,
      lateMinutes,
      earlyLeaveMinutes,
      overtimeMinutes,
      status,
      checkInSource,
      checkOutSource,
    },
    update: {
      shiftId: employee.shiftId,
      checkIn,
      checkOut,
      workMinutes,
      lateMinutes,
      earlyLeaveMinutes,
      overtimeMinutes,
      status,
      checkInSource,
      checkOutSource,
    },
  });

  // Mark the raw punches that fed this computation as processed — purely a
  // troubleshooting/observability signal (e.g. "which raw punches never
  // made it into any attendance record"). Re-aggregation always recomputes
  // from every raw punch in the window regardless of this flag, so it is
  // never used as a gate and re-running this function is still fully
  // idempotent.
  if (punches.length > 0) {
    await prisma.biometricLog.updateMany({
      where: { id: { in: punches.map((p) => p.id) }, isProcessed: false },
      data: { isProcessed: true, processedAt: new Date() },
    });
  }

  return result;
}
