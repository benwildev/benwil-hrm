import {
  DownloadIcon,
  PlusIcon,
} from "lucide-react"
import Link from "next/link"

import { PageContainer } from "@/components/shared/page-container"
import { Button } from "@/components/ui/button"
import { DashboardStatsRibbon } from "@/features/dashboard/stats-ribbon"
import {
  AttendanceOverview,
  PendingLeaveRequests,
  RecentActivity,
  TaskOverview,
  TodaysActivity,
} from "@/features/dashboard/widgets"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export default function DashboardPage() {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date())

  return (
    <PageContainer className="gap-5">
      {/* Executive Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {getGreeting()}, Admin
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              108 on duty today
            </span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{today}</span>
            <span>·</span>
            <span>Single-Company HQ Workspace</span>
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            className="text-xs font-medium text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            render={<Link href="/reports" />}
          >
            <DownloadIcon className="size-3.5" />
            Export Digest
          </Button>

          <Button
            size="sm"
            nativeButton={false}
            className="text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs active:scale-[0.98] transition-all"
            render={<Link href="/employees/new" />}
          >
            <PlusIcon className="size-3.5" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* 5-Column High-Density KPI Ribbon */}
      <DashboardStatsRibbon />

      {/* Asymmetrical Bento Operational Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column (2/3): Primary Analytics & Approvals */}
        <div className="space-y-4 lg:col-span-2">
          <AttendanceOverview />
          <PendingLeaveRequests />
        </div>

        {/* Right Column (1/3): Telemetry, Tasks, and Audit Stream */}
        <div className="space-y-4 lg:col-span-1">
          <TodaysActivity />
          <TaskOverview />
          <RecentActivity />
        </div>
      </div>
    </PageContainer>
  )
}
