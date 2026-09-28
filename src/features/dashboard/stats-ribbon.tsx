"use client"

import * as React from "react"
import { StatCard } from "@/components/shared/stat-card"
import { dashboardStats as defaultStats } from "@/features/dashboard/mock-data"
import { departmentsService } from "@/lib/services/departments-service"
import { employeesService } from "@/lib/services/employees-service"

export function DashboardStatsRibbon() {
  const [stats, setStats] = React.useState(defaultStats)

  React.useEffect(() => {
    try {
      const employees = employeesService.getEmployees()
      const departments = departmentsService.getDepartments()

      setStats((prev) =>
        prev.map((s) => {
          if (s.label === "Total Employees") {
            return {
              ...s,
              value: employees.length,
              subtext: `${departments.length} departments`,
            }
          }
          return s
        })
      )
    } catch {
      // Keep default stats
    }
  }, [])

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
