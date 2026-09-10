import { prisma } from "@/lib/prisma";
import { requirePermission, requireUser } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { adjustUsedDays } from "@/server/dal/leave-balances";

function toUtcDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function countDays(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

export async function listMyLeaveRequests() {
  const user = await requireUser();
  if (!user.employeeId) return [];
  return prisma.leaveRequest.findMany({
    where: { employeeId: user.employeeId },
    include: { leaveType: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listPendingLeaveRequests() {
  await requirePermission(PERMISSIONS.LEAVE_APPROVE);
  return prisma.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: { leaveType: true, employee: { select: { id: true, fullName: true, employeeCode: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function listAllLeaveRequests() {
  await requirePermission(PERMISSIONS.LEAVE_APPROVE);
  return prisma.leaveRequest.findMany({
    include: { leaveType: true, employee: { select: { id: true, fullName: true, employeeCode: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function applyForLeave(input: {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}) {
  const user = await requireUser();
  if (!user.employeeId) {
    throw new Error("Only employees with a linked profile can apply for leave.");
  }

  const startDate = toUtcDate(input.startDate);
  const endDate = toUtcDate(input.endDate);
  if (endDate.getTime() < startDate.getTime()) {
    throw new Error("End date must be on or after the start date.");
  }
  const totalDays = countDays(startDate, endDate);

  return prisma.leaveRequest.create({
    data: {
      employeeId: user.employeeId,
      leaveTypeId: input.leaveTypeId,
      startDate,
      endDate,
      totalDays,
      reason: input.reason,
      status: "PENDING",
    },
  });
}

export async function cancelLeaveRequest(requestId: string) {
  const user = await requireUser();
  const request = await prisma.leaveRequest.findUniqueOrThrow({ where: { id: requestId } });

  const isOwner = user.employeeId === request.employeeId;
  const canApprove = user.permissions.includes(PERMISSIONS.LEAVE_APPROVE);
  if (!isOwner && !canApprove) {
    throw new Error("Not authorized to cancel this leave request.");
  }
  if (request.status === "CANCELLED" || request.status === "REJECTED") {
    return request;
  }

  return prisma.$transaction(async (tx) => {
    if (request.status === "APPROVED") {
      await adjustUsedDays(
        tx,
        request.employeeId,
        request.leaveTypeId,
        request.startDate.getUTCFullYear(),
        -Number(request.totalDays),
      );
      await tx.attendanceRecord.updateMany({
        where: {
          employeeId: request.employeeId,
          attendanceDate: { gte: request.startDate, lte: request.endDate },
          status: "LEAVE",
        },
        data: { status: "ABSENT" },
      });
    }

    return tx.leaveRequest.update({ where: { id: requestId }, data: { status: "CANCELLED" } });
  });
}

export async function reviewLeaveRequest(
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  reviewNote?: string,
) {
  const user = await requirePermission(PERMISSIONS.LEAVE_APPROVE);
  const request = await prisma.leaveRequest.findUniqueOrThrow({ where: { id: requestId } });

  if (request.status !== "PENDING") {
    throw new Error("Only pending requests can be reviewed.");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: decision,
        reviewedById: user.id,
        reviewedAt: new Date(),
        reviewNote,
      },
    });

    if (decision === "APPROVED") {
      await adjustUsedDays(
        tx,
        request.employeeId,
        request.leaveTypeId,
        request.startDate.getUTCFullYear(),
        Number(request.totalDays),
      );

      // Materialize LEAVE attendance records for the range up front —
      // otherwise a future leave day with no punches would show as a
      // generic "absent" until something happened to trigger aggregation.
      const days: Date[] = [];
      for (
        let d = new Date(request.startDate);
        d.getTime() <= request.endDate.getTime();
        d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
      ) {
        days.push(new Date(d));
      }

      for (const day of days) {
        const existing = await tx.attendanceRecord.findUnique({
          where: { employeeId_attendanceDate: { employeeId: request.employeeId, attendanceDate: day } },
        });
        if (existing && (existing.status === "PRESENT" || existing.status === "LATE")) {
          continue; // already actually attended that day — don't overwrite
        }
        await tx.attendanceRecord.upsert({
          where: { employeeId_attendanceDate: { employeeId: request.employeeId, attendanceDate: day } },
          create: { employeeId: request.employeeId, attendanceDate: day, status: "LEAVE" },
          update: { status: "LEAVE" },
        });
      }
    }

    return updated;
  });
}
