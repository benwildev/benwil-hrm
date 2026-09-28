import type { PrismaClient } from "../src/generated/prisma/client";

// Shift.name has no unique constraint in the schema, so these are matched
// by name manually (find-then-create/update) rather than via prisma's
// upsert(), which requires a unique `where`. Re-running this is safe and
// idempotent either way.
export const DEFAULT_SHIFTS = [
  {
    name: "General Shift",
    startTime: "09:00",
    endTime: "17:40",
    gracePeriodMinutes: 10,
    breakMinutes: 0,
    requiredWorkMinutes: 520, // 8h40m
    isOvernight: false,
  },
  {
    name: "Hindu College Shift",
    startTime: "09:00",
    endTime: "17:30",
    gracePeriodMinutes: 10,
    breakMinutes: 0,
    requiredWorkMinutes: 510, // 8h30m
    isOvernight: false,
  },
  {
    name: "Muslim Staff Shift",
    startTime: "09:00",
    endTime: "17:40",
    // A slightly wider grace than the other two shifts, to comfortably
    // absorb ordinary prayer-time arrival variance on top of the
    // duration-based lateness rule (see computeShiftMetrics).
    gracePeriodMinutes: 15,
    breakMinutes: 0,
    requiredWorkMinutes: 520, // 8h30m base + 10 min prayer allowance
    isOvernight: false,
  },
] as const;

function toTimeDate(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, h, m));
}

export async function seedDefaultShifts(prisma: PrismaClient) {
  for (const def of DEFAULT_SHIFTS) {
    const data = {
      name: def.name,
      startTime: toTimeDate(def.startTime),
      endTime: toTimeDate(def.endTime),
      gracePeriodMinutes: def.gracePeriodMinutes,
      breakMinutes: def.breakMinutes,
      requiredWorkMinutes: def.requiredWorkMinutes,
      isOvernight: def.isOvernight,
    };

    const existing = await prisma.shift.findFirst({ where: { name: def.name } });
    if (existing) {
      await prisma.shift.update({ where: { id: existing.id }, data });
    } else {
      await prisma.shift.create({ data });
    }
  }
}
