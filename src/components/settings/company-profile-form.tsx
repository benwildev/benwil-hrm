"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  updateCompanyProfileAction,
  type CompanyFormState,
} from "@/server/actions/company.actions";
import type { Company } from "@/generated/prisma/client";

const DAYS_OF_WEEK = [
  { day: 0, label: "Sunday", short: "Sun" },
  { day: 1, label: "Monday", short: "Mon" },
  { day: 2, label: "Tuesday", short: "Tue" },
  { day: 3, label: "Wednesday", short: "Wed" },
  { day: 4, label: "Thursday", short: "Thu" },
  { day: 5, label: "Friday", short: "Fri" },
  { day: 6, label: "Saturday", short: "Sat" },
];

const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC (GMT+0)" },
  { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (GMT+5:30)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (GMT+8)" },
  { value: "Europe/London", label: "Europe/London (GMT+0/+1)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (GMT+1/+2)" },
  { value: "America/New_York", label: "America/New York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (PST/PDT)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
];

const FIELDS: { name: keyof Company; label: string }[] = [
  { name: "name", label: "Company name" },
  { name: "legalName", label: "Legal name" },
  { name: "email", label: "Company email" },
  { name: "phone", label: "Phone" },
  { name: "addressLine", label: "Address" },
  { name: "city", label: "City" },
  { name: "state", label: "State / Province" },
  { name: "postalCode", label: "Postal code" },
  { name: "country", label: "Country" },
  { name: "taxId", label: "Tax ID" },
];

export type PlainCompany = Omit<Company, "absenceDeductionRate" | "lateDeductionRate"> & {
  absenceDeductionRate: number | string | null;
  lateDeductionRate: number | string | null;
};

export function CompanyProfileForm({ company }: { company: PlainCompany }) {
  const [state, formAction, isPending] = useActionState<CompanyFormState, FormData>(
    updateCompanyProfileAction,
    undefined,
  );

  const initialWeekendDays = (company.weekendDays || "0,6")
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n));

  const [selectedWeekends, setSelectedWeekends] = useState<number[]>(
    initialWeekendDays.length > 0 ? initialWeekendDays : [0, 6],
  );
  const [enableAbsence, setEnableAbsence] = useState<boolean>(company.enableAbsenceDeduction ?? true);
  const [enableLate, setEnableLate] = useState<boolean>(company.enableLateDeduction ?? false);

  function toggleDay(day: number) {
    setSelectedWeekends((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              key={`${field.name}-${(company[field.name] as string | null) ?? ""}`}
              id={field.name}
              name={field.name}
              defaultValue={(company[field.name] as string | null) ?? ""}
              required={field.name === "name"}
            />
          </div>
        ))}

        {/* Company Timezone */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="timezone">Operational Timezone</Label>
          <NativeSelect id="timezone" name="timezone" defaultValue={company.timezone || "UTC"}>
            {COMMON_TIMEZONES.map((tz) => (
              <NativeSelectOption key={tz.value} value={tz.value}>
                {tz.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <p className="text-[11px] text-muted-foreground">
            Used for daily attendance cut-offs and biometric punch matching.
          </p>
        </div>
      </div>

      {/* Customizable Weekend Days */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
        <Label>Weekly Non-Working Days (Weekends)</Label>
        <p className="text-xs text-muted-foreground">
          Select regular non-working days for your organization. Leave requests and payroll absence calculations will exclude these days.
        </p>

        <input
          type="hidden"
          name="weekendDays"
          value={selectedWeekends.join(",")}
        />

        <div className="flex flex-wrap gap-2 pt-1">
          {DAYS_OF_WEEK.map(({ day, label, short }) => {
            const isSelected = selectedWeekends.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/80 hover:bg-muted"
                }`}
                title={label}
              >
                {short}
              </button>
            );
          })}
        </div>
        <span className="text-[11px] text-muted-foreground">
          Active weekends: {DAYS_OF_WEEK.filter((d) => selectedWeekends.includes(d.day)).map((d) => d.label).join(", ") || "None"}
        </span>
      </div>

      {/* Attendance & Payroll Deduction Policies */}
      <div className="flex flex-col gap-6 pt-4 border-t border-border/60">
        <div>
          <Label className="text-sm font-semibold">Attendance &amp; Payroll Deduction Policies</Label>
          <p className="text-xs text-muted-foreground">
            Configure whether unexcused absences and late arrivals are penalized during monthly payroll runs.
          </p>
        </div>

        {/* 1. Absence Deduction Policy */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="enableAbsenceDeduction" className="text-sm font-semibold cursor-pointer">
                  Absence Deductions
                </Label>
                {enableAbsence ? (
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-blue-100 text-blue-700">Active</span>
                ) : (
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-100 text-emerald-700">Waived ($0)</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Deduct salary for unexcused employee absences and unpaid leave days.
              </p>
            </div>
            <input
              type="checkbox"
              id="enableAbsenceDeduction"
              name="enableAbsenceDeduction"
              value="true"
              checked={enableAbsence}
              onChange={(e) => setEnableAbsence(e.target.checked)}
              className="size-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer mt-1"
            />
          </div>

          {enableAbsence ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="absenceCalculationBasis" className="text-xs">
                  Daily Rate Calculation Divisor
                </Label>
                <NativeSelect
                  id="absenceCalculationBasis"
                  name="absenceCalculationBasis"
                  defaultValue={company.absenceCalculationBasis || "WORKING_DAYS"}
                >
                  <NativeSelectOption value="WORKING_DAYS">Actual Working Days in Month</NativeSelectOption>
                  <NativeSelectOption value="CALENDAR_DAYS">Total Calendar Days (e.g. 30/31)</NativeSelectOption>
                  <NativeSelectOption value="FIXED_30">Fixed 30 Days</NativeSelectOption>
                  <NativeSelectOption value="FIXED_26">Fixed 26 Days (Standard Industrial)</NativeSelectOption>
                </NativeSelect>
                <p className="text-[11px] text-muted-foreground">
                  Divisor used to compute the employee's per-day wage rate.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="absenceDeductionRate" className="text-xs">
                  Deduction Multiplier Rate (%)
                </Label>
                <Input
                  id="absenceDeductionRate"
                  name="absenceDeductionRate"
                  type="number"
                  min="0"
                  max="200"
                  step="1"
                  defaultValue={company.absenceDeductionRate ? Number(company.absenceDeductionRate) : 100}
                  className="h-10"
                />
                <p className="text-[11px] text-muted-foreground">
                  100% = standard 1 full day per absence. 50% = half-day penalty.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200/60 p-3 text-xs text-emerald-800 flex items-center gap-2">
              <span className="font-semibold">✓ Policy Disabled:</span>
              <span>Absence deductions are completely waived. Unexcused absences will NOT be deducted and will <strong>not be shown</strong> on employee payslips.</span>
            </div>
          )}
        </div>

        {/* 2. Late Attendance Deduction Policy */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="enableLateDeduction" className="text-sm font-semibold cursor-pointer">
                  Late Attendance Deductions
                </Label>
                {enableLate ? (
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-amber-100 text-amber-700">Active</span>
                ) : (
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-200 text-slate-700">Disabled ($0)</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically deduct salary when employees arrive past their shift start time &amp; grace window.
              </p>
            </div>
            <input
              type="checkbox"
              id="enableLateDeduction"
              name="enableLateDeduction"
              value="true"
              checked={enableLate}
              onChange={(e) => setEnableLate(e.target.checked)}
              className="size-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer mt-1"
            />
          </div>

          {enableLate ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lateGraceCount" className="text-xs">
                  Monthly Grace Late Days
                </Label>
                <Input
                  id="lateGraceCount"
                  name="lateGraceCount"
                  type="number"
                  min="0"
                  max="31"
                  step="1"
                  defaultValue={company.lateGraceCount ?? 3}
                  className="h-10"
                />
                <p className="text-[11px] text-muted-foreground">
                  Number of late days allowed free before penalties start (e.g. 3).
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lateDeductionBasis" className="text-xs">
                  Penalty Calculation Rule
                </Label>
                <NativeSelect
                  id="lateDeductionBasis"
                  name="lateDeductionBasis"
                  defaultValue={company.lateDeductionBasis || "ONE_DAY_PER_3_LATES"}
                >
                  <NativeSelectOption value="ONE_DAY_PER_3_LATES">Every 3 Late Days = 1 Day Pay</NativeSelectOption>
                  <NativeSelectOption value="HALF_DAY">Half-Day (0.5 day) per Late</NativeSelectOption>
                  <NativeSelectOption value="FULL_DAY">Full Day (1.0 day) per Late</NativeSelectOption>
                  <NativeSelectOption value="FIXED_PERCENTAGE">Custom Percentage of Daily Wage</NativeSelectOption>
                </NativeSelect>
                <p className="text-[11px] text-muted-foreground">
                  Determines how excess late days are penalized.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lateDeductionRate" className="text-xs">
                  Late Multiplier Rate (%)
                </Label>
                <Input
                  id="lateDeductionRate"
                  name="lateDeductionRate"
                  type="number"
                  min="0"
                  max="200"
                  step="1"
                  defaultValue={company.lateDeductionRate ? Number(company.lateDeductionRate) : 100}
                  className="h-10"
                />
                <p className="text-[11px] text-muted-foreground">
                  Multiplier applied to the late penalty (default: 100%).
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-slate-100 border border-slate-200/80 p-3 text-xs text-slate-700 flex items-center gap-2">
              <span className="font-semibold">✓ Policy Disabled:</span>
              <span>Late attendance deductions are turned off. Late arrivals will NOT be penalized, and no late deduction item will be <strong>shown in payroll</strong>.</span>
            </div>
          )}
        </div>
      </div>

      {state && "error" in state ? (
        <p className="text-sm font-medium text-destructive">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-sm font-medium text-emerald-600">Company profile updated successfully.</p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
