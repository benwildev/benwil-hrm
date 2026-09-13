import { prisma } from "@/lib/prisma";
import { requirePermission, requireUser, requireEmployeeAccess } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { logAudit } from "@/server/audit/audit";
import { aggregateAttendanceForDate } from "@/server/attendance/aggregate";
import { ingestPunches } from "@/server/attendance/ingest";
import { parsePunchCsv } from "@/server/attendance/csv";
import { computeShiftMetrics } from "@/server/attendance/metrics";
import { nowAsUtcNominal } from "@/server/attendance/calendar";

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function listAttendanceForDate(date: Date) {
  await requirePermission(PERMISSIONS.ATTENDANCE_VIEW_ALL);
  const day = startOfUtcDay(date);

  const employees = await prisma.employee.findMany({
    where: { deletedAt: null },
    select: { id: true, fullName: true, employeeCode: true, department: { select: { name: true } } },
    orderBy: { fullName: "asc" },
  });

  const records = await prisma.attendanceRecord.findMany({ where: { attendanceDate: day } });
  const byEmployee = new Map(records.map((r) => [r.employeeId, r]));

  return employees.map((employee) => ({
    employee,
    record: byEmployee.get(employee.id) ?? null,
  }));
}

export async function listAttendanceForEmployee(employeeId: string, year: number, month: number) {
  await requireEmployeeAccess(employeeId, PERMISSIONS.ATTENDANCE_VIEW_ALL);

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  return prisma.attendanceRecord.findMany({
    where: { employeeId, attendanceDate: { gte: start, lt: end } },
    orderBy: { attendanceDate: "asc" },
  });
}

export type ManualAttendanceInput = {
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "LEAVE" | "HOLIDAY" | "WEEKEND";
  reason: string;
};

function combineDateTime(dateStr: string, timeStr?: string) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":").map(Number);
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, m));
}

export async function setManualAttendance(input: ManualAttendanceInput) {
  const user = await requirePermission(PERMISSIONS.ATTENDANCE_MANAGE);
  const day = new Date(`${input.date}T00:00:00.000Z`);
  const newCheckIn = combineDateTime(input.date, input.checkIn);
  const newCheckOut = combineDateTime(input.date, input.checkOut);

  const [existing, employee] = await Promise.all([
    prisma.attendanceRecord.findUnique({
      where: { employeeId_attendanceDate: { employeeId: input.employeeId, attendanceDate: day } },
    }),
    prisma.employee.findUniqueOrThrow({ where: { id: input.employeeId }, include: { shift: true } }),
  ]);

  // A same-day checkout before check-in is only ever legitimate for an
  // overnight shift (where the "next day" checkout is intentionally
  // combined onto the shift's start date by combineDateTime's caller) —
  // for any other shift it's almost certainly a data-entry mistake, so
  // reject it here rather than silently storing negative work minutes.
  if (newCheckIn && newCheckOut && newCheckOut.getTime() < newCheckIn.getTime() && !employee.shift?.isOvernight) {
    throw new Error("Check-out time cannot be before check-in time for a non-overnight shift.");
  }

  // The admin's chosen status always wins, but the derived minute counters
  // must reflect the corrected times too — otherwise they'd stay stuck at
  // whatever the last automatic aggregation computed.
  const metrics = newCheckIn
    ? computeShiftMetrics(day, newCheckIn, newCheckOut, employee.shift)
    : { lateMinutes: 0, earlyLeaveMinutes: 0, workMinutes: 0, overtimeMinutes: 0 };

  const record = await prisma.attendanceRecord.upsert({
    where: { employeeId_attendanceDate: { employeeId: input.employeeId, attendanceDate: day } },
    create: {
      employeeId: input.employeeId,
      shiftId: employee.shiftId,
      attendanceDate: day,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      status: input.status,
      checkInSource: newCheckIn ? "MANUAL" : null,
      checkOutSource: newCheckOut ? "MANUAL" : null,
      lateMinutes: metrics.lateMinutes,
      earlyLeaveMinutes: metrics.earlyLeaveMinutes,
      workMinutes: metrics.workMinutes,
      overtimeMinutes: metrics.overtimeMinutes,
    },
    update: {
      shiftId: employee.shiftId,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      status: input.status,
      checkInSource: newCheckIn ? "MANUAL" : null,
      checkOutSource: newCheckOut ? "MANUAL" : null,
      lateMinutes: metrics.lateMinutes,
      earlyLeaveMinutes: metrics.earlyLeaveMinutes,
      workMinutes: metrics.workMinutes,
      overtimeMinutes: metrics.overtimeMinutes,
    },
  });

  await prisma.attendanceAdjustment.create({
    data: {
      attendanceId: record.id,
      employeeId: input.employeeId,
      oldCheckIn: existing?.checkIn ?? null,
      oldCheckOut: existing?.checkOut ?? null,
      newCheckIn,
      newCheckOut,
      reason: input.reason,
      adjustedById: user.id,
    },
  });

  await logAudit({
    actorId: user.id,
    action: "ATTENDANCE_MANUALLY_ADJUSTED",
    entityType: "AttendanceRecord",
    entityId: record.id,
    oldData: { checkIn: existing?.checkIn ?? null, checkOut: existing?.checkOut ?? null, status: existing?.status ?? null },
    newData: { checkIn: newCheckIn, checkOut: newCheckOut, status: input.status, reason: input.reason },
  });

  return record;
}

