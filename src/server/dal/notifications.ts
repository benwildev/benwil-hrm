import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { nowAsUtcNominal } from "@/server/attendance/calendar";

export interface LiveNotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  unread: boolean;
  type: "leave" | "attendance" | "payroll" | "system";
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function getLiveNotifications(): Promise<LiveNotificationItem[]> {
  const user = await requireUser();
  const notifications: LiveNotificationItem[] = [];
  const today = startOfUtcDay(nowAsUtcNominal());

  const canApproveLeave = user.permissions.includes(PERMISSIONS.LEAVE_APPROVE);
  const canViewAttendance = user.permissions.includes(PERMISSIONS.EMPLOYEES_VIEW);
  const canRunPayroll = user.permissions.includes(PERMISSIONS.PAYROLL_RUN);

  // 1. Leave approvals for managers / admins
  if (canApproveLeave) {
    const pendingLeaves = await prisma.leaveRequest.findMany({
      where: { status: "PENDING" },
      include: {
        employee: { select: { fullName: true } },
        leaveType: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    for (const req of pendingLeaves) {
      notifications.push({
        id: `leave-${req.id}`,
        title: "Leave Approval Required",
        description: `${req.employee.fullName} requested ${req.totalDays} day(s) (${req.leaveType.name}).`,
        time: "Pending",
        href: "/leave",
        unread: true,
        type: "leave",
      });
    }
  } else if (user.employeeId) {
    // For regular employees: their recent reviewed requests
    const recentReviewed = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: user.employeeId,
        status: { in: ["APPROVED", "REJECTED"] },
      },
      include: { leaveType: { select: { name: true } } },
      orderBy: { reviewedAt: "desc" },
    });

    if (recentReviewed && recentReviewed.reviewedAt) {
      notifications.push({
        id: `my-leave-${recentReviewed.id}`,
        title: `Leave ${recentReviewed.status === "APPROVED" ? "Approved" : "Rejected"}`,
        description: `Your ${recentReviewed.leaveType.name} request was ${recentReviewed.status.toLowerCase()}.`,
        time: "Recent",
        href: "/leave",
        unread: false,
        type: "leave",
      });
    }
  }

  // 2. Attendance alerts for HR / Admin
  if (canViewAttendance) {
    const lateCount = await prisma.attendanceRecord.count({
      where: { attendanceDate: today, status: "LATE" },
    });

    if (lateCount > 0) {
      notifications.push({
        id: `att-late-${today.toISOString()}`,
        title: "Late Check-in Alert",
        description: `${lateCount} staff member(s) arrived late today.`,
        time: "Today",
        href: "/attendance",
        unread: true,
        type: "attendance",
      });
    }
  }

  // 3. Payroll cycle alerts
  if (canRunPayroll) {
    const currentPeriod = await prisma.payrollPeriod.findFirst({
      where: { year: today.getUTCFullYear(), month: today.getUTCMonth() + 1 },
    });

    if (currentPeriod && currentPeriod.status !== "COMPLETED" && currentPeriod.status !== "LOCKED") {
      notifications.push({
        id: `payroll-${currentPeriod.id}`,
        title: "Payroll Cycle Open",
        description: `Current payroll period is in ${currentPeriod.status.toLowerCase()} status.`,
        time: "Cycle active",
        href: `/payroll/${currentPeriod.id}`,
        unread: currentPeriod.status === "DRAFT",
        type: "payroll",
      });
    }
  }

  // Fallback system notification if no active tasks
  if (notifications.length === 0) {
    notifications.push({
      id: "sys-all-clear",
      title: "All Clear",
      description: "No pending approvals, payroll actions, or attendance flags.",
      time: "Now",
      href: "/dashboard",
      unread: false,
      type: "system",
    });
  }

  return notifications;
}
