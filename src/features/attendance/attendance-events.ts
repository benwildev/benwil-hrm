export interface AttendanceLog {
  id: string
  timestamp: string
  punchType: string
  employeeId: string | null
  employeeName: string | null
  employeeAvatar: string | null
  biometricUserId: string | null
  deviceName: string
}

const PUNCH_TYPE_LABELS: Record<string, string> = {
  CHECK_IN: "Checked In",
  CHECK_OUT: "Checked Out",
  UNKNOWN: "Punch",
}

export function punchTypeLabel(punchType: string): string {
  return PUNCH_TYPE_LABELS[punchType] ?? punchType
}
