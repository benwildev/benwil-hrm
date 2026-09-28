import { prisma } from "@/lib/db"

export interface AttendanceLogDTO {
  id: string
  timestamp: string
  punchType: string
  employeeId: string | null
  employeeName: string | null
  employeeAvatar: string | null
  biometricUserId: string | null
  deviceName: string
}

class AttendanceService {
  async touchDevice(serialNumber: string, ipAddress: string | null) {
    const now = new Date()
    return prisma.biometric_devices.upsert({
      where: { device_identifier: serialNumber },
      update: {
        last_sync_at: now,
        updated_at: now,
        ...(ipAddress ? { ip_address: ipAddress } : {}),
      },
      create: {
        device_identifier: serialNumber,
        device_name: serialNumber,
        device_type: "ZKTeco",
        ip_address: ipAddress ?? undefined,
        last_sync_at: now,
        updated_at: now,
      },
    })
  }

  /**
   * Parses a raw ATTLOG upload body (one punch per line, tab-separated:
   * PIN, timestamp, status, verify mode, work code, ...) and persists each
   * punch into biometric_logs, resolving employee_id by matching the
   * device's enrolled PIN against employees.employee_code.
   */
  async recordAttLog(serialNumber: string, body: string): Promise<number> {
    const device = await this.touchDevice(serialNumber, null)

    const lines = body.split("\n").map((line) => line.trim()).filter(Boolean)
    let stored = 0

    for (const line of lines) {
      const fields = line.split("\t")
      const [pin, timestampRaw, statusRaw, verifyRaw] = fields
      if (!pin || !timestampRaw) continue

      const punchTime = new Date(timestampRaw.replace(" ", "T"))
      if (Number.isNaN(punchTime.getTime())) continue

      const status = statusRaw ? Number.parseInt(statusRaw, 10) : null
      const punchType = status === 0 ? "CHECK_IN" : status === 1 ? "CHECK_OUT" : "UNKNOWN"
      const deviceEventId = `${pin}@${timestampRaw}`

      const employee = await prisma.employees.findUnique({
        where: { employee_code: pin },
        select: { id: true },
      })

      try {
        await prisma.biometric_logs.upsert({
          where: {
            device_id_device_event_id: {
              device_id: device.id,
              device_event_id: deviceEventId,
            },
          },
          update: {},
          create: {
            device_id: device.id,
            device_event_id: deviceEventId,
            biometric_user_id: pin,
            employee_id: employee?.id ?? null,
            punch_time: punchTime,
            punch_type: punchType,
            raw_data: {
              line,
              statusCode: status,
              verifyMode: verifyRaw ? Number.parseInt(verifyRaw, 10) : null,
            },
          },
        })
        stored += 1
      } catch {
        // Skip rows that fail to persist; the rest of the batch still lands.
      }
    }

    return stored
  }

  async listRecent(limit = 100): Promise<AttendanceLogDTO[]> {
    const logs = await prisma.biometric_logs.findMany({
      take: limit,
      orderBy: { punch_time: "desc" },
      include: { employees: true, biometric_devices: true },
    })

    return logs.map((log) => ({
      id: log.id,
      timestamp: log.punch_time.toISOString(),
      punchType: log.punch_type,
      employeeId: log.employee_id,
      employeeName: log.employees?.full_name ?? null,
      employeeAvatar: log.employees?.profile_photo_url ?? null,
      biometricUserId: log.biometric_user_id,
      deviceName: log.biometric_devices?.device_name ?? "Unknown device",
    }))
  }
}

export const attendanceService = new AttendanceService()
