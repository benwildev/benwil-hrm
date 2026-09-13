"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserIcon,
  MailIcon,
  PhoneIcon,
  Building2Icon,
  BriefcaseIcon,
  ClockIcon,
  CalendarIcon,
  ShieldCheckIcon,
  MapPinIcon,
  HeartIcon,
  GlobeIcon,
  KeyIcon,
  CreditCardIcon,
  BanknoteIcon,
  ExternalLinkIcon,
  PencilIcon,
  CalendarCheckIcon,
  UmbrellaIcon,
  FileTextIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ShieldAlertIcon,
  SparklesIcon,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "cn";
import { ChangeOwnPasswordDialog } from "@/components/auth/change-own-password-dialog";
import { EditContactDialog } from "@/components/profile/edit-contact-dialog";

interface ProfileViewProps {
  user: {
    id: string;
    email: string;
    status: string;
    createdAt: Date;
    role: {
      id: string;
      name: string;
      description?: string | null;
    };
  };
  employee?: {
    id: string;
    employeeCode: string;
    fullName: string;
    profilePhotoUrl?: string | null;
    workEmail?: string | null;
    personalEmail?: string | null;
    phone?: string | null;
    joiningDate: Date;
    employmentType?: string | null;
    employmentStatus: string;
    department?: { id: string; name: string } | null;
    designation?: { id: string; name: string } | null;
    shift?: {
      id: string;
      name: string;
      startTime: string | Date;
      endTime: string | Date;
      breakMinutes?: number | null;
      isOvernight?: boolean;
    } | null;
    reportingManager?: {
      id: string;
      fullName: string;
      employeeCode: string;
      workEmail?: string | null;
    } | null;
    dateOfBirth?: Date | null;
    gender?: string | null;
    maritalStatus?: string | null;
    nationality?: string | null;
    bloodGroup?: string | null;
    presentAddress?: string | null;
    permanentAddress?: string | null;
    emergencyContactName?: string | null;
    emergencyContactRelationship?: string | null;
    emergencyContactPhone?: string | null;
    paymentMethod?: string | null;
    bankName?: string | null;
    bankAccountName?: string | null;
    bankAccountNumber?: string | null;
    bankRoutingNumber?: string | null;
    mobileBankingProvider?: string | null;
    mobileBankingNumber?: string | null;
    documents?: Array<{
      id: string;
      documentName: string;
      documentType: string;
      fileUrl: string;
      createdAt: Date;
    }>;
  } | null;
  leaveBalances: Array<{
    leaveType: { id: string; name: string; code?: string };
    allocatedDays: number | string;
    usedDays: number | string;
    remainingDays: number | string;
  }>;
  attendanceStats: {
    totalDays: number;
    presentDays: number;
    lateDays: number;
    halfDays: number;
    absentDays: number;
  };
  latestPayroll?: {
    periodName: string;
    netSalary: string;
    paymentStatus: string;
    recordId: string;
    periodId: string;
  } | null;
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatShiftTime(time: Date | string | null | undefined) {
  if (!time) return "—";
  if (time instanceof Date) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    }).format(time);
  }
  return String(time);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function maskAccountNumber(acc?: string | null) {
  if (!acc) return "—";
  if (acc.length <= 4) return acc;
  return `••••••••${acc.slice(-4)}`;
}

