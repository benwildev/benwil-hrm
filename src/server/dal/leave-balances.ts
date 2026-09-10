import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireUser } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export async function listBalancesForEmployee(employeeId: string, year: number) {
  const user = await requireUser();
  const canViewAll = user.permissions.includes(PERMISSIONS.EMPLOYEES_VIEW);
  if (!canViewAll && user.employeeId !== employeeId) {
    throw new Error("Not authorized to view this employee's leave balances.");
  }

  const leaveTypes = await prisma.leaveType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const balances = await prisma.employeeLeaveBalance.findMany({ where: { employeeId, year } });
  const byType = new Map(balances.map((b) => [b.leaveTypeId, b]));

  return leaveTypes.map((leaveType) => {
    const balance = byType.get(leaveType.id);
    return {
      leaveType,
      allocatedDays: balance?.allocatedDays ?? new Prisma.Decimal(leaveType.daysPerYear ?? 0),
      usedDays: balance?.usedDays ?? new Prisma.Decimal(0),
      remainingDays:
        balance?.remainingDays ?? new Prisma.Decimal(leaveType.daysPerYear ?? 0),
    };
  });
}

export async function setLeaveAllocation(input: {
  employeeId: string;
  leaveTypeId: string;
  year: number;
  allocatedDays: number;
}) {
  await requirePermission(PERMISSIONS.LEAVE_TYPES_MANAGE);
  const existing = await prisma.employeeLeaveBalance.findUnique({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId: input.employeeId,
        leaveTypeId: input.leaveTypeId,
        year: input.year,
      },
    },
  });

  const usedDays = existing?.usedDays ?? new Prisma.Decimal(0);
  const remainingDays = new Prisma.Decimal(input.allocatedDays).minus(usedDays);

  return prisma.employeeLeaveBalance.upsert({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId: input.employeeId,
        leaveTypeId: input.leaveTypeId,
        year: input.year,
      },
    },
    create: {
      employeeId: input.employeeId,
      leaveTypeId: input.leaveTypeId,
      year: input.year,
      allocatedDays: input.allocatedDays,
      usedDays: 0,
      remainingDays: input.allocatedDays,
    },
    update: {
      allocatedDays: input.allocatedDays,
      remainingDays,
    },
  });
}

// Ensures a balance row exists (seeded from the leave type's default
// days-per-year) and applies a used-days delta, keeping remainingDays in
// sync. Used when a leave request is approved/cancelled.
export async function adjustUsedDays(
  tx: Prisma.TransactionClient,
  employeeId: string,
  leaveTypeId: string,
  year: number,
  deltaDays: Prisma.Decimal | number,
) {
  const leaveType = await tx.leaveType.findUniqueOrThrow({ where: { id: leaveTypeId } });
  const existing = await tx.employeeLeaveBalance.findUnique({
    where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year } },
  });

  const allocatedDays = existing?.allocatedDays ?? new Prisma.Decimal(leaveType.daysPerYear ?? 0);
  const usedDays = (existing?.usedDays ?? new Prisma.Decimal(0)).plus(deltaDays);
  const remainingDays = allocatedDays.minus(usedDays);

  await tx.employeeLeaveBalance.upsert({
    where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year } },
    create: { employeeId, leaveTypeId, year, allocatedDays, usedDays, remainingDays },
    update: { usedDays, remainingDays },
  });
}
