import * as React from "react"
import {
  CalendarCheckIcon,
  CalendarClockIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"

export type FutureModuleType = "attendance" | "leave" | "payroll"

interface ModuleConfig {
  title: string
  description: string
  detail: string
  icon: LucideIcon
}

const MODULE_CONFIGS: Record<FutureModuleType, ModuleConfig> = {
  attendance: {
    title: "Attendance records will appear here",
    description:
      "Daily biometric sign-ins, clock-in/out timestamps, shift verification, and monthly presence percentages for this employee will be automatically compiled into this view.",
    detail:
      "When the Attendance module is enabled, work hours, overtime, break durations, and automated shift tracking will be recorded in real-time.",
    icon: CalendarCheckIcon,
  },
  leave: {
    title: "Leave history will appear here",
    description:
      "Paid time off (PTO) requests, sick leave allocations, casual leaves, and annual vacation balances for this employee will be displayed here.",
    detail:
      "Automated leave accrual, holiday calendars, manager approval workflows, and remaining balance summaries will be accessible once the Leave module is active.",
    icon: CalendarClockIcon,
  },
  payroll: {
    title: "Payroll records will appear here",
    description:
      "Generated monthly payslips, salary disbursements, tax withholdings, itemized deductions, and downloadable tax certificates will be available in this section.",
    detail:
      "Payroll computations integrate directly with the employee's configured base compensation, approved attendance records, and reimbursable allowances.",
    icon: WalletIcon,
  },
}

interface TabPlaceholderProps {
  module: FutureModuleType
  employeeName: string
}

export function TabPlaceholder({ module, employeeName }: TabPlaceholderProps) {
  const config = MODULE_CONFIGS[module]

  return (
    <div className="rounded-xl border border-border/80 bg-card p-8 sm:p-12 shadow-xs">
      <EmptyState
        icon={config.icon}
        title={config.title}
        description={`${config.description} Currently, ${employeeName} has no historical ${module} records to display.`}
      />
      <div className="mx-auto mt-6 max-w-md rounded-lg border border-border/60 bg-muted/30 p-3.5 text-center text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Module Notice: </span>
        {config.detail}
      </div>
    </div>
  )
}
