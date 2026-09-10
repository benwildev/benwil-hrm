import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { isWeekend, getHolidayChecker, nowAsUtcNominal } from "@/server/attendance/calendar";

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function getCompanyDashboard() {
  const user = await requireUser();
  const canViewCompanyWide = user.permissions.includes(PERMISSIONS.EMPLOYEES_VIEW);
  if (!canViewCompanyWide) return null;

  const today = startOfUtcDay(nowAsUtcNominal());

  const [employeeCount, todayRecords, pendingLeaveCount, currentPeriod] = await Promise.all([
    prisma.employee.count({ where: { deletedAt: null } }),
    prisma.attendanceRecord.findMany({ where: { attendanceDate: today } }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.payrollPeriod.findFirst({
      where: { year: today.getUTCFullYear(), month: today.getUTCMonth() + 1 },
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

  return {
    employeeCount,
    todayPresent: present,
    todayLate: late,
    todayAbsent: Math.max(0, absent),
    pendingLeaveCount,
    payrollStatus: currentPeriod?.status ?? "NOT_STARTED",
    trend,
  };
}

export async function getMyDashboard() {
  const user = await requireUser();
  if (!user.employeeId) return null;

  const today = startOfUtcDay(nowAsUtcNominal());

  const [todayRecord, myPendingLeave, latestPayslip] = await Promise.all([
    prisma.attendanceRecord.findUnique({
      where: { employeeId_attendanceDate: { employeeId: user.employeeId, attendanceDate: today } },
    }),
    prisma.leaveRequest.count({ where: { employeeId: user.employeeId, status: "PENDING" } }),
    prisma.payrollRecord.findFirst({
      where: { employeeId: user.employeeId },
      orderBy: { createdAt: "desc" },
      include: { payrollPeriod: true },
    }),
  ]);

  return {
    todayStatus: todayRecord?.status ?? null,
    todayCheckIn: todayRecord?.checkIn ?? null,
    todayCheckOut: todayRecord?.checkOut ?? null,
    myPendingLeave,
    latestPayslip,
  };
}
