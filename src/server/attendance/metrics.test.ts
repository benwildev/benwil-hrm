import { describe, expect, it } from "vitest";
import { computeShiftMetrics } from "@/server/attendance/metrics";
import type { Shift } from "@/generated/prisma/client";

// Times are stored as Postgres TIME values — only the UTC hour/minute of
// these Date objects matter, the year/month/day are ignored by
// computeShiftMetrics (see metrics.ts's shiftTimeOn helper).
function shiftTime(hour: number, minute = 0): Date {
  return new Date(Date.UTC(1970, 0, 1, hour, minute));
}

function makeShift(overrides: Partial<Shift> = {}): Shift {
  return {
    id: "shift-1",
    name: "Day Shift",
    startTime: shiftTime(9, 0),
    endTime: shiftTime(17, 0),
    gracePeriodMinutes: 10,
    requiredWorkMinutes: 480,
    breakMinutes: 60,
    isOvernight: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const day = new Date(Date.UTC(2026, 0, 15));

describe("computeShiftMetrics", () => {
  it("computes work minutes net of the shift's break", () => {
    const checkIn = new Date(Date.UTC(2026, 0, 15, 9, 0));
    const checkOut = new Date(Date.UTC(2026, 0, 15, 17, 0)); // 8h = 480 min, minus 60 min break
    const result = computeShiftMetrics(day, checkIn, checkOut, makeShift());
    expect(result.workMinutes).toBe(420);
  });

  it("flags early leave when checkout is before shift end", () => {
    const checkIn = new Date(Date.UTC(2026, 0, 15, 9, 0));
    const checkOut = new Date(Date.UTC(2026, 0, 15, 16, 0));
    const result = computeShiftMetrics(day, checkIn, checkOut, makeShift());
    expect(result.earlyLeaveMinutes).toBe(60);
  });

  it("computes overtime once required work minutes are exceeded", () => {
    const checkIn = new Date(Date.UTC(2026, 0, 15, 9, 0));
    const checkOut = new Date(Date.UTC(2026, 0, 15, 19, 0)); // 10h - 1h break = 540 min worked
    const result = computeShiftMetrics(day, checkIn, checkOut, makeShift());
    expect(result.workMinutes).toBe(540);
    expect(result.overtimeMinutes).toBe(60); // 540 - 480 required
  });

  it("falls back to raw duration when the employee has no assigned shift", () => {
    const checkIn = new Date(Date.UTC(2026, 0, 15, 9, 0));
    const checkOut = new Date(Date.UTC(2026, 0, 15, 13, 0));
    const result = computeShiftMetrics(day, checkIn, checkOut, null);
    expect(result.workMinutes).toBe(240);
    expect(result.isLate).toBe(false);
  });

  it("reports zero work minutes when there is no checkout yet (missing checkout)", () => {
    const checkIn = new Date(Date.UTC(2026, 0, 15, 9, 0));
    const result = computeShiftMetrics(day, checkIn, null, makeShift());
    expect(result.workMinutes).toBe(0);
    expect(result.overtimeMinutes).toBe(0);
  });

  describe("shift with no requiredWorkMinutes configured (legacy arrival-based lateness)", () => {
    it("marks an on-time check-in as not late", () => {
      const checkIn = new Date(Date.UTC(2026, 0, 15, 9, 5)); // within the 10-min grace period
      const checkOut = new Date(Date.UTC(2026, 0, 15, 17, 0));
      const shift = makeShift({ requiredWorkMinutes: null });
      const result = computeShiftMetrics(day, checkIn, checkOut, shift);
      expect(result.isLate).toBe(false);
      expect(result.lateMinutes).toBe(0);
    });

    it("marks a check-in past the grace period as late, regardless of when they check out", () => {
      const checkIn = new Date(Date.UTC(2026, 0, 15, 9, 25)); // 15 min past the 9:10 grace deadline
      const checkOut = new Date(Date.UTC(2026, 0, 15, 17, 30)); // stayed late to compensate — doesn't matter here
      const shift = makeShift({ requiredWorkMinutes: null });
      const result = computeShiftMetrics(day, checkIn, checkOut, shift);
      expect(result.isLate).toBe(true);
      expect(result.lateMinutes).toBe(15);
    });
  });

  describe("shift with requiredWorkMinutes configured (duration-based lateness)", () => {
    // This is the behavior an employer with flexible arrival (e.g. prayer-time
    // tolerance, commute variance) wants: lateness is judged on whether the
    // employee put in the required hours for the day, not on the clock time
    // they happened to arrive.
    it("is NOT late when a late arrival is compensated by staying late enough to hit the required hours", () => {
      // Required 480 min + 60 min break = needs an 9h window. Arriving 12 min
      // late (9:12) and leaving 12 min late (5:12 -> 17:12) still nets exactly
      // 480 worked minutes, matching the requirement precisely.
      const checkIn = new Date(Date.UTC(2026, 0, 15, 9, 12));
      const checkOut = new Date(Date.UTC(2026, 0, 15, 17, 52)); // 8h40m span
      const shift = makeShift({ requiredWorkMinutes: 460, breakMinutes: 60, gracePeriodMinutes: 10 });
      const result = computeShiftMetrics(day, checkIn, checkOut, shift);
      expect(result.workMinutes).toBe(460); // (17:52 - 9:12 = 520 min) - 60 break = 460
      expect(result.isLate).toBe(false);
      expect(result.lateMinutes).toBe(0);
    });

    it("IS late when the shortfall from required hours exceeds the grace period, even with an on-time arrival", () => {
      const checkIn = new Date(Date.UTC(2026, 0, 15, 9, 0)); // on time
      const checkOut = new Date(Date.UTC(2026, 0, 15, 16, 0)); // left 3h early
      const shift = makeShift(); // requiredWorkMinutes 480, breakMinutes 60, grace 10
      const result = computeShiftMetrics(day, checkIn, checkOut, shift);
      // workMinutes = (16:00-9:00=420) - 60 break = 360; deficit = 480-360 = 120
      expect(result.workMinutes).toBe(360);
      expect(result.isLate).toBe(true);
      expect(result.lateMinutes).toBe(120);
    });

    it("stays within grace when the shortfall from required hours is small", () => {
      const checkIn = new Date(Date.UTC(2026, 0, 15, 9, 5));
      const checkOut = new Date(Date.UTC(2026, 0, 15, 17, 0));
      const shift = makeShift({ requiredWorkMinutes: 420, breakMinutes: 60, gracePeriodMinutes: 10 });
      const result = computeShiftMetrics(day, checkIn, checkOut, shift);
      // (17:00-9:05 = 475) - 60 break = 415 worked; deficit = 420-415 = 5, within the 10-min grace
      expect(result.workMinutes).toBe(415);
      expect(result.isLate).toBe(false);
      expect(result.lateMinutes).toBe(0);
    });

    it("is not marked late while still clocked in (no checkout yet), even though total hours are unknown", () => {
      // Provisional-only signal: falls back to arrival-time-vs-grace since
      // hours worked for the day can't be known until checkout happens.
      const checkIn = new Date(Date.UTC(2026, 0, 15, 9, 5)); // within grace
      const shift = makeShift();
      const result = computeShiftMetrics(day, checkIn, null, shift);
      expect(result.isLate).toBe(false);
    });
  });

  describe("overnight shifts", () => {
    it("handles an overnight shift's checkout past midnight correctly", () => {
      const overnight = makeShift({
        startTime: shiftTime(22, 0),
        endTime: shiftTime(6, 0),
        isOvernight: true,
        requiredWorkMinutes: 420,
        breakMinutes: 0,
        gracePeriodMinutes: 0,
      });
      const checkIn = new Date(Date.UTC(2026, 0, 15, 22, 0));
      const checkOut = new Date(Date.UTC(2026, 0, 16, 6, 0)); // next calendar day
      const result = computeShiftMetrics(day, checkIn, checkOut, overnight);
      expect(result.workMinutes).toBe(480); // 8 hours
      expect(result.earlyLeaveMinutes).toBe(0);
      expect(result.isLate).toBe(false);
    });

    it("still detects lateness on an overnight shift with no requiredWorkMinutes set", () => {
      const overnight = makeShift({
        startTime: shiftTime(22, 0),
        endTime: shiftTime(6, 0),
        isOvernight: true,
        gracePeriodMinutes: 5,
        requiredWorkMinutes: null,
      });
      const checkIn = new Date(Date.UTC(2026, 0, 15, 22, 20));
      const result = computeShiftMetrics(day, checkIn, null, overnight);
      expect(result.isLate).toBe(true);
      expect(result.lateMinutes).toBe(15);
    });
  });
});
