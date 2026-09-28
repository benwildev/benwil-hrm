import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { isWeekend, getHolidayChecker, nowAsUtcNominal } from "@/server/attendance/calendar";

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export interface DashboardActivity {
  id: string;
  type: "PUNCH" | "LEAVE" | "ATTENDANCE";
  title: string;
  description: string;
  timestamp: string;
  timeFormatted: string;
  employeeName: string;
  employeeCode?: string;
  employeePhoto?: string | null;
  badgeText: string;
  badgeVariant: "emerald" | "amber" | "rose" | "blue";
}

function formatTime(d: Date): string {
  const hours = d.getUTCHours();
  const mins = d.getUTCMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${mins} ${ampm}`;
}

export async function getCompanyDashboard() {
  const user = await requireUser();
  const canViewCompanyWide =
    user.roleName === "Admin" ||
    user.permissions.includes(PERMISSIONS.EMPLOYEES_MANAGE) ||
    user.permissions.includes(PERMISSIONS.ATTENDANCE_POLICY_MANAGE);
  if (!canViewCompanyWide) return null;

  const now = nowAsUtcNominal();
  const today = startOfUtcDay(now);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const [
    employeeCount,
    todayRecords,
    pendingLeaveCount,
    currentPeriod,
    recentPunches,
    recentLeaves,
    recentAttendance,
  ] = await Promise.all([
    prisma.employee.count({ where: { deletedAt: null } }),
    prisma.attendanceRecord.findMany({ where: { attendanceDate: today } }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.payrollPeriod.findFirst({
      where: { year: today.getUTCFullYear(), month: today.getUTCMonth() + 1 },
    }),
    prisma.biometricLog.findMany({
      where: {
        punchTime: { gte: today, lt: tomorrow },
      },
      take: 10,
      orderBy: { punchTime: "desc" },
      include: {
        employee: { select: { fullName: true, employeeCode: true, profilePhotoUrl: true } },
      },
    }),
    prisma.leaveRequest.findMany({
      where: {
        createdAt: { gte: today, lt: tomorrow },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        employee: { select: { fullName: true, employeeCode: true, profilePhotoUrl: true } },
        leaveType: { select: { name: true } },
      },
    }),
    prisma.attendanceRecord.findMany({
      where: {
        attendanceDate: today,
        OR: [
          { checkIn: { not: null } },
          { checkOut: { not: null } },
        ],
      },
      take: 10,
      orderBy: { updatedAt: "desc" },
      include: {
        employee: { select: { fullName: true, employeeCode: true, profilePhotoUrl: true } },
      },
    }),
  ]);

  const present = todayRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const late = todayRecords.filter((r) => r.status === "LATE").length;
  const absent = employeeCount - todayRecords.length + todayRecords.filter((r) => r.status === "ABSENT").length;

  const isHoliday = await getHolidayChecker();
  const trendDays: Date[] = [];
  for (let i = 13; i >= 0; i--) {
    trendDays.push(new Date(today.getTime() - i * 24 * 60 * 60 * 1000));
  }

  const trendRecords = await prisma.attendanceRecord.findMany({
    where: { attendanceDate: { gte: trendDays[0], lte: trendDays[trendDays.length - 1] } },
  });
  const byDate = new Map<string, { present: number; late: number; absent: number }>();
  for (const day of trendDays) {
    byDate.set(day.toISOString(), { present: 0, late: 0, absent: 0 });
  }
  for (const r of trendRecords) {
    const bucket = byDate.get(r.attendanceDate.toISOString());
    if (!bucket) continue;
    if (r.status === "PRESENT") bucket.present++;
    else if (r.status === "LATE") bucket.late++;
    else if (r.status === "ABSENT") bucket.absent++;
  }

  const trend = trendDays
    .filter((d) => !isWeekend(d) && !isHoliday(d))
    .map((day) => {
      const bucket = byDate.get(day.toISOString())!;
      return {
        date: day.toISOString().slice(5, 10),
        present: bucket.present,
        late: bucket.late,
        absent: bucket.absent,
      };
    });

  // Assemble Live Activity List
  const activities: DashboardActivity[] = [];

  for (const p of recentPunches) {
    activities.push({
      id: `punch-${p.id}`,
      type: "PUNCH",
      title: p.employee?.fullName ?? "Biometric Punch",
      description: p.punchType === "CHECK_IN" ? "Clocked in (Biometric)" : p.punchType === "CHECK_OUT" ? "Clocked out (Biometric)" : "Punch recorded",
      timestamp: p.punchTime.toISOString(),
      timeFormatted: formatTime(p.punchTime),
      employeeName: p.employee?.fullName ?? "Employee",
      employeeCode: p.employee?.employeeCode,
      employeePhoto: p.employee?.profilePhotoUrl,
      badgeText: p.punchType === "CHECK_IN" ? "Clock In" : "Clock Out",
      badgeVariant: p.punchType === "CHECK_IN" ? "emerald" : "blue",
    });
  }

  for (const l of recentLeaves) {
    const isPending = l.status === "PENDING";
    const isApproved = l.status === "APPROVED";
    activities.push({
      id: `leave-${l.id}`,
      type: "LEAVE",
      title: l.employee.fullName,
      description: isPending
        ? `Applied for ${l.leaveType.name} (${l.totalDays.toString()}d)`
        : `${isApproved ? "Approved" : "Rejected"}: ${l.leaveType.name} (${l.totalDays.toString()}d)`,
      timestamp: l.createdAt.toISOString(),
      timeFormatted: formatTime(l.createdAt),
      employeeName: l.employee.fullName,
      employeeCode: l.employee.employeeCode,
      employeePhoto: l.employee.profilePhotoUrl,
      badgeText: isPending ? "Leave Req" : isApproved ? "Approved" : "Rejected",
      badgeVariant: isPending ? "amber" : isApproved ? "emerald" : "rose",
    });
  }

  for (const a of recentAttendance) {
    if (a.checkIn) {
      activities.push({
        id: `att-in-${a.id}`,
        type: "ATTENDANCE",
        title: a.employee.fullName,
        description: a.status === "LATE" ? `Clocked in late (${a.lateMinutes}m)` : "Clocked in on schedule",
        timestamp: a.checkIn.toISOString(),
        timeFormatted: formatTime(a.checkIn),
        employeeName: a.employee.fullName,
        employeeCode: a.employee.employeeCode,
        employeePhoto: a.employee.profilePhotoUrl,
        badgeText: a.status === "LATE" ? "Late Check-in" : "Check-in",
        badgeVariant: a.status === "LATE" ? "amber" : "emerald",
      });
    }
    if (a.checkOut) {
      activities.push({
        id: `att-out-${a.id}`,
        type: "ATTENDANCE",
        title: a.employee.fullName,
        description: "Clocked out",
        timestamp: a.checkOut.toISOString(),
        timeFormatted: formatTime(a.checkOut),
        employeeName: a.employee.fullName,
        employeeCode: a.employee.employeeCode,
        employeePhoto: a.employee.profilePhotoUrl,
        badgeText: "Check-out",
        badgeVariant: "blue",
      });
    }
  }

  // Sort descending by timestamp and take top 6
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recentActivities = activities.slice(0, 6);

  return {
    employeeCount,
    todayPresent: present,
    todayLate: late,
    todayAbsent: Math.max(0, absent),
    pendingLeaveCount,
    payrollStatus: currentPeriod?.status ?? "NOT_STARTED",
    trend,
    recentActivities,
  };
}

export async function getMyDashboard() {
  const user = await requireUser();
  if (!user.employeeId) return null;

  const now = nowAsUtcNominal();
  const today = startOfUtcDay(now);
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [
    employee,
    todayRecord,
    monthRecords,
    myPendingLeave,
    leaveBalances,
    recentLeaves,
    latestPayslip,
  ] = await Promise.all([
    prisma.employee.findUnique({
      where: { id: user.employeeId },
      include: {
        shift: true,
        department: true,
        designation: true,
      },
    }),
    prisma.attendanceRecord.findUnique({
      where: { employeeId_attendanceDate: { employeeId: user.employeeId, attendanceDate: today } },
    }),
    prisma.attendanceRecord.findMany({
      where: {
        employeeId: user.employeeId,
        attendanceDate: { gte: startOfMonth, lte: today },
      },
      orderBy: { attendanceDate: "desc" },
    }),
    prisma.leaveRequest.count({ where: { employeeId: user.employeeId, status: "PENDING" } }),
    prisma.employeeLeaveBalance.findMany({
      where: { employeeId: user.employeeId, year: now.getUTCFullYear() },
      include: { leaveType: true },
    }),
    prisma.leaveRequest.findMany({
      where: { employeeId: user.employeeId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { leaveType: true },
    }),
    prisma.payrollRecord.findFirst({
      where: { employeeId: user.employeeId },
      orderBy: { createdAt: "desc" },
      include: { payrollPeriod: true },
    }),
  ]);

  const presentDays = monthRecords.filter(
    (r) => r.status === "PRESENT" || r.status === "LATE" || r.status === "HALF_DAY"
  ).length;
  const lateDays = monthRecords.filter((r) => r.status === "LATE").length;
  const totalWorkedMinutes = monthRecords.reduce((acc, r) => acc + (r.workMinutes || 0), 0);
  const totalWorkedHours = (totalWorkedMinutes / 60).toFixed(1);

  const totalRemainingLeave = leaveBalances.reduce(
    (acc, b) => acc + Number(b.remainingDays ?? 0),
    0
  );

  return {
    todayStatus: todayRecord?.status ?? null,
    todayCheckIn: todayRecord?.checkIn ?? null,
    todayCheckOut: todayRecord?.checkOut ?? null,
    myPendingLeave,
    presentDaysThisMonth: presentDays,
    lateDaysThisMonth: lateDays,
    totalWorkedHoursThisMonth: totalWorkedHours,
    totalRemainingLeave,
    shift: employee?.shift
      ? {
          name: employee.shift.name,
          startTime: employee.shift.startTime ? formatTime(employee.shift.startTime) : null,
          endTime: employee.shift.endTime ? formatTime(employee.shift.endTime) : null,
        }
      : null,
    recentAttendance: monthRecords.slice(0, 7).map((r) => ({
      id: r.id,
      date: r.attendanceDate.toISOString(),
      status: r.status,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      workMinutes: r.workMinutes,
      lateMinutes: r.lateMinutes,
    })),
    recentLeaves: recentLeaves.map((l: { id: string; leaveType: { name: string }; startDate: Date; endDate: Date; totalDays: { toString(): string }; status: string; reason: string | null }) => ({
      id: l.id,
      typeName: l.leaveType.name,
      startDate: l.startDate.toISOString(),
      endDate: l.endDate.toISOString(),
      totalDays: l.totalDays.toString(),
      status: l.status,
      reason: l.reason,
    })),
    latestPayslip: latestPayslip
      ? {
          id: latestPayslip.id,
          payrollPeriodId: latestPayslip.payrollPeriodId,
          periodName: `${latestPayslip.payrollPeriod.year}-${String(latestPayslip.payrollPeriod.month).padStart(2, "0")}`,
          netSalary: latestPayslip.netSalary.toString(),
        }
      : null,
  };
}

