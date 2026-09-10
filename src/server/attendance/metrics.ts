import type { Shift } from "@/generated/prisma/client";

function minutesBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

// Combines a shift's time-of-day (stored as a Postgres TIME, so the Date's
// year/month/day are meaningless) with a specific calendar date.
function shiftTimeOn(date: Date, shiftTime: Date) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      shiftTime.getUTCHours(),
      shiftTime.getUTCMinutes(),
    ),
  );
}

export type ShiftMetrics = {
  lateMinutes: number;
  earlyLeaveMinutes: number;
  workMinutes: number;
  overtimeMinutes: number;
  isLate: boolean;
};

// Pure shift-vs-punch math shared by both the automatic aggregation engine
// and manual attendance edits, so a manual correction's derived numbers
// (late/early-leave/work/overtime minutes) are always computed the same way
// the automatic engine would — never left stale from a prior computation.
export function computeShiftMetrics(
  day: Date,
  checkIn: Date,
  checkOut: Date | null,
  shift: Shift | null,
): ShiftMetrics {
  let lateMinutes = 0;
  let earlyLeaveMinutes = 0;
  let workMinutes = 0;
  let overtimeMinutes = 0;
  let isLate = false;

  if (shift) {
    const shiftStart = shiftTimeOn(day, shift.startTime);
    const shiftEnd = shift.isOvernight
      ? new Date(shiftTimeOn(day, shift.endTime).getTime() + 24 * 60 * 60 * 1000)
      : shiftTimeOn(day, shift.endTime);
    const graceDeadline = new Date(shiftStart.getTime() + shift.gracePeriodMinutes * 60000);

    if (checkIn.getTime() > graceDeadline.getTime()) {
      lateMinutes = minutesBetween(graceDeadline, checkIn);
      isLate = true;
    }

    if (checkOut) {
      workMinutes = Math.max(0, minutesBetween(checkIn, checkOut) - shift.breakMinutes);
      if (checkOut.getTime() < shiftEnd.getTime()) {
        earlyLeaveMinutes = minutesBetween(checkOut, shiftEnd);
      }
      if (shift.requiredWorkMinutes) {
        overtimeMinutes = Math.max(0, workMinutes - shift.requiredWorkMinutes);
      }
    }
  } else if (checkOut) {
    workMinutes = minutesBetween(checkIn, checkOut);
  }

  return { lateMinutes, earlyLeaveMinutes, workMinutes, overtimeMinutes, isLate };
}
