import { prisma } from "@/lib/prisma";
import { getCompany } from "@/server/dal/company";

// The current moment, re-encoded so its UTC getters read like the server's
// local wall clock — matching the "naive wall clock stored as UTC" convention
// every other timestamp in this app uses (shift times, device punches, CSV
// imports).
export function nowAsUtcNominal() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()),
  );
}

export async function getCompanyWeekendDays(): Promise<number[]> {
  try {
    const company = await getCompany();
    const raw = company.weekendDays || "0,6";
    const days = raw.split(",").map((s) => Number(s.trim())).filter((n) => !isNaN(n));
    return days.length > 0 ? days : [0, 6];
  } catch {
    return [0, 6];
  }
}

export function isWeekend(date: Date, customWeekendDays: number[] = [0, 6]) {
  const day = date.getUTCDay();
  return customWeekendDays.includes(day);
}

export async function findHolidayForDate(day: Date) {
  const exact = await prisma.holiday.findFirst({ where: { date: day } });
  if (exact) return exact;

  const recurring = await prisma.holiday.findMany({ where: { isRecurringYearly: true } });
  return (
    recurring.find(
      (h) => h.date.getUTCMonth() === day.getUTCMonth() && h.date.getUTCDate() === day.getUTCDate(),
    ) ?? null
  );
}

// Fetches all holidays once and returns a fast local lookup — use this
// instead of findHolidayForDate in a loop over many days.
export async function getHolidayChecker() {
  const holidays = await prisma.holiday.findMany();
  return (day: Date) =>
    holidays.some(
      (h) =>
        (h.isRecurringYearly && h.date.getUTCMonth() === day.getUTCMonth() && h.date.getUTCDate() === day.getUTCDate()) ||
        (!h.isRecurringYearly && h.date.getTime() === day.getTime()),
    );
}

// The status a date would have if no attendance record exists for it yet
// (no punches were ever recorded) — used so weekends/holidays render
// correctly in the UI even before any aggregation has run for that day.
export async function defaultStatusForDate(day: Date): Promise<"HOLIDAY" | "WEEKEND" | "ABSENT"> {
  const holiday = await findHolidayForDate(day);
  if (holiday) return "HOLIDAY";
  const weekendDays = await getCompanyWeekendDays();
  if (isWeekend(day, weekendDays)) return "WEEKEND";
  return "ABSENT";
}
