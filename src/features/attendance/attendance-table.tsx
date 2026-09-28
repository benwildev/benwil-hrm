"use client"

import { CalendarCheckIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { type AttendanceLog, punchTypeLabel } from "@/features/attendance/attendance-events"
import { getInitials } from "@/lib/utils"

export function AttendanceTable() {
  const [rows, setRows] = useState<AttendanceLog[] | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch("/api/attendance", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { events: [] }))
      .then(({ events }: { events: AttendanceLog[] }) => {
        if (!cancelled) setRows(events)
      })
      .catch(() => {
        if (!cancelled) setRows([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  const columns: DataTableColumn<AttendanceLog>[] = [
    {
      key: "employee",
      header: "Employee",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>
              {getInitials(row.employeeName ?? row.biometricUserId ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {row.employeeName ?? `Unmatched PIN ${row.biometricUserId ?? "—"}`}
            </p>
            <p className="truncate text-xs text-muted-foreground">{row.deviceName}</p>
          </div>
        </div>
      ),
    },
    {
      key: "time",
      header: "Time",
      cell: (row) => (
        <span className="text-sm text-foreground">
          {new Date(row.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Punch",
      cell: (row) => <StatusBadge status={punchTypeLabel(row.punchType)} />,
    },
  ]

  if (rows === null) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-sm text-muted-foreground">
        Loading attendance…
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      emptyState={
        <EmptyState
          icon={CalendarCheckIcon}
          title="No attendance records yet"
          description="Attendance activity will appear here once employees start checking in."
        />
      }
    />
  )
}