export function ProfileView({
  user,
  employee,
  leaveBalances,
  attendanceStats,
  latestPayroll,
}: ProfileViewProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);

  const displayName = employee?.fullName || user.email.split("@")[0];
  const displayRole = user.role.name;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* ===================== HERO CARD ===================== */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-sm">
        {/* Subtle decorative background gradient */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-[#162E51]/10 via-[#C52227]/5 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#162E51]/5 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative size-20 sm:size-24 shrink-0 rounded-2xl bg-gradient-to-br from-[#162E51] to-[#0D1C33] p-1 shadow-md ring-2 ring-white">
              {employee?.profilePhotoUrl ? (
                <Image
                  src={employee.profilePhotoUrl}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="size-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center rounded-xl bg-[#162E51] text-white text-2xl font-bold tracking-tight">
                  {initials(displayName)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 size-5 rounded-full border-2 border-white bg-emerald-500 ring-2 ring-emerald-500/20" />
            </div>

            {/* Title & metadata */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {displayName}
                </h1>
                {employee?.employeeCode && (
                  <Badge variant="outline" className="font-mono text-xs font-semibold bg-neutral-50 text-neutral-700 border-neutral-300">
                    {employee.employeeCode}
                  </Badge>
                )}
                <Badge className="bg-[#162E51] text-white hover:bg-[#162E51]/90 text-xs font-semibold">
                  {displayRole}
                </Badge>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                {employee?.designation && (
                  <span className="flex items-center gap-1 font-medium text-neutral-700">
                    <BriefcaseIcon className="size-3.5 text-[#162E51]" />
                    {employee.designation.name}
                  </span>
                )}
                {employee?.department && (
                  <span className="flex items-center gap-1">
                    <Building2Icon className="size-3.5 text-neutral-400" />
                    {employee.department.name}
                  </span>
                )}
                <span className="flex items-center gap-1 font-mono text-neutral-600">
                  <MailIcon className="size-3.5 text-neutral-400" />
                  {employee?.workEmail || user.email}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
            {employee && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditContactOpen(true)}
                className="gap-1.5 text-xs font-semibold rounded-xl border-neutral-300 hover:bg-neutral-50"
              >
                <PencilIcon className="size-3.5 text-neutral-600" />
                <span>Edit Contact</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangePasswordOpen(true)}
              className="gap-1.5 text-xs font-semibold rounded-xl border-neutral-300 hover:bg-neutral-50"
            >
              <KeyIcon className="size-3.5 text-neutral-600" />
              <span>Change Password</span>
            </Button>

            {employee && (
              <Link
                href={`/attendance/${employee.id}`}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "gap-1.5 text-xs font-semibold rounded-xl bg-[#162E51] hover:bg-[#0D1C33] text-white"
                )}
              >
                <CalendarCheckIcon className="size-3.5" />
                <span>My Attendance</span>
              </Link>
            )}
          </div>
        </div>

        {/* Quick self-service badges bar */}
        <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/leave"
            className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/70 hover:bg-neutral-100/70 transition-colors border border-neutral-200/60 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UmbrellaIcon className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-500">Leave Portal</p>
                <p className="text-xs font-bold text-neutral-900">Request Leave</p>
              </div>
            </div>
            <ExternalLinkIcon className="size-3 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
          </Link>

          <Link
            href="/payroll/my"
            className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/70 hover:bg-neutral-100/70 transition-colors border border-neutral-200/60 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BanknoteIcon className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-500">My Payslips</p>
                <p className="text-xs font-bold text-neutral-900">
                  {latestPayroll ? latestPayroll.periodName : "View History"}
                </p>
              </div>
            </div>
            <ExternalLinkIcon className="size-3 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
          </Link>

          {employee && (
            <Link
              href={`/attendance/${employee.id}`}
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/70 hover:bg-neutral-100/70 transition-colors border border-neutral-200/60 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ClockIcon className="size-4" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">Monthly Attendance</p>
                  <p className="text-xs font-bold text-neutral-900">
                    {attendanceStats.presentDays} Days Present
                  </p>
                </div>
              </div>
              <ExternalLinkIcon className="size-3 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
            </Link>
          )}

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/60">
            <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheckIcon className="size-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-neutral-500">System Security</p>
              <p className="text-xs font-bold text-neutral-900">Account Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== BENTO GRID CONTENT ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Job & Employment Details */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#162E51]/10 text-[#162E51]">
                  <BriefcaseIcon className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-neutral-900">Job & Employment Details</h2>
              </div>
              <Badge variant="secondary" className="text-[11px]">
                {employee?.employmentType?.replace("_", " ") || "Full Time"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Employee Code</p>
                <p className="text-sm font-bold font-mono text-neutral-900 mt-0.5">
                  {employee?.employeeCode || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Department</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {employee?.department?.name || "Unassigned"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Designation</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {employee?.designation?.name || "Unassigned"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Joining Date</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {formatDate(employee?.joiningDate)}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Assigned Shift</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {employee?.shift
                    ? `${employee.shift.name} (${formatShiftTime(employee.shift.startTime)} – ${formatShiftTime(employee.shift.endTime)})`
                    : "Standard Shift"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Reporting Manager</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {employee?.reportingManager?.fullName || "None (Direct Report)"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Personal & Contact Information */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                  <UserIcon className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-neutral-900">Personal Information</h2>
              </div>
              {employee && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditContactOpen(true)}
                  className="h-7 text-xs font-semibold text-neutral-600 hover:text-neutral-900 gap-1"
                >
                  <PencilIcon className="size-3" />
                  Edit
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Phone Number</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {employee?.phone || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Personal Email</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5 truncate">
                  {employee?.personalEmail || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Date of Birth</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {formatDate(employee?.dateOfBirth)}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Gender</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5 capitalize">
                  {employee?.gender?.toLowerCase() || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Blood Group</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {employee?.bloodGroup || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Nationality</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {employee?.nationality || "Bangladeshi"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                  <MapPinIcon className="size-3" />
                  Present Address
                </p>
                <p className="text-xs font-semibold text-neutral-800 mt-1 leading-relaxed">
                  {employee?.presentAddress || "Not specified"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                  <MapPinIcon className="size-3" />
                  Permanent Address
                </p>
                <p className="text-xs font-semibold text-neutral-800 mt-1 leading-relaxed">
                  {employee?.permanentAddress || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Emergency Contact */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                  <ShieldAlertIcon className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-neutral-900">Emergency Contact</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Contact Person</p>
                <p className="text-sm font-bold text-neutral-900 mt-0.5">
                  {employee?.emergencyContactName || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Relationship</p>
                <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                  {employee?.emergencyContactRelationship || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Emergency Phone</p>
                <p className="text-sm font-semibold font-mono text-rose-700 mt-0.5">
                  {employee?.emergencyContactPhone ? (
                    <a href={`tel:${employee.emergencyContactPhone}`} className="hover:underline">
                      {employee.emergencyContactPhone}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Payment & Bank Details (if available) */}
          {employee?.paymentMethod && (
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <CreditCardIcon className="size-4" />
                  </div>
                  <h2 className="text-sm font-bold text-neutral-900">Disbursement & Payment Details</h2>
                </div>
                <Badge variant="outline" className="text-xs">
                  {employee.paymentMethod.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                  <p className="text-[11px] font-medium text-neutral-400">Bank / Provider</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                    {employee.bankName || employee.mobileBankingProvider || "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                  <p className="text-[11px] font-medium text-neutral-400">Account / Mobile No.</p>
                  <p className="text-sm font-mono font-semibold text-neutral-900 mt-0.5">
                    {maskAccountNumber(employee.bankAccountNumber || employee.mobileBankingNumber)}
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                  <p className="text-[11px] font-medium text-neutral-400">Account Name / Routing</p>
                  <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                    {employee.bankAccountName || employee.bankRoutingNumber || "Verified"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col wide on desktop) */}
        <div className="space-y-6">
          {/* Card 5: Security & Portal Login */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                  <KeyIcon className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-neutral-900">Security & Account</h2>
              </div>
              <span className="size-2 rounded-full bg-emerald-500" />
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Login Email</p>
                <p className="text-xs font-mono font-semibold text-neutral-900 mt-0.5 truncate">
                  {user.email}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Assigned System Role</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-[#162E51]">{user.role.name}</span>
                  <Badge variant="outline" className="text-[10px] bg-white">
                    Full Permissions
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
                <p className="text-[11px] font-medium text-neutral-400">Account Created</p>
                <p className="text-xs font-medium text-neutral-700 mt-0.5">
                  {formatDate(user.createdAt)}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangePasswordOpen(true)}
                className="w-full gap-2 text-xs font-semibold rounded-xl border-neutral-300 hover:bg-neutral-50 h-9"
              >
                <KeyIcon className="size-3.5 text-neutral-600" />
                Update Password
              </Button>
            </div>
          </div>

          {/* Card 6: Leave Balance Snapshot */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                  <UmbrellaIcon className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-neutral-900">Leave Balance ({new Date().getFullYear()})</h2>
              </div>
              <Link href="/leave" className="text-xs font-semibold text-[#162E51] hover:underline flex items-center gap-0.5">
                Apply
                <ExternalLinkIcon className="size-3" />
              </Link>
            </div>

            {leaveBalances.length === 0 ? (
              <p className="text-xs text-neutral-400 py-2">No leave allocations found for this year.</p>
            ) : (
              <div className="space-y-3">
                {leaveBalances.map((item) => {
                  const allocated = Number(item.allocatedDays);
                  const used = Number(item.usedDays);
                  const remaining = Number(item.remainingDays);
                  const pct = allocated > 0 ? Math.min(100, Math.round((used / allocated) * 100)) : 0;

                  return (
                    <div key={item.leaveType.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-800">{item.leaveType.name}</span>
                        <span className="text-neutral-500 font-mono text-[11px]">
                          <strong className="text-neutral-900">{remaining}</strong> / {allocated} left
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#162E51] to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 7: Attendance Snapshot (This Month) */}
          <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                  <CalendarCheckIcon className="size-4" />
                </div>
                <h2 className="text-sm font-bold text-neutral-900">Attendance (This Month)</h2>
              </div>
              {employee && (
                <Link
                  href={`/attendance/${employee.id}`}
                  className="text-xs font-semibold text-[#162E51] hover:underline flex items-center gap-0.5"
                >
                  Details
                  <ExternalLinkIcon className="size-3" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <p className="text-lg font-bold text-emerald-700 font-mono">
                  {attendanceStats.presentDays}
                </p>
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mt-0.5">
                  Present
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <p className="text-lg font-bold text-amber-700 font-mono">
                  {attendanceStats.lateDays}
                </p>
                <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mt-0.5">
                  Late
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/70">
                <p className="text-lg font-bold text-neutral-800 font-mono">
                  {attendanceStats.totalDays}
                </p>
                <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">
                  Logged
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ChangeOwnPasswordDialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        userEmail={user.email}
      />

      {employee && (
        <EditContactDialog
          open={isEditContactOpen}
          onOpenChange={setIsEditContactOpen}
          initialData={{
            phone: employee.phone,
            personalEmail: employee.personalEmail,
            presentAddress: employee.presentAddress,
            emergencyContactName: employee.emergencyContactName,
            emergencyContactRelationship: employee.emergencyContactRelationship,
            emergencyContactPhone: employee.emergencyContactPhone,
          }}
        />
      )}
    </div>
  );
}
