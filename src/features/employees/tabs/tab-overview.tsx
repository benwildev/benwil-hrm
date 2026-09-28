import * as React from "react"
import {
  ActivityIcon,
  ArrowRightIcon,
  Building2Icon,
  CalendarCheckIcon,
  ClockIcon,
  KeyRoundIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { EmployeeAccount } from "@/types/auth"
import type {
  EmergencyContact,
  EmployeeActivity,
  EmployeeNote,
  EmployeePersonalInfo,
  EmploymentDetails,
} from "@/types/employee-profile"
import type { EmployeeWithRelations } from "@/types/organization"

interface TabOverviewProps {
  employee: EmployeeWithRelations
  account: EmployeeAccount | null
  personalInfo: EmployeePersonalInfo
  emergencyContacts: EmergencyContact[]
  employmentDetails: EmploymentDetails
  activities: EmployeeActivity[]
  notes: EmployeeNote[]
  onNavigateTab: (tab: string) => void
}

export function TabOverview({
  employee,
  account,
  personalInfo,
  emergencyContacts,
  employmentDetails,
  activities,
  notes,
  onNavigateTab,
}: TabOverviewProps) {
  const primaryEmergency = emergencyContacts.find((c) => c.isPrimary) || emergencyContacts[0]
  const recentActivities = activities.slice(0, 3)
  const latestNote = notes[0]

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* LEFT COLUMN (2 Cols): Summaries */}
      <div className="space-y-6 lg:col-span-2">
        {/* 1. Employment Summary Card */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <CalendarCheckIcon className="size-4 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Employment Summary
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("employment")}
              className="text-xs font-medium text-foreground hover:underline flex items-center gap-1"
            >
              <span>View Details</span>
              <ArrowRightIcon className="size-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Joined Date</span>
              <p className="font-semibold text-foreground">
                {new Date(employee.joiningDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Employment Type</span>
              <p className="font-semibold text-foreground capitalize">
                {employee.employmentType.replace("_", " ")}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Work Location</span>
              <p className="font-semibold text-foreground">
                {employmentDetails.workLocation || "HQ - New York Office"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Notice Period</span>
              <p className="font-semibold text-foreground">
                {employmentDetails.noticePeriod || "30 Days"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Probation Status</span>
              <p className="font-semibold text-foreground">
                {employmentDetails.confirmationDate ? "Confirmed Regular" : "Probationary"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Direct Reports</span>
              <p className="font-semibold text-foreground">
                {employee.directReports?.length || 0} direct reports
              </p>
            </div>
          </div>
        </div>

        {/* 2. Personal & Contact Summary Card */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <UserIcon className="size-4 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Personal Information Summary
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("personal")}
              className="text-xs font-medium text-foreground hover:underline flex items-center gap-1"
            >
              <span>View Full Profile</span>
              <ArrowRightIcon className="size-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Work Email</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
                <MailIcon className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Personal Email</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground truncate">
                <MailIcon className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{personalInfo.personalEmail || "—"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Primary Contact Phone</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <PhoneIcon className="size-3.5 text-muted-foreground shrink-0" />
                <span>{employee.phone}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Residential Location</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <MapPinIcon className="size-3.5 text-muted-foreground shrink-0" />
                <span>
                  {personalInfo.city && personalInfo.country
                    ? `${personalInfo.city}, ${personalInfo.country}`
                    : personalInfo.addressLine || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Organizational Hierarchy Summary */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Building2Icon className="size-4 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Organizational Hierarchy & Placement
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("organization")}
              className="text-xs font-medium text-foreground hover:underline flex items-center gap-1"
            >
              <span>Org Hierarchy</span>
              <ArrowRightIcon className="size-3" />
            </button>
          </div>

          {/* Visual path breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
            <span className="font-semibold text-foreground">Benwil HQ</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium text-foreground">
              {employee.department ? employee.department.name : "Unassigned Department"}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="font-medium text-foreground">
              {employee.team ? employee.team.name : "No Specific Team"}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className="font-bold text-foreground underline underline-offset-4">
              {employee.fullName}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Direct Line Manager</span>
              {employee.manager ? (
                <div className="flex items-center gap-2 pt-0.5">
                  <Avatar className="size-6">
                    <AvatarImage src={employee.manager.avatar} alt={employee.manager.fullName} />
                    <AvatarFallback className="text-[10px]">
                      {employee.manager.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Link
                    href={`/employees/${employee.manager.id}`}
                    className="font-medium text-foreground hover:underline truncate"
                  >
                    {employee.manager.fullName}
                  </Link>
                </div>
              ) : (
                <p className="font-medium text-muted-foreground italic">Reports directly to Executive CEO</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Work Schedule</span>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <ClockIcon className="size-3.5 text-muted-foreground shrink-0" />
                <span>Mon – Fri (09:00 AM – 06:00 PM EST)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (1 Col): Account & Quick Signals */}
      <div className="space-y-6">
        {/* 1. Account Access Card Preview */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <KeyRoundIcon className="size-4 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account Status
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("account")}
              className="text-xs font-medium text-foreground hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRightIcon className="size-3" />
            </button>
          </div>

          {account ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">System Login Access</span>
                {account.status === "active" ? (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1.5 text-[11px] font-semibold">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Active
                  </Badge>
                ) : account.status === "disabled" ? (
                  <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive gap-1.5 text-[11px] font-semibold">
                    <span className="size-1.5 rounded-full bg-destructive" />
                    Disabled
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-400 gap-1.5 text-[11px] font-semibold">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Pending First Login
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Credential Email</span>
                <span className="font-medium text-foreground truncate max-w-[170px]" title={account.email}>
                  {account.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Sign In</span>
                <span className="font-medium text-foreground">
                  {account.lastLoginAt
                    ? new Date(account.lastLoginAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Never logged in"}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground text-[11px]">
                This employee currently has no system login credentials provisioned.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateTab("account")}
                className="w-full text-xs"
              >
                Provision Account
              </Button>
            </div>
          )}
        </div>

        {/* 2. Emergency Contact Quick Info */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <PhoneIcon className="size-4 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Emergency Contact
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("personal")}
              className="text-xs font-medium text-foreground hover:underline"
            >
              {primaryEmergency ? "Manage" : "Add"}
            </button>
          </div>

          {primaryEmergency ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{primaryEmergency.name}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {primaryEmergency.relationship}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <PhoneIcon className="size-3" />
                <span className="font-medium text-foreground">{primaryEmergency.phone}</span>
              </div>
              {primaryEmergency.email && (
                <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                  <MailIcon className="size-3 shrink-0" />
                  <span className="truncate">{primaryEmergency.email}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No emergency contact registered yet.
            </p>
          )}
        </div>

        {/* 3. Recent Activity Preview */}
        <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <ActivityIcon className="size-4 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recent Activity
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("activity")}
              className="text-xs font-medium text-foreground hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRightIcon className="size-3" />
            </button>
          </div>

          {recentActivities.length > 0 ? (
            <div className="space-y-3 text-xs">
              {recentActivities.map((act) => (
                <div key={act.id} className="relative pl-4 border-l border-border/70 space-y-0.5">
                  <span className="absolute -left-1 top-1 size-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <p className="font-medium text-foreground text-[11px] leading-tight">{act.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(act.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No recent activity recorded.</p>
          )}
        </div>

        {/* 4. Latest Internal HR Note Preview */}
        {latestNote && (
          <div className="rounded-xl border border-border/80 bg-card p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Internal HR Note
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab("activity")}
                className="text-xs font-medium text-foreground hover:underline"
              >
                View
              </button>
            </div>
            <p className="text-xs text-foreground italic line-clamp-3">
              &ldquo;{latestNote.content}&rdquo;
            </p>
            <span className="text-[10px] text-muted-foreground block text-right">
              — {latestNote.authorName}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
