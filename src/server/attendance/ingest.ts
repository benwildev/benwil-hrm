import { prisma } from "@/lib/prisma";
import { aggregateAttendanceForDate } from "@/server/attendance/aggregate";
import type { ParsedPunch } from "@/server/integrations/adms/parse";

function dayKey(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export type IngestSource = "DEVICE_ADMS" | "CSV_IMPORT";

export async function ingestPunches(
  punches: ParsedPunch[],
  options: { deviceId?: string | null } = {},
) {
  // Employee device PINs are assumed to match the employee code — the
  // convention to use when enrolling fingerprints on the physical terminal.
  const pins = [...new Set(punches.map((p) => p.biometricUserId))];
  const employees = await prisma.employee.findMany({
    where: { employeeCode: { in: pins } },
    select: { id: true, employeeCode: true },
  });
  const employeeByPin = new Map(employees.map((e) => [e.employeeCode, e.id]));

  const affected = new Map<string, { employeeId: string; date: Date }>();
  let matched = 0;
  let unmatched = 0;

  for (const punch of punches) {
    const employeeId = employeeByPin.get(punch.biometricUserId) ?? null;
    if (employeeId) matched++;
    else unmatched++;

    await prisma.biometricLog.create({
      data: {
        employeeId,
        deviceId: options.deviceId,
        biometricUserId: punch.biometricUserId,
        punchTime: punch.punchTime,
        punchType: "UNKNOWN",
        rawData: { raw: punch.raw },
      },
    });

    if (employeeId) {
      const day = new Date(dayKey(punch.punchTime));
      affected.set(`${employeeId}:${day.toISOString()}`, { employeeId, date: day });
    }
  }

  for (const { employeeId, date } of affected.values()) {
    await aggregateAttendanceForDate(employeeId, date);
  }

  return { matched, unmatched, recordsAffected: affected.size };
}
