// Parser for the ZKTeco-style "ADMS" push protocol used by most common
// biometric attendance terminals. A device configured to push to this server
// POSTs its ATTLOG table as tab-separated lines to /api/iclock/cdata:
//
//   PIN\tDateTime\tStatus\tVerify\t...(reserved)
//   1001\t2024-01-15 09:03:12\t0\t1\t0\t0\t0\t0\t0
//
// Field meanings (Status = in/out flag, Verify = verification method) vary
// slightly between vendors/firmware, so only PIN and DateTime are treated as
// reliable — the aggregation engine derives check-in/check-out from the
// earliest/latest punch of the day rather than trusting the device's flag.
export type ParsedPunch = {
  biometricUserId: string;
  punchTime: Date;
  raw: string;
};

// "YYYY-MM-DD HH:mm:ss" -> a Date whose UTC getters equal the device's wall
// clock reading. The rest of the attendance engine (shift start/end times,
// aggregation, weekend checks) treats naive wall-clock values as "UTC
// nominal" for consistency, so this must NOT go through the JS Date
// constructor's timezone-dependent string parsing (which reads a
// timezone-less string as the server's local time, not UTC).
export function parseDeviceDateTime(dateTime: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/.exec(dateTime.trim());
  if (!match) return null;
  const [, y, mo, d, h, mi, s] = match.map(Number) as unknown as number[];
  return new Date(Date.UTC(y, mo - 1, d, h, mi, s));
}

export function parseAttLog(body: string): ParsedPunch[] {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  const punches: ParsedPunch[] = [];

  for (const line of lines) {
    const fields = line.split("\t");
    const [pin, dateTime] = fields;
    if (!pin || !dateTime) continue;

    const punchTime = parseDeviceDateTime(dateTime);
    if (!punchTime) continue;

    punches.push({ biometricUserId: pin, punchTime, raw: line });
  }

  return punches;
}
