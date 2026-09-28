import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export async function listHolidays() {
  await requirePermission(PERMISSIONS.ATTENDANCE_POLICY_MANAGE);
  return prisma.holiday.findMany({ orderBy: { date: "asc" } });
}

export async function createHoliday(input: { date: string; name: string; isRecurringYearly: boolean }) {
  await requirePermission(PERMISSIONS.ATTENDANCE_POLICY_MANAGE);
  return prisma.holiday.create({
    data: {
      date: new Date(`${input.date}T00:00:00.000Z`),
      name: input.name,
      isRecurringYearly: input.isRecurringYearly,
    },
  });
}

export async function deleteHoliday(id: string) {
  await requirePermission(PERMISSIONS.ATTENDANCE_POLICY_MANAGE);
  await prisma.holiday.delete({ where: { id } });
}
