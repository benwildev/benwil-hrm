import { parseDeviceDateTime, type ParsedPunch } from "@/server/integrations/adms/parse";

// Fallback for devices/exports that can't push directly: a simple CSV with
// a header row and columns `employeeCode,punchTime` (punchTime as
// "YYYY-MM-DD HH:MM:SS" or any format the JS Date constructor accepts).
export function parsePunchCsv(text: string): ParsedPunch[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const codeIdx = header.indexOf("employeecode");
  const timeIdx = header.indexOf("punchtime");
  if (codeIdx === -1 || timeIdx === -1) {
    throw new Error('CSV must have "employeeCode" and "punchTime" columns.');
  }

  const punches: ParsedPunch[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(",").map((c) => c.trim());
    const employeeCode = cols[codeIdx];
    const punchTimeRaw = cols[timeIdx];
    if (!employeeCode || !punchTimeRaw) continue;

    const punchTime = parseDeviceDateTime(punchTimeRaw);
    if (!punchTime) continue;

    punches.push({ biometricUserId: employeeCode, punchTime, raw: line });
  }

  return punches;
}
