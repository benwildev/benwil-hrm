"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  LockIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { authService } from "@/lib/auth/auth-service"
import { rolesService } from "@/lib/services/roles-service"
import { DATA_SCOPE_LABELS, type Role } from "@/types/roles"
import type { EmployeeAccount } from "@/types/auth"
import type { Employee } from "@/types/organization"

interface ChangeRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
  account: EmployeeAccount
  onRoleChanged: () => void
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  employee,
  account,
  onRoleChanged,
}: ChangeRoleDialogProps) {
  const [roles, setRoles] = React.useState<Role[]>([])
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      const allRoles = rolesService.getRoles()
      setRoles(allRoles)
      const currentRole = rolesService.getRoleForAccount(account)
      setSelectedRoleId(currentRole.id)
      setError(null)
      setIsSubmitting(false)
    }
  }, [open, account])

  const currentRole = React.useMemo(() => {
    return rolesService.getRoleForAccount(account)
  }, [account])

  const targetRole = React.useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || null
  }, [roles, selectedRoleId])

  // Single active admin protection check
  const isLastActiveAdmin = React.useMemo(() => {
    const isCurrentAdmin = account.role === "admin" || account.roleId === "role_admin"
    if (!isCurrentAdmin || account.status !== "active") return false

    const accounts = authService.getAccounts()
    const activeAdmins = accounts.filter(
      (a) => (a.role === "admin" || a.roleId === "role_admin") && a.status === "active"
    )
    return activeAdmins.length <= 1
  }, [account])

  const isPreventedDowngrade =
    isLastActiveAdmin && targetRole?.id !== "role_admin"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetRole || isPreventedDowngrade) return

    setIsSubmitting(true)
    setError(null)

    const res = authService.updateEmployeeAccountRole(employee.id, targetRole.id)

    if (!res.success) {
      setError(res.error)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    onOpenChange(false)
    onRoleChanged()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground">
                <ShieldCheckIcon className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Change Account Role
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Update application permissions and data boundary for {employee.fullName}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                <ShieldAlertIcon className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isPreventedDowngrade && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-400">
                <AlertCircleIcon className="size-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Administrator Protection</p>
                  <p className="text-[11px] leading-relaxed">
                    This account is currently the <strong>only active Administrator</strong> in Benwil HRM. You cannot remove administrator privileges without first assigning the Administrator role to another active employee.
                  </p>
                </div>
              </div>
            )}

            {/* Current vs New Context */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Employee:</span>
                <span className="font-semibold text-foreground">
                  {employee.fullName} ({employee.employeeCode || employee.id})
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Current Assigned Role:</span>
                <Badge variant="outline" className="font-mono text-[10px] gap-1">
                  {currentRole.name}
                </Badge>
              </div>
            </div>

            {/* Role Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Select New Role
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isSystem ? "— (System)" : "— (Custom)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Role Preview Card */}
            {targetRole && (
              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground text-xs">
                      {targetRole.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9.5px] font-medium ${
                        targetRole.isSystem
                          ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300"
                      }`}
                    >
                      {targetRole.isSystem ? "System Role" : "Custom Role"}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {targetRole.permissions.length} permissions
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {targetRole.description}
                </p>

                <div className="rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5 text-[11px] flex items-center justify-between">
                  <span className="text-muted-foreground">Data Scope:</span>
                  <span className="font-medium text-foreground">
                    {DATA_SCOPE_LABELS[targetRole.dataScope]?.label || targetRole.dataScope}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPreventedDowngrade || isSubmitting || selectedRoleId === currentRole.id}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold px-4 disabled:opacity-50"
            >
              {isSubmitting ? "Updating Role..." : "Confirm Role Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
