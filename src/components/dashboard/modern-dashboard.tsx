"use client";

import React from "react";
import Link from "next/link";
import {
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  FileTextIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ChevronRightIcon,
  TrendingUpIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  ActivityIcon,
  BanknoteIcon,
  UserIcon,
  CalendarDaysIcon,
} from "lucide-react";
import { AttendanceRing } from "@/components/dashboard/attendance-ring";
import { AttendanceTrendChart } from "@/components/dashboard/attendance-trend-chart";
import { CheckInOutCard } from "@/components/dashboard/check-in-out-card";
import { Badge } from "@/components/ui/badge";
import type { DashboardActivity } from "@/server/dal/dashboard";

const PAYROLL_STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Not started",
  DRAFT: "Draft",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  LOCKED: "Locked",
};

interface ModernDashboardProps {
  companyName: string;
  userName: string;
  userRole: string;
  userEmail: string;
  employeeId?: string | null;
  dateLabel: string;
  greeting: string;
  showCheckIn: boolean;
  companyStats: {
    employeeCount: number;
    todayPresent: number;
    todayLate: number;
    todayAbsent: number;
    pendingLeaveCount: number;
    payrollStatus: string;
    trend: { date: string; present: number; late: number; absent: number }[];
    recentActivities?: DashboardActivity[];
  } | null;
  myStats: {
    todayStatus: string | null;
    todayCheckIn: Date | null;
    todayCheckOut: Date | null;
    myPendingLeave: number;
    presentDaysThisMonth?: number;
    lateDaysThisMonth?: number;
    totalWorkedHoursThisMonth?: string;
    totalRemainingLeave?: number;
    shift?: {
      name: string;
      startTime: string | null;
      endTime: string | null;
    } | null;
    recentAttendance?: {
      id: string;
      date: string;
      status: string;
      checkIn: Date | null;
      checkOut: Date | null;
      workMinutes: number | null;
      lateMinutes: number | null;
    }[];
    recentLeaves?: {
      id: string;
      typeName: string;
      startDate: string;
      endDate: string;
      totalDays: string;
      status: string;
      reason: string | null;
    }[];
    latestPayslip: {
      id: string;
      payrollPeriodId: string;
      periodName?: string;
      netSalary: string;
    } | null;
  } | null;
}

function formatShortDate(isoString: string) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return isoString;
  }
}

