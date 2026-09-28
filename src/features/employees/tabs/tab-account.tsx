import * as React from "react"
import { ShieldCheckIcon } from "lucide-react"

import { AccountAccessCard } from "@/features/employees/account-access-card"
import type { EmployeeWithRelations } from "@/types/organization"

interface TabAccountProps {
  employee: EmployeeWithRelations
  onProfileUpdated: () => void
}

export function TabAccount({ employee, onProfileUpdated }: TabAccountProps) {
  return (
    <div className="space-y-6">
      {/* Informational Guidance Banner */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs flex items-start gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
          <ShieldCheckIcon className="size-5" />
        </div>
        <div className="text-xs space-y-0.5">
          <h2 className="text-sm font-semibold text-foreground">
            Identity & Authentication Governance
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Manage system portal credentials, multi-factor security, temporary access
            passwords, and account activation state for {employee.firstName}{" "}
            {employee.lastName}.
          </p>
        </div>
      </div>

      {/* Account Access Card Component from Phase 3 */}
      <AccountAccessCard employee={employee} onAccountChange={onProfileUpdated} />
    </div>
  )
}
