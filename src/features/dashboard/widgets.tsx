"use client"

import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  attendanceBreakdown,
  pendingLeaveRequests as initialPendingLeaveRequests,
  recentActivity,
  taskOverview,
  todaysActivity,
} from "@/features/dashboard/mock-data"
import { cn } from "@/lib/utils"

export function AttendanceOverview() {
  const totalStaff = 124
  const totalEvents = attendanceBreakdown.reduce((sum, item) => sum + item.value, 0)
  const presentCount = attendanceBreakdown.find((i) => i.label === "Present")?.value ?? 108
  const turnoutPercent = ((presentCount / totalStaff) * 100).toFixed(1)

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Workforce Attendance
            </CardTitle>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Real-time clock-in telemetry · HQ & Remote
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/attendance" />}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Timesheets <ArrowRightIcon className="size-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-5 pt-1">
        {/* Turnout Headline Metric */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 rounded-lg bg-zinc-50/70 p-3.5 border border-zinc-100 dark:bg-zinc-900/40 dark:border-zinc-800">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {turnoutPercent}%
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                On Duty Today ({presentCount} / {totalStaff} Staff)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Average arrival time: <strong className="text-foreground font-medium">8:48 AM</strong> · 90% on-time rate
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-200/50">
            <SparklesIcon className="size-3.5" />
            <span>Optimal Attendance</span>
          </div>
        </div>

        {/* Multi-segment visual progress bar */}
        <div className="space-y-2">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 p-0.5 dark:bg-zinc-800 gap-0.5">
            {attendanceBreakdown.map((item) => (
              <div
                key={item.label}
                title={`${item.label}: ${item.value} (${item.percentage})`}
                className={cn("h-full rounded-full transition-all duration-500", item.barClassName)}
                style={{ width: `${(item.value / totalEvents) * 100}%` }}
              />
            ))}
          </div>
        </div>

        {/* Breakdown 4-cell Bento Strip */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {attendanceBreakdown.map((item) => (
            <div
              key={item.label}
              className={cn(
                "group/item rounded-lg border p-3 transition-all hover:border-zinc-300/80 dark:hover:border-zinc-700",
                item.bgLight
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium tracking-wide uppercase opacity-85">
                  {item.label}
                </span>
                <span className="text-[10px] font-mono tabular-nums opacity-75">
                  {item.percentage}
                </span>
              </div>
              <p className={cn("mt-1 text-2xl font-bold tracking-tight tabular-nums", item.textClassName)}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function TodaysActivity() {
  const [filter, setFilter] = useState<"all" | "late" | "leave">("all")

  const filteredItems = todaysActivity.filter((item) => {
    if (filter === "late") return item.status === "late"
    if (filter === "leave") return item.status === "leave"
    return true
  })

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Today’s Check-ins
          </CardTitle>
          <span className="text-xs font-mono text-muted-foreground tabular-nums">
            108 total
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Live stream of personnel arrivals and status
        </p>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 pt-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
              filter === "all"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
            )}
          >
            All (5)
          </button>
          <button
            type="button"
            onClick={() => setFilter("late")}
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
              filter === "late"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300"
            )}
          >
            Late (1)
          </button>
          <button
            type="button"
            onClick={() => setFilter("leave")}
            className={cn(
              "rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
              filter === "leave"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
            )}
          >
            Leave (1)
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-1.5 pt-0">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-zinc-200 hover:bg-zinc-50/70 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/40"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar size="sm" className="ring-1 ring-border">
                <AvatarFallback className="text-[11px] font-medium text-zinc-700 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300">
                  {item.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-baseline gap-1.5 overflow-hidden">
                  <p className="text-xs font-semibold text-foreground shrink-0">
                    {item.name}
                  </p>
                  <span className="truncate text-[10px] text-muted-foreground font-normal">
                    · {item.department}
                  </span>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  {item.action}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
                  item.status === "on-time" && "bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/30 dark:text-emerald-300",
                  item.status === "late" && "bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/30 dark:text-amber-300",
                  item.status === "leave" && "bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-950/30 dark:text-blue-300",
                  item.status === "out" && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}
              >
                <ClockIcon className="size-2.5" />
                {item.time}
              </span>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <Link
            href="/attendance"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all 108 check-in records <ArrowRightIcon className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function PendingLeaveRequests() {
  const requests = initialPendingLeaveRequests
  const [decisionLog, setDecisionLog] = useState<Record<string, "approved" | "declined">>({})

  const handleAction = (id: string, action: "approved" | "declined") => {
    setDecisionLog((prev) => ({ ...prev, [id]: action }))
  }

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-foreground">
              Pending Leave Requests
            </CardTitle>
            <span className="rounded-full bg-amber-50 border border-amber-200/60 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {requests.length - Object.keys(decisionLog).length} pending
            </span>
          </div>
          <Link
            href="/leave"
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Review All →
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          Review time-off requests awaiting administrative clearance
        </p>
      </CardHeader>

      <CardContent className="space-y-2.5 pt-0">
        {requests.map((item) => {
          const decision = decisionLog[item.id]

          return (
            <div
              key={item.id}
              className="rounded-lg border border-border/70 p-3 space-y-2.5 bg-card hover:border-zinc-300/80 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarFallback className="text-[11px] font-medium">
                      {item.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground">{item.department}</p>
                  </div>
                </div>
                <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                  {item.type} · {item.duration}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground bg-zinc-50/70 dark:bg-zinc-900/50 px-2.5 py-1.5 rounded-md border border-zinc-100 dark:border-zinc-800">
                <span className="flex items-center gap-1 text-[11px]">
                  <CalendarIcon className="size-3 text-muted-foreground" />
                  {item.dates}
                </span>
                <span className="text-[10px] italic truncate max-w-[160px]">
                  {item.reason}
                </span>
              </div>

              {/* Action Buttons or Decision Result */}
              <div className="flex items-center justify-end gap-2 pt-0.5">
                {decision ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded",
                      decision === "approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    )}
                  >
                    <CheckCircle2Icon className="size-3" />
                    {decision === "approved" ? "Approved" : "Declined"}
                  </span>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleAction(item.id, "declined")}
                      className="text-xs text-zinc-600 hover:text-rose-600 hover:border-rose-200"
                    >
                      <XIcon className="size-3" />
                      Decline
                    </Button>
                    <Button
                      size="xs"
                      onClick={() => handleAction(item.id, "approved")}
                      className="text-xs bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      <CheckIcon className="size-3" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function TaskOverview() {
  const total = taskOverview.reduce((sum, item) => sum + item.value, 0)
  const completedCount = taskOverview.find((i) => i.label === "Completed")?.value ?? 42
  const completedPercent = Math.round((completedCount / total) * 100)

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Sprint & HR Tasks
          </CardTitle>
          <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            {completedPercent}% completed
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Operational velocity and pending milestones
        </p>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Overall progress bar */}
        <div className="rounded-lg bg-zinc-50/70 p-3 border border-zinc-100 dark:bg-zinc-900/40 dark:border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Overall Progress</span>
            <span className="font-mono text-muted-foreground tabular-nums">
              {completedCount} of {total} items
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-500"
              style={{ width: `${completedPercent}%` }}
            />
          </div>
        </div>

        {/* 3 Categories */}
        <div className="space-y-2.5">
          {taskOverview.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground">({item.badge})</span>
                </div>
                <span className="font-mono font-semibold tabular-nums text-foreground">
                  {item.value}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={cn("h-full rounded-full transition-all", item.barClassName)}
                  style={{ width: `${(item.value / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Sprint 18 ending Friday</span>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Manage Tasks <ArrowRightIcon className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function RecentActivity() {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            System Activity Log
          </CardTitle>
          <span className="text-[11px] text-muted-foreground font-mono">
            Audited
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Administrative changes, onboarding, and payroll actions
        </p>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-200 dark:before:bg-zinc-800">
          {recentActivity.map((item) => (
            <div key={item.id} className="relative group/activity">
              {/* Dot on timeline */}
              <div className="absolute -left-5 top-1 size-2 rounded-full bg-zinc-400 ring-2 ring-background group-hover/activity:bg-zinc-900 transition-colors" />

              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground leading-snug">
                  {item.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {item.subtitle}
                </p>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                  {item.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <Link
            href="/reports"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View Full Audit Trail <ArrowRightIcon className="size-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