function formatClockTime(date: Date | null) {
  if (!date) return "—";
  try {
    const d = new Date(date);
    const hours = d.getUTCHours();
    const mins = d.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${h12}:${mins} ${ampm}`;
  } catch {
    return "—";
  }
}

function formatDuration(minutes: number | null) {
  if (!minutes || minutes <= 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function ModernDashboard({
  companyName,
  userName,
  userRole,
  employeeId,
  dateLabel,
  greeting,
  showCheckIn,
  companyStats,
  myStats,
}: ModernDashboardProps) {
  const attendanceRate =
    companyStats && companyStats.employeeCount > 0
      ? Math.round(((companyStats.todayPresent + companyStats.todayLate) / companyStats.employeeCount) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6 max-w-[1340px] w-full mx-auto pb-12 font-sans antialiased text-neutral-900">
      
      {/* ================= GREETING & CONTEXT HEADER ================= */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/60">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            {dateLabel}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
            {greeting}, {userName.split(" ")[0]}
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#162E51]/10 text-[#162E51] border border-[#162E51]/20">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            {companyName} HRM
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#162E51] text-white shadow-xs">
            {userRole}
          </span>
        </div>
      </header>

      {/* ================= FLOOR STAFF CHECK-IN / CHECK-OUT SECTION ================= */}
      {myStats && showCheckIn ? (
        <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-5">
          <div className="rounded-3xl bg-gradient-to-br from-[#162E51] via-[#0D1C33] to-[#162E51] text-white p-7 shadow-md border border-[#162E51]/40 relative overflow-hidden">
            <div className="pointer-events-none absolute -bottom-16 -right-16 size-48 rounded-full bg-[#C52227]/25 blur-3xl" />
            <div className="relative z-10">
              <CheckInOutCard checkIn={myStats.todayCheckIn} checkOut={myStats.todayCheckOut} />
            </div>
          </div>
          <div className="rounded-3xl bg-white border border-neutral-200/80 p-6 flex flex-col justify-between shadow-2xs divide-y divide-neutral-100">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                  <ClockIcon className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Pending Leave</h4>
                  <p className="text-xs text-neutral-400">Awaiting supervisor review</p>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-neutral-900 tabular-nums">
                {myStats.myPendingLeave}
              </span>
            </div>

            <Link
              href="/payroll"
              className="group flex items-center justify-between pt-4 hover:opacity-90 transition-opacity"
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileTextIcon className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                      Latest Payslip
                    </h4>
                    <ArrowUpRightIcon className="size-3 text-neutral-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <p className="text-xs text-neutral-400">Net salary, last cycle</p>
                </div>
              </div>
              <span className="text-xl font-extrabold text-neutral-900 tabular-nums font-mono">
                {myStats.latestPayslip ? `৳${Number(myStats.latestPayslip.netSalary.toString()).toLocaleString()}` : "—"}
              </span>
            </Link>
          </div>
        </section>
      ) : null}

      {/* ================= TOP 4 BENTO STAT CARDS ================= */}
      {companyStats ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Employees */}
          <Link
            href="/employees"
            className="group bg-white hover:bg-neutral-50/50 rounded-3xl p-6 border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Active Employees
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Total personnel</p>
              </div>
              <div className="size-9 rounded-2xl bg-[#F0F4F9] text-[#162E51] border border-[#162E51]/15 flex items-center justify-center group-hover:bg-[#162E51] group-hover:text-white transition-colors">
                <UsersIcon className="size-4.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-6">
              <span className="text-4xl font-extrabold tracking-tight text-neutral-900">
                {companyStats.employeeCount}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0F4F9] text-[#162E51] border border-[#162E51]/20">
                Personnel
                <ArrowUpRightIcon className="size-3" />
              </span>
            </div>
          </Link>

          {/* Card 2: Today's Present */}
          <Link
            href="/attendance"
            className="group bg-white hover:bg-neutral-50/50 rounded-3xl p-6 border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Today&apos;s Attendance
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {companyStats.todayLate > 0 ? `${companyStats.todayLate} marked late` : "On schedule"}
                </p>
              </div>
              <div className="size-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle2Icon className="size-4.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-6">
              <span className="text-4xl font-extrabold tracking-tight text-neutral-900">
                {companyStats.todayPresent}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <TrendingUpIcon className="size-3" />
                {attendanceRate}% Present
              </span>
            </div>
          </Link>

          {/* Card 3: Pending Leaves */}
          <Link
            href="/leave/approvals"
            className="group bg-white hover:bg-neutral-50/50 rounded-3xl p-6 border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Leave Requests
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Awaiting manager approval</p>
              </div>
              <div className="size-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <ClockIcon className="size-4.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-6">
              <span className="text-4xl font-extrabold tracking-tight text-neutral-900">
                {companyStats.pendingLeaveCount}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                Pending
                <ArrowUpRightIcon className="size-3" />
              </span>
            </div>
          </Link>

          {/* Card 4: Payroll Status */}
          <Link
            href="/payroll"
            className="group bg-white hover:bg-neutral-50/50 rounded-3xl p-6 border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Payroll Cycle
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">Current cycle status</p>
              </div>
              <div className="size-9 rounded-2xl bg-[#FEF2F2] text-[#C52227] border border-[#C52227]/20 flex items-center justify-center group-hover:bg-[#C52227] group-hover:text-white transition-colors">
                <BriefcaseIcon className="size-4.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between mt-6">
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 truncate">
                {PAYROLL_STATUS_LABEL[companyStats.payrollStatus] ?? companyStats.payrollStatus}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#C52227] border border-[#C52227]/20">
                Payroll
                <ArrowUpRightIcon className="size-3" />
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      {/* ================= MAIN BENTO GRID: ATTENDANCE RING, TREND CHART & HR CALENDAR ================= */}
      {companyStats ? (
        <section className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-6 items-start">
          
          {/* Left Column: Attendance Ring & 14-Day Attendance Trend */}
          <div className="flex flex-col gap-6">
            
            {/* Top Card: Attendance Ring & Status Breakdown */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                    Today&apos;s Attendance Breakdown
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Real-time attendance status across the organization
                  </p>
                </div>
                <Link
                  href="/attendance"
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
                >
                  View full logs
                  <ChevronRightIcon className="size-3.5" />
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 justify-around pt-2">
                {/* Attendance Ring SVG */}
                <AttendanceRing
                  present={companyStats.todayPresent}
                  late={companyStats.todayLate}
                  absent={companyStats.todayAbsent}
                  total={companyStats.employeeCount}
                />

                {/* Status Badges List */}
                <div className="flex flex-col gap-3.5 w-full sm:w-auto min-w-[200px]">
                  {/* Present */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2.5 rounded-full bg-[#0ca30c]" />
                      <span className="text-xs font-bold text-neutral-800">Present</span>
                    </div>
                    <span className="text-sm font-extrabold text-neutral-900 tabular-nums">
                      {companyStats.todayPresent}
                    </span>
                  </div>

                  {/* Late */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-amber-50/60 border border-amber-100/80">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2.5 rounded-full bg-[#fab219]" />
                      <span className="text-xs font-bold text-neutral-800">Late</span>
                    </div>
                    <span className="text-sm font-extrabold text-neutral-900 tabular-nums">
                      {companyStats.todayLate}
                    </span>
                  </div>

                  {/* Absent */}
                  <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-rose-50/60 border border-rose-100/80">
                    <div className="flex items-center gap-2.5">
                      <span className="size-2.5 rounded-full bg-[#d03b3b]" />
                      <span className="text-xs font-bold text-neutral-800">Absent</span>
                    </div>
                    <span className="text-sm font-extrabold text-neutral-900 tabular-nums">
                      {companyStats.todayAbsent}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card: 14-Day Attendance Trends Chart */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    Attendance Trends (Last 14 Working Days)
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Company-wide tracking excluding weekends & official holidays
                  </p>
                </div>
                <Badge variant="outline" className="text-[11px] font-semibold">
                  Working days
                </Badge>
              </div>

              <div className="pt-2">
                <AttendanceTrendChart data={companyStats.trend} />
              </div>
            </div>

          </div>

          {/* Right Column: Live Activity Feed & Quick Actions */}
          <div className="flex flex-col gap-6">
            
            {/* Live Activity Stream Widget */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                      Live Activity
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Feed
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Real-time punches & workforce updates
                  </p>
                </div>
                <Link
                  href="/attendance"
                  className="text-xs font-bold text-[#162E51] hover:text-[#C52227] hover:underline transition-colors"
                >
                  View logs
                </Link>
              </div>

              <div className="flex flex-col divide-y divide-neutral-100">
                {companyStats.recentActivities && companyStats.recentActivities.length > 0 ? (
                  companyStats.recentActivities.map((act) => {
                    const initials = act.employeeName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    const badgeColors = {
                      emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                      amber: "bg-amber-50 text-amber-700 border-amber-200/60",
                      rose: "bg-rose-50 text-rose-700 border-rose-200/60",
                      blue: "bg-[#F0F4F9] text-[#162E51] border-[#162E51]/20",
                    }[act.badgeVariant];

                    return (
                      <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {act.employeePhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={act.employeePhoto}
                              alt={act.employeeName}
                              className="size-8.5 rounded-full object-cover shrink-0 border border-neutral-200"
                            />
                          ) : (
                            <div className="size-8.5 rounded-full bg-[#162E51]/10 text-[#162E51] flex items-center justify-center font-bold text-xs shrink-0 border border-[#162E51]/15">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-900 truncate">
                              {act.title}
                            </p>
                            <p className="text-[11px] text-neutral-500 truncate">
                              {act.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badgeColors}`}>
                            {act.badgeText}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-medium">
                            {act.timeFormatted}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center flex flex-col items-center justify-center">
                    <div className="size-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2">
                      <ClockIcon className="size-5" />
                    </div>
                    <p className="text-xs font-semibold text-neutral-700">No punches recorded today</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 max-w-[200px]">
                      New biometric logs and leave applications will appear here automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Approvals Widget */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Quick Actions
                </h3>
                <span className="text-xs text-neutral-400">Shortcuts</span>
              </div>

              <div className="flex flex-col gap-2.5">
                <Link
                  href="/employees"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/60 hover:bg-[#F0F4F9]/70 border border-neutral-200/60 hover:border-[#162E51]/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-[#F0F4F9] text-[#162E51] border border-[#162E51]/15 flex items-center justify-center group-hover:bg-[#162E51] group-hover:text-white transition-colors">
                      <UsersIcon className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#162E51] transition-colors">Manage Employees</h4>
                      <p className="text-[11px] text-neutral-400">View roster & profiles</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="size-4 text-neutral-400 group-hover:text-[#162E51] transition-colors" />
                </Link>

                <Link
                  href="/leave/approvals"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/60 hover:bg-neutral-100/80 border border-neutral-200/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <CalendarIcon className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">Leave Approvals</h4>
                      <p className="text-[11px] text-neutral-400">
                        {companyStats.pendingLeaveCount} awaiting action
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="size-4 text-neutral-400 group-hover:text-neutral-900 transition-colors" />
                </Link>

                <Link
                  href="/payroll"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/60 hover:bg-[#FEF2F2]/70 border border-neutral-200/60 hover:border-[#C52227]/20 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-[#FEF2F2] text-[#C52227] border border-[#C52227]/15 flex items-center justify-center group-hover:bg-[#C52227] group-hover:text-white transition-colors">
                      <FileTextIcon className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#C52227] transition-colors">Payroll Periods</h4>
                      <p className="text-[11px] text-neutral-400">Manage salary cycles</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="size-4 text-neutral-400 group-hover:text-[#C52227] transition-colors" />
                </Link>
              </div>
            </div>

          </div>

        </section>
      ) : null}

      {/* ================= EMPLOYEE PERSONAL SELF-SERVICE DASHBOARD ================= */}
      {!companyStats && myStats ? (
        <>
          {/* Top 4 Personal Bento Stat Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Attendance This Month */}
            <Link
              href="/attendance"
              className="group bg-white hover:bg-neutral-50/50 rounded-3xl p-6 border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                    Attendance This Month
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {myStats.totalWorkedHoursThisMonth ? `${myStats.totalWorkedHoursThisMonth} hrs logged` : "Personal attendance"}
                  </p>
                </div>
                <div className="size-9 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <CheckCircle2Icon className="size-4.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-6">
                <span className="text-4xl font-extrabold tracking-tight text-neutral-900">
                  {myStats.presentDaysThisMonth ?? 0}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Days Present
                  <ArrowUpRightIcon className="size-3" />
                </span>
              </div>
            </Link>

            {/* Card 2: Leave Balance */}
            <Link
              href="/leave"
              className="group bg-white hover:bg-neutral-50/50 rounded-3xl p-6 border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                    Leave Balance
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Available leave days</p>
                </div>
                <div className="size-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <CalendarIcon className="size-4.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-6">
                <span className="text-4xl font-extrabold tracking-tight text-neutral-900">
                  {myStats.totalRemainingLeave ?? 0}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                  {myStats.myPendingLeave > 0 ? `${myStats.myPendingLeave} Pending` : "Available"}
                  <ArrowUpRightIcon className="size-3" />
                </span>
              </div>
            </Link>

            {/* Card 3: Latest Payslip */}
            <Link
              href="/payroll/my"
              className="group bg-white hover:bg-neutral-50/50 rounded-3xl p-6 border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                    Latest Net Salary
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {myStats.latestPayslip?.periodName ? `Cycle: ${myStats.latestPayslip.periodName}` : "Disbursed earnings"}
                  </p>
                </div>
                <div className="size-9 rounded-2xl bg-[#F0F4F9] text-[#162E51] border border-[#162E51]/15 flex items-center justify-center group-hover:bg-[#162E51] group-hover:text-white transition-colors">
                  <BanknoteIcon className="size-4.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-6">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 truncate">
                  {myStats.latestPayslip ? `৳${Number(myStats.latestPayslip.netSalary).toLocaleString()}` : "—"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0F4F9] text-[#162E51] border border-[#162E51]/20">
                  My Payslips
                  <ArrowUpRightIcon className="size-3" />
                </span>
              </div>
            </Link>

            {/* Card 4: Assigned Shift */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                    Work Schedule
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {myStats.shift?.name ?? "Regular Shift"}
                  </p>
                </div>
                <div className="size-9 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
                  <ClockIcon className="size-4.5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-6">
                <span className="text-lg font-bold text-neutral-900 truncate">
                  {myStats.shift?.startTime && myStats.shift?.endTime
                    ? `${myStats.shift.startTime} – ${myStats.shift.endTime}`
                    : "09:00 AM – 05:00 PM"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                  Assigned
                </span>
              </div>
            </div>
          </section>

          {/* Main 2-Column Section for Employee */}
          <section className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6 items-start">
            {/* Left Column: My Recent Attendance Records */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-2xs flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                    My Recent Attendance Records
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Your personal clock-in records and daily work hours
                  </p>
                </div>
                <Link
                  href="/attendance"
                  className="text-xs font-bold text-[#162E51] hover:text-[#C52227] flex items-center gap-1 transition-colors"
                >
                  View calendar
                  <ChevronRightIcon className="size-3.5" />
                </Link>
              </div>

              {myStats.recentAttendance && myStats.recentAttendance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-100 text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Clock In</th>
                        <th className="pb-3 font-semibold">Clock Out</th>
                        <th className="pb-3 font-semibold text-right">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                      {myStats.recentAttendance.map((rec) => {
                        const statusConfig = {
                          PRESENT: { label: "Present", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
                          LATE: { label: "Late", badge: "bg-amber-50 text-amber-700 border-amber-200/60" },
                          HALF_DAY: { label: "Half Day", badge: "bg-blue-50 text-blue-700 border-blue-200/60" },
                          ABSENT: { label: "Absent", badge: "bg-rose-50 text-rose-700 border-rose-200/60" },
                        }[rec.status] ?? { label: rec.status, badge: "bg-neutral-100 text-neutral-700 border-neutral-200" };

                        return (
                          <tr key={rec.id} className="hover:bg-neutral-50/60 transition-colors">
                            <td className="py-3 font-semibold text-neutral-900">
                              {formatShortDate(rec.date)}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${statusConfig.badge}`}>
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-[11px] text-neutral-600">
                              {formatClockTime(rec.checkIn)}
                            </td>
                            <td className="py-3 font-mono text-[11px] text-neutral-600">
                              {rec.checkIn && !rec.checkOut ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-sans font-semibold text-[10px]">
                                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Active Now
                                </span>
                              ) : (
                                formatClockTime(rec.checkOut)
                              )}
                            </td>
                            <td className="py-3 font-mono text-[11px] text-neutral-900 text-right font-bold">
                              {formatDuration(rec.workMinutes)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center flex flex-col items-center justify-center">
                  <div className="size-10 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mb-2">
                    <ClockIcon className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-neutral-700">No attendance logs yet this month</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Click the check-in button above to record your attendance today.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: My Leave Requests & Self-Service Shortcuts */}
            <div className="flex flex-col gap-6">
              {/* Leave Requests Card */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                    My Leave Requests
                  </h3>
                  <Link
                    href="/leave"
                    className="text-xs font-bold text-[#162E51] hover:text-[#C52227] transition-colors"
                  >
                    Apply Leave &rarr;
                  </Link>
                </div>

                <div className="flex flex-col divide-y divide-neutral-100">
                  {myStats.recentLeaves && myStats.recentLeaves.length > 0 ? (
                    myStats.recentLeaves.map((l) => {
                      const badgeClass = {
                        APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
                        PENDING: "bg-amber-50 text-amber-700 border-amber-200/60",
                        REJECTED: "bg-rose-50 text-rose-700 border-rose-200/60",
                      }[l.status] ?? "bg-neutral-100 text-neutral-700 border-neutral-200";

                      return (
                        <div key={l.id} className="py-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-neutral-900">
                              {l.typeName} ({l.totalDays}d)
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {formatShortDate(l.startDate)} – {formatShortDate(l.endDate)}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border uppercase ${badgeClass}`}>
                            {l.status}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-xs text-neutral-400">
                      No leave requests submitted yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Quick Actions */}
              <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-2xs flex flex-col gap-4">
                <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                  Employee Self-Service
                </h3>

                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/leave"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/60 hover:bg-[#FEF2F2]/70 border border-neutral-200/60 hover:border-[#C52227]/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <CalendarIcon className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#C52227] transition-colors">
                          Apply for Leave
                        </h4>
                        <p className="text-[11px] text-neutral-400">Submit time off request</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="size-4 text-neutral-400 group-hover:text-[#C52227] transition-colors" />
                  </Link>

                  <Link
                    href="/attendance"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/60 hover:bg-[#F0F4F9]/70 border border-neutral-200/60 hover:border-[#162E51]/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <ClockIcon className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#162E51] transition-colors">
                          My Attendance Logs
                        </h4>
                        <p className="text-[11px] text-neutral-400">Monthly timesheet & calendar</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="size-4 text-neutral-400 group-hover:text-[#162E51] transition-colors" />
                  </Link>

                  <Link
                    href="/payroll/my"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/60 hover:bg-[#F0F4F9]/70 border border-neutral-200/60 hover:border-[#162E51]/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-[#F0F4F9] text-[#162E51] border border-[#162E51]/15 flex items-center justify-center group-hover:bg-[#162E51] group-hover:text-white transition-colors">
                        <BanknoteIcon className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#162E51] transition-colors">
                          My Payslips
                        </h4>
                        <p className="text-[11px] text-neutral-400">View salary statements</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="size-4 text-neutral-400 group-hover:text-[#162E51] transition-colors" />
                  </Link>

                  {employeeId && (
                    <Link
                      href={`/employees/${employeeId}`}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50/60 hover:bg-[#F0F4F9]/70 border border-neutral-200/60 hover:border-[#162E51]/20 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-[#162E51]/10 text-[#162E51] flex items-center justify-center">
                          <UserIcon className="size-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#162E51] transition-colors">
                            My Profile
                          </h4>
                          <p className="text-[11px] text-neutral-400">Personal & employment details</p>
                        </div>
                      </div>
                      <ChevronRightIcon className="size-4 text-neutral-400 group-hover:text-[#162E51] transition-colors" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {!companyStats && !myStats ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200/80 text-neutral-400">
          No dashboard data available yet.
        </div>
      ) : null}

    </div>
  );
}
