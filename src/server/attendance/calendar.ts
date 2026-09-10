import { prisma } from "@/lib/prisma";

// The current moment, re-encoded so its UTC getters read like the server's
// local wall clock — matching the "naive wall clock stored as UTC" convention
// every other timestamp in this app uses (shift times, device punches, CSV
// imports). Correct as long as the server process runs in the company's own
// timezone, which is the assumption this whole convention rests on.
export function nowAsUtcNominal() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()),
  );
}

export function isWeekend(date: Date) {
  const day = date.getUTCDay();
  return day === 0 || day === 6; // Sunday, Saturday
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
  if (isWeekend(day)) return "WEEKEND";
  return "ABSENT";
}
