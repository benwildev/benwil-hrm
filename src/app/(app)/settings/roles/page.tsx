"use client"

import * as React from "react"
import {
  CopyIcon,
  EditIcon,
  EyeIcon,
  LockIcon,
  PlusIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RoleEditorDialog } from "@/features/roles/role-editor-dialog"
import { rolesService } from "@/lib/services/roles-service"
import { ALL_PERMISSIONS, DATA_SCOPE_LABELS, type Role } from "@/types/roles"

export default function RolesSettingsPage() {
  const [roles, setRoles] = React.useState<Role[]>([])
  const [selectedRoleForEdit, setSelectedRoleForEdit] = React.useState<Role | null>(null)
  const [isEditorOpen, setIsEditorOpen] = React.useState(false)

  // Delete State
  const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  const loadRoles = React.useCallback(() => {
    const list = rolesService.getRoles()
    setRoles(list)
  }, [])

  React.useEffect(() => {
    loadRoles()
  }, [loadRoles])

  const handleCreateNew = () => {
    setSelectedRoleForEdit(null)
    setIsEditorOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setSelectedRoleForEdit(role)
    setIsEditorOpen(true)
  }

  const handleDuplicate = (role: Role) => {
    rolesService.duplicateRole(role.id)
    loadRoles()
  }

  const handleDeleteClick = (role: Role) => {
    setDeleteError(null)
    setRoleToDelete(role)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!roleToDelete) return
    const res = rolesService.deleteRole(roleToDelete.id)
    if (!res.success) {
      setDeleteError(res.error || "Failed to delete role.")
      return
    }
    setIsDeleteDialogOpen(false)
    setRoleToDelete(null)
    loadRoles()
  }

  // Summary Metrics
  const systemRolesCount = roles.filter((r) => r.isSystem).length
  const customRolesCount = roles.filter((r) => !r.isSystem).length
  const totalAssignedUsers = React.useMemo(() => {
    return roles.reduce((sum, r) => sum + rolesService.getAssignedUsersCount(r.id), 0)
  }, [roles])

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Roles & Permissions
            </h1>
            <Badge variant="outline" className="font-mono text-[11px] font-semibold">
              {roles.length} Roles
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Define organizational roles, assign granular permissions across 9 modules, and enforce data boundaries.
          </p>
        </div>

        <Button
          onClick={handleCreateNew}
          size="sm"
          className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold shadow-xs"
        >
          <PlusIcon className="size-3.5 mr-1.5" />
          Create Custom Role
        </Button>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-1">
          <span className="text-[11px] text-muted-foreground">Total Roles</span>
          <p className="text-lg font-bold text-foreground font-mono">{roles.length}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-1">
          <span className="text-[11px] text-muted-foreground">System Roles</span>
          <p className="text-lg font-bold text-foreground font-mono">{systemRolesCount}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-1">
          <span className="text-[11px] text-muted-foreground">Custom Roles</span>
          <p className="text-lg font-bold text-foreground font-mono">{customRolesCount}</p>
        </div>
        <div className="rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs space-y-1">
          <span className="text-[11px] text-muted-foreground">Assigned Accounts</span>
          <p className="text-lg font-bold text-foreground font-mono">{totalAssignedUsers}</p>
        </div>
      </div>

      {/* Roles Master Table */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="px-4 py-3">Role & Description</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Data Scope</th>
                <th className="px-4 py-3">Assigned Accounts</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {roles.map((r) => {
                const assignedCount = rolesService.getAssignedUsersCount(r.id)
                const scopeInfo = DATA_SCOPE_LABELS[r.dataScope] || {
                  label: r.dataScope,
                  description: "",
                }

                return (
                  <tr
                    key={r.id}
                    className="hover:bg-muted/20 transition-colors group"
                  >
                    {/* Role Name & Description */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5 max-w-xs sm:max-w-sm">
                        <Link
                          href={`/settings/roles/${r.id}`}
                          className="font-semibold text-foreground hover:underline flex items-center gap-1.5"
                        >
                          <span>{r.name}</span>
                          {r.isSystem && (
                            <LockIcon className="size-3 text-muted-foreground shrink-0" />
                          )}
                        </Link>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                          {r.description}
                        </p>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${
                          r.isSystem
                            ? "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300"
                        }`}
                      >
                        {r.isSystem ? "System" : "Custom"}
                      </Badge>
                    </td>

                    {/* Data Scope */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-mono border-zinc-200 dark:border-zinc-800"
                      >
                        {scopeInfo.label}
                      </Badge>
                    </td>

                    {/* Assigned Accounts */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Link
                        href={`/settings/roles/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs font-mono font-medium text-foreground hover:underline"
                      >
                        <UsersIcon className="size-3.5 text-muted-foreground" />
                        <span>{assignedCount} {assignedCount === 1 ? "account" : "accounts"}</span>
                      </Link>
                    </td>

                    {/* Permissions count */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs text-foreground font-medium">
                        {r.permissions.length}
                      </span>
                      <span className="text-[10.5px] text-muted-foreground">
                        {" "}
                        / {ALL_PERMISSIONS.length}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/settings/roles/${r.id}`}
                          title="View Role Details"
                          className="size-7 inline-flex items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                        >
                          <EyeIcon className="size-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleEditRole(r)}
                          title="Edit Role & Permissions"
                          className="size-7 inline-flex items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                        >
                          <EditIcon className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(r)}
                          title="Duplicate Role"
                          className="size-7 inline-flex items-center justify-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                        >
                          <CopyIcon className="size-3.5" />
                        </button>

                        {!r.isSystem && (
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(r)}
                            title={
                              assignedCount > 0
                                ? "Cannot delete role while assigned to accounts"
                                : "Delete Custom Role"
                            }
                            disabled={assignedCount > 0}
                            className="size-7 inline-flex items-center justify-center rounded-md border border-border/60 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Trash2Icon className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      <RoleEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        role={selectedRoleForEdit}
        onSaved={() => loadRoles()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={`Delete Role: ${roleToDelete?.name}?`}
        description={
          deleteError
            ? deleteError
            : `Are you sure you want to permanently delete the custom role "${roleToDelete?.name}"? This action cannot be undone.`
        }
        confirmLabel="Delete Role"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
