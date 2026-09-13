import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireEmployeeAccess } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export async function listBalancesForEmployee(employeeId: string, year: number) {
  // Leave balances are private HR data, not directory data — EMPLOYEES_VIEW
  // (granted to every base "Employee" role) must not grant this.
  await requireEmployeeAccess(employeeId, PERMISSIONS.EMPLOYEES_MANAGE);

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
//
// This uses an atomic SQL increment/decrement (`{ increment/decrement }`,
// which compiles to `SET col = col + delta`) rather than the previous
// read-in-JS-then-write pattern. That matters because two leave requests for
// the same employee/leave-type/year can be approved concurrently by two
// different reviewers (or two rapid clicks) — a read-then-write would let
// both transactions read the same starting value and one update clobber the
// other's. An atomic increment is applied under the row's own lock, so
// concurrent approvals/cancellations always sum correctly.
export async function adjustUsedDays(
  tx: Prisma.TransactionClient,
  employeeId: string,
  leaveTypeId: string,
  year: number,
  deltaDays: Prisma.Decimal | number,
) {
  const updated = await tx.employeeLeaveBalance.updateMany({
    where: { employeeId, leaveTypeId, year },
    data: {
      usedDays: { increment: deltaDays },
      remainingDays: { decrement: deltaDays },
    },
  });

  if (updated.count > 0) return;

  // No balance row yet for this employee/leaveType/year — seed one from the
  // leave type's default allocation.
  const leaveType = await tx.leaveType.findUniqueOrThrow({ where: { id: leaveTypeId } });
  const allocatedDays = new Prisma.Decimal(leaveType.daysPerYear ?? 0);
  const usedDays = new Prisma.Decimal(deltaDays);

  try {
    await tx.employeeLeaveBalance.create({
      data: {
        employeeId,
        leaveTypeId,
        year,
        allocatedDays,
        usedDays,
        remainingDays: allocatedDays.minus(usedDays),
      },
    });
  } catch (error) {
    // Another concurrent request created the row first (unique constraint
    // violation) — the row exists now, so fall back to the atomic update.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      await tx.employeeLeaveBalance.update({
        where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year } },
        data: { usedDays: { increment: deltaDays }, remainingDays: { decrement: deltaDays } },
      });
    } else {
      throw error;
    }
  }
}
