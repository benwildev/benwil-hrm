import { prisma } from "@/lib/prisma";
import { aggregateAttendanceForDate } from "@/server/attendance/aggregate";
import { fingerprint } from "@/server/attendance/fingerprint";
import type { ParsedPunch } from "@/server/integrations/adms/parse";

function dayKey(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

// CSV imports have no physical device behind them. SQL treats every NULL in
// a unique index as distinct from every other NULL, so a null deviceId
// would silently defeat the dedup constraint above for that path — instead,
// route CSV imports through one well-known placeholder device row so every
// BiometricLog always has a real, non-null deviceId.
const CSV_IMPORT_DEVICE_IDENTIFIER = "__csv_import__";
async function resolveCsvImportDeviceId(): Promise<string> {
  const device = await prisma.biometricDevice.upsert({
    where: { deviceIdentifier: CSV_IMPORT_DEVICE_IDENTIFIER },
    update: {},
    create: {
      deviceIdentifier: CSV_IMPORT_DEVICE_IDENTIFIER,
      deviceName: "CSV Import",
      deviceType: "CSV",
      status: "virtual",
    },
  });
  return device.id;
}

export type IngestSource = "DEVICE_ADMS" | "CSV_IMPORT";

export async function ingestPunches(
  punches: ParsedPunch[],
  options: { deviceId?: string | null } = {},
) {
  const deviceId = options.deviceId ?? (await resolveCsvImportDeviceId());

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

  const logData = punches.map((punch) => {
    const employeeId = employeeByPin.get(punch.biometricUserId) ?? null;
    if (employeeId) {
      matched++;
      const day = new Date(dayKey(punch.punchTime));
      affected.set(`${employeeId}:${day.toISOString()}`, { employeeId, date: day });
    } else {
      unmatched++;
    }
    return {
      employeeId,
      deviceId,
      biometricUserId: punch.biometricUserId,
      punchTime: punch.punchTime,
      punchType: "UNKNOWN" as const,
      deviceEventId: fingerprint(deviceId, punch.biometricUserId, punch.punchTime, punch.raw),
      rawData: { raw: punch.raw },
    };
  });

  if (logData.length > 0) {
    // A device retrying/resending the same event (or the same CSV file
    // being re-imported) now safely no-ops instead of creating a duplicate
    // row or throwing on the unique constraint.
    await prisma.biometricLog.createMany({
      data: logData,
      skipDuplicates: true,
    });
  }

  for (const { employeeId, date } of affected.values()) {
    await aggregateAttendanceForDate(employeeId, date);
  }

  return { matched, unmatched, recordsAffected: affected.size };
}