export async function importAttendanceCsv(text: string) {
  await requirePermission(PERMISSIONS.DEVICES_MANAGE);
  const punches = parsePunchCsv(text);
  if (punches.length === 0) {
    throw new Error("No valid rows found in the CSV.");
  }
  return ingestPunches(punches);
}

export async function reaggregateEmployeeDate(employeeId: string, date: Date) {
  await requirePermission(PERMISSIONS.ATTENDANCE_MANAGE);
  return aggregateAttendanceForDate(employeeId, date);
}

export async function getMyTodayAttendance() {
  const user = await requireUser();
  if (!user.employeeId) return null;
  const today = startOfUtcDay(nowAsUtcNominal());
  return prisma.attendanceRecord.findUnique({
    where: { employeeId_attendanceDate: { employeeId: user.employeeId, attendanceDate: today } },
  });
}

// Self-service punches, distinct from the admin `setManualAttendance` path:
// no AttendanceAdjustment audit row (this is the employee recording their
// own original attendance, not someone else correcting it), and always
// today's date — an employee can't back- or post-date their own punch.
export async function selfCheckIn() {
  const user = await requireUser();
  if (!user.employeeId) {
    throw new Error("Only employees with a linked profile can check in.");
  }

  const now = nowAsUtcNominal();
  const today = startOfUtcDay(now);

  const [existing, employee] = await Promise.all([
    prisma.attendanceRecord.findUnique({
      where: { employeeId_attendanceDate: { employeeId: user.employeeId, attendanceDate: today } },
    }),
    prisma.employee.findUniqueOrThrow({ where: { id: user.employeeId }, include: { shift: true } }),
  ]);

  if (existing?.checkIn) {
    throw new Error("You've already checked in today.");
  }

  const metrics = computeShiftMetrics(today, now, null, employee.shift);

  return prisma.attendanceRecord.upsert({
    where: { employeeId_attendanceDate: { employeeId: user.employeeId, attendanceDate: today } },
    create: {
      employeeId: user.employeeId,
      shiftId: employee.shiftId,
      attendanceDate: today,
      checkIn: now,
      checkInSource: "MANUAL",
      status: metrics.isLate ? "LATE" : "PRESENT",
      lateMinutes: metrics.lateMinutes,
    },
    update: {
      shiftId: employee.shiftId,
      checkIn: now,
      checkInSource: "MANUAL",
      status: metrics.isLate ? "LATE" : "PRESENT",
      lateMinutes: metrics.lateMinutes,
    },
  });
}

export async function selfCheckOut() {
  const user = await requireUser();
  if (!user.employeeId) {
    throw new Error("Only employees with a linked profile can check out.");
  }

  const now = nowAsUtcNominal();
  const today = startOfUtcDay(now);

  const [existing, employee] = await Promise.all([
    prisma.attendanceRecord.findUnique({
      where: { employeeId_attendanceDate: { employeeId: user.employeeId, attendanceDate: today } },
    }),
    prisma.employee.findUniqueOrThrow({ where: { id: user.employeeId }, include: { shift: true } }),
  ]);

  if (!existing?.checkIn) {
    throw new Error("You need to check in before you can check out.");
  }
  if (existing.checkOut) {
    throw new Error("You've already checked out today.");
  }

  const metrics = computeShiftMetrics(today, existing.checkIn, now, employee.shift);

  return prisma.attendanceRecord.update({
    where: { employeeId_attendanceDate: { employeeId: user.employeeId, attendanceDate: today } },
    data: {
      checkOut: now,
      checkOutSource: "MANUAL",
      workMinutes: metrics.workMinutes,
      earlyLeaveMinutes: metrics.earlyLeaveMinutes,
      overtimeMinutes: metrics.overtimeMinutes,
    },
  });
}
