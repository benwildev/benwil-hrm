"use client"

import * as React from "react"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  CopyIcon,
  EditIcon,
  LockIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RoleEditorDialog } from "@/features/roles/role-editor-dialog"
import { departmentsService } from "@/lib/services/departments-service"
import { designationsService } from "@/lib/services/designations-service"
import { rolesService } from "@/lib/services/roles-service"
import {
  ALL_PERMISSIONS,
  DATA_SCOPE_LABELS,
  PERMISSION_MODULE_LABELS,
  type PermissionModule,
  type Role,
} from "@/types/roles"
import type { EmployeeAccount } from "@/types/auth"
import type { Employee } from "@/types/organization"

const MODULE_ORDER: PermissionModule[] = [
  "employees",
  "departments",
  "teams",
  "designations",
  "attendance",
  "leave",
  "payroll",
  "reports",
  "settings",
]

export default function RoleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params?.id as string

  const [role, setRole] = React.useState<Role | null>(null)
  const [assignedUsers, setAssignedUsers] = React.useState<
    { account: EmployeeAccount; employee: Employee | null }[]
  >([])
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  const loadRoleData = React.useCallback(() => {
    const found = rolesService.getRole(roleId)
    setRole(found)
    if (found) {
      const assigned = rolesService.getAssignedEmployees(found.id)
      setAssignedUsers(assigned)
    }
  }, [roleId])

  React.useEffect(() => {
    loadRoleData()
  }, [loadRoleData])

  if (!role) {
    return (
      <div className="space-y-4">
        <Link
          href="/settings/roles"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          <span>Back to Roles & Permissions</span>
        </Link>
        <div className="rounded-xl border border-border/80 bg-card p-12 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">Role Not Found</p>
          <p className="text-xs text-muted-foreground">
            The requested role does not exist or may have been deleted.
          </p>
          <Button render={<Link href="/settings/roles" />} size="sm" variant="outline" className="text-xs mt-2">
            Return to Roles Overview
          </Button>
        </div>
      </div>
    )
  }

  const scopeInfo = DATA_SCOPE_LABELS[role.dataScope] || {
    label: role.dataScope,
    description: "",
  }

  const handleDuplicate = () => {
    const res = rolesService.duplicateRole(role.id)
    if (res.success) {
      router.push(`/settings/roles/${res.role.id}`)
    }
  }

  const handleDeleteConfirm = () => {
    setDeleteError(null)
    const res = rolesService.deleteRole(role.id)
    if (!res.success) {
      setDeleteError(res.error || "Failed to delete role.")
      return
    }
    setIsDeleteDialogOpen(false)
    router.push("/settings/roles")
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/settings/roles"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          <span>Back to Roles & Permissions</span>
        </Link>
      </div>

      {/* Role Header Banner */}
      <div className="rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {role.name}
              </h1>
              <Badge
                variant="outline"
                className={`text-[10px] font-medium ${
                  role.isSystem
                    ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300"
                }`}
              >
                {role.isSystem ? "Built-in System Role" : "Custom Role"}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono">
                Scope: {scopeInfo.label}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono">
                {role.permissions.length} / {ALL_PERMISSIONS.length} Permissions
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              {role.description}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditorOpen(true)}
              className="text-xs gap-1.5"
            >
              <EditIcon className="size-3.5" />
              Edit Role
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              className="text-xs gap-1.5"
            >
              <CopyIcon className="size-3.5" />
              Duplicate
            </Button>

            {!role.isSystem && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteError(null)
                  setIsDeleteDialogOpen(true)
                }}
                disabled={assignedUsers.length > 0}
                className="text-xs text-destructive hover:bg-destructive/10 gap-1.5 disabled:opacity-40"
              >
                <Trash2Icon className="size-3.5" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Scope Context Alert */}
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-semibold text-foreground">Data Scope Enforcement: </span>
            <span className="text-muted-foreground">{scopeInfo.description}</span>
          </div>
          {role.isSystem && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 ml-4">
              <LockIcon className="size-3" /> Protected
            </span>
          )}
        </div>
      </div>

      {/* Section 1: Assigned Employees */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs space-y-0">
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-4 text-muted-foreground" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Assigned Employee Accounts ({assignedUsers.length})
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Employees granted these operational capabilities
          </span>
        </div>

        {assignedUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">No accounts currently assigned</p>
            <p>
              To assign this role to an employee, navigate to their employee profile &gt; Account &amp; Security and select "Change Role".
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {assignedUsers.map(({ account, employee }) => {
              const name = employee?.fullName || account.email.split("@")[0]
              const code = employee?.employeeCode || employee?.id || "—"
              const department = employee?.departmentId
                ? departmentsService.getDepartment(employee.departmentId)?.name || "—"
                : "—"
              const designation = employee?.designationId
                ? designationsService.getDesignation(employee.designationId)?.name || "—"
                : "—"

              return (
                <div
                  key={account.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                      {name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {employee ? (
                          <Link
                            href={`/employees/${employee.id}`}
                            className="font-semibold text-xs text-foreground hover:underline"
                          >
                            {name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-xs text-foreground">{name}</span>
                        )}
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {code}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {account.email} • {department} • <span className="italic">{designation}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium capitalize ${
                        account.status === "active"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : account.status === "pending"
                          ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-400"
                          : "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {account.status}
                    </Badge>

                    {employee && (
                      <Button render={<Link href={`/employees/${employee.id}`} />} variant="outline" size="sm" className="h-7 text-xs px-2.5">
                        View Profile
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Section 2: Complete Permission Matrix */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs space-y-0">
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="size-4 text-muted-foreground" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Permission Matrix ({role.permissions.length} Enabled)
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Complete audit of enabled and disabled capabilities
          </span>
        </div>

        <div className="p-5 space-y-6">
          {MODULE_ORDER.map((module) => {
            const modulePerms = ALL_PERMISSIONS.filter((p) => p.module === module)
            const enabledCount = modulePerms.filter((p) => role.permissions.includes(p.id)).length

            return (
              <div key={module} className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {PERMISSION_MODULE_LABELS[module]}
                    </span>
                    <Badge variant="outline" className="font-mono text-[9.5px]">
                      {enabledCount} of {modulePerms.length} Active
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {modulePerms.map((perm) => {
                    const isEnabled = role.permissions.includes(perm.id)
                    return (
                      <div
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs transition-colors ${
                          isEnabled
                            ? "border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10"
                            : "border-border/40 bg-muted/10 opacity-60"
                        }`}
                      >
                        {isEnabled ? (
                          <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircleIcon className="size-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-semibold ${
                                isEnabled ? "text-foreground" : "text-muted-foreground line-through decoration-muted-foreground/40"
                              }`}
                            >
                              {perm.label}
                            </span>
                            <span className="font-mono text-[9.5px] text-muted-foreground">
                              {perm.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {perm.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Editor Modal */}
      <RoleEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        role={role}
        onSaved={() => loadRoleData()}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={`Delete Role "${role.name}"?`}
        description={
          deleteError
            ? deleteError
            : `Are you sure you want to permanently delete this custom role? This action cannot be undone.`
        }
        confirmLabel="Delete Role"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
