"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  CheckIcon,
  HelpCircleIcon,
  LockIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { rolesService } from "@/lib/services/roles-service"
import {
  ALL_PERMISSIONS,
  DATA_SCOPE_LABELS,
  PERMISSION_MODULE_LABELS,
  type DataScope,
  type PermissionDefinition,
  type PermissionModule,
  type Role,
} from "@/types/roles"

interface RoleEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: Role | null // If null/undefined, mode is "Create"
  onSaved: (savedRole: Role) => void
}

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

const SCOPE_OPTIONS: DataScope[] = ["all", "department", "team", "self"]

export function RoleEditorDialog({
  open,
  onOpenChange,
  role,
  onSaved,
}: RoleEditorDialogProps) {
  const isEditing = Boolean(role)
  const isSystemAdmin = role?.id === "role_admin"

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [dataScope, setDataScope] = React.useState<DataScope>("all")
  const [selectedPermissions, setSelectedPermissions] = React.useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  // Initialize form state when opened or role changes
  React.useEffect(() => {
    if (open) {
      if (role) {
        setName(role.name)
        setDescription(role.description)
        setDataScope(role.dataScope)
        setSelectedPermissions(new Set(role.permissions))
      } else {
        setName("")
        setDescription("")
        setDataScope("department")
        // Default to safe employee view permissions
        setSelectedPermissions(new Set(["employees.view"]))
      }
      setSearchQuery("")
      setError(null)
    }
  }, [open, role])

  // Dependency mapping lookups
  const permissionMap = React.useMemo(() => {
    const map = new Map<string, PermissionDefinition>()
    ALL_PERMISSIONS.forEach((p) => map.set(p.id, p))
    return map
  }, [])

  // Auto-resolve dependencies when toggling
  const handleTogglePermission = (permId: string) => {
    if (isSystemAdmin) return

    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      const willEnable = !next.has(permId)

      if (willEnable) {
        next.add(permId)
        // Automatically check all dependencies
        const addDependencies = (id: string) => {
          const def = permissionMap.get(id)
          if (def?.dependencies) {
            for (const dep of def.dependencies) {
              next.add(dep)
              addDependencies(dep)
            }
          }
        }
        addDependencies(permId)
      } else {
        next.delete(permId)
        // Automatically uncheck anything that depends on this permission
        const removeDependents = (id: string) => {
          ALL_PERMISSIONS.forEach((p) => {
            if (p.dependencies?.includes(id) && next.has(p.id)) {
              next.delete(p.id)
              removeDependents(p.id)
            }
          })
        }
        removeDependents(permId)
      }

      return next
    })
  }

  const handleSelectAll = () => {
    if (isSystemAdmin) return
    setSelectedPermissions(new Set(ALL_PERMISSIONS.map((p) => p.id)))
  }

  const handleClearAll = () => {
    if (isSystemAdmin) return
    setSelectedPermissions(new Set())
  }

  const handleToggleModule = (module: PermissionModule) => {
    if (isSystemAdmin) return
    const modulePerms = ALL_PERMISSIONS.filter((p) => p.module === module)
    const allSelected = modulePerms.every((p) => selectedPermissions.has(p.id))

    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        // Deselect all in this module
        modulePerms.forEach((p) => {
          next.delete(p.id)
          // Also remove any other permissions depending on these
          ALL_PERMISSIONS.forEach((other) => {
            if (other.dependencies?.includes(p.id)) {
              next.delete(other.id)
            }
          })
        })
      } else {
        // Select all in this module + their dependencies
        modulePerms.forEach((p) => {
          next.add(p.id)
          if (p.dependencies) {
            p.dependencies.forEach((d) => next.add(d))
          }
        })
      }
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanName = name.trim()
    const cleanDesc = description.trim()

    if (!cleanName) {
      setError("Role Name is required.")
      return
    }

    if (cleanName.length < 3) {
      setError("Role Name must be at least 3 characters.")
      return
    }

    if (!cleanDesc) {
      setError("Role Description is required to clarify scope of duties.")
      return
    }

    if (selectedPermissions.size === 0) {
      setError("A role must have at least one permission granted.")
      return
    }

    if (isEditing && role) {
      const res = rolesService.updateRole(role.id, {
        name: cleanName,
        description: cleanDesc,
        dataScope,
        permissions: Array.from(selectedPermissions),
      })

      if (!res.success) {
        setError(res.error)
        return
      }

      onSaved(res.role)
    } else {
      const created = rolesService.createRole({
        name: cleanName,
        description: cleanDesc,
        dataScope,
        permissions: Array.from(selectedPermissions),
      })
      onSaved(created)
    }

    onOpenChange(false)
  }

  // Filter permissions by search
  const filteredPermissions = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return ALL_PERMISSIONS
    return ALL_PERMISSIONS.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        PERMISSION_MODULE_LABELS[p.module].toLowerCase().includes(q)
    )
  }, [searchQuery])

  // Group filtered permissions by module
  const groupedPermissions = React.useMemo(() => {
    const groups: { module: PermissionModule; label: string; permissions: PermissionDefinition[] }[] = []
    MODULE_ORDER.forEach((mod) => {
      const perms = filteredPermissions.filter((p) => p.module === mod)
      if (perms.length > 0) {
        groups.push({
          module: mod,
          label: PERMISSION_MODULE_LABELS[mod],
          permissions: perms,
        })
      }
    })
    return groups
  }, [filteredPermissions])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <DialogHeader className="p-5 border-b border-border/70 shrink-0">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-foreground">
                <ShieldCheckIcon className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold tracking-tight">
                  {isEditing ? `Edit Role: ${role?.name}` : "Create Custom Role"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {isEditing
                    ? "Adjust assigned permissions, data boundaries, and description."
                    : "Define a granular security role and configure organizational data visibility."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircleIcon className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isSystemAdmin && (
              <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-700 dark:text-blue-400">
                <LockIcon className="size-4 shrink-0 mt-0.5" />
                <span>
                  The <strong>Administrator</strong> role has permanent system-wide permissions across all modules to ensure platform governance.
                </span>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Role Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lead Talent Partner"
                  disabled={isSystemAdmin}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Data Scope Boundary <span className="text-destructive">*</span>
                </label>
                <select
                  value={dataScope}
                  onChange={(e) => setDataScope(e.target.value as DataScope)}
                  disabled={isSystemAdmin}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
                >
                  {SCOPE_OPTIONS.map((scope) => (
                    <option key={scope} value={scope}>
                      {DATA_SCOPE_LABELS[scope].label} — ({scope.toUpperCase()})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  {DATA_SCOPE_LABELS[dataScope].description}
                </p>
              </div>

              <div className="col-span-1 sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Description <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the key operational authority and responsibility of this role"
                  required
                  className="text-xs"
                />
              </div>
            </div>

            {/* Data Scope Visual Cards */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Data Scope Level
                </span>
                <span className="text-[11px] text-muted-foreground">Controls organizational record visibility</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SCOPE_OPTIONS.map((scope) => {
                  const isSelected = dataScope === scope
                  return (
                    <button
                      key={scope}
                      type="button"
                      disabled={isSystemAdmin}
                      onClick={() => setDataScope(scope)}
                      className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "border-foreground bg-foreground/5 dark:bg-foreground/10 font-semibold"
                          : "border-border/80 hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <span className={`text-xs ${isSelected ? "text-foreground font-semibold" : ""}`}>
                        {DATA_SCOPE_LABELS[scope].label}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                        {DATA_SCOPE_LABELS[scope].description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Module Permissions
                  </span>
                  <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-medium text-foreground">
                    {selectedPermissions.size} of {ALL_PERMISSIONS.length} selected
                  </span>
                </div>

                {!isSystemAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[11px] text-muted-foreground hover:text-foreground font-medium underline underline-offset-2"
                    >
                      Select All
                    </button>
                    <span className="text-muted-foreground/40">•</span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[11px] text-muted-foreground hover:text-foreground font-medium underline underline-offset-2"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Search Filter */}
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter permissions by module or keyword..."
                  className="pl-8 text-xs h-8"
                />
              </div>

              {/* Grouped Accordions / Lists */}
              <div className="space-y-4 pt-1">
                {groupedPermissions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No permissions match "{searchQuery}"
                  </div>
                ) : (
                  groupedPermissions.map((group) => {
                    const groupPerms = group.permissions
                    const groupSelectedCount = groupPerms.filter((p) => selectedPermissions.has(p.id)).length
                    const isAllInGroupSelected = groupSelectedCount === groupPerms.length

                    return (
                      <div
                        key={group.module}
                        className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs"
                      >
                        {/* Group Header */}
                        <div className="flex items-center justify-between bg-muted/40 px-3.5 py-2 border-b border-border/60">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-foreground">
                              {group.label}
                            </span>
                            <span className="text-[10.5px] text-muted-foreground font-mono">
                              ({groupSelectedCount}/{groupPerms.length})
                            </span>
                          </div>

                          {!isSystemAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleModule(group.module)}
                              className="text-[11px] font-medium text-muted-foreground hover:text-foreground underline underline-offset-2"
                            >
                              {isAllInGroupSelected ? "Deselect All" : "Select All"}
                            </button>
                          )}
                        </div>

                        {/* Permission Items */}
                        <div className="divide-y divide-border/40">
                          {groupPerms.map((p) => {
                            const isChecked = isSystemAdmin || selectedPermissions.has(p.id)
                            return (
                              <label
                                key={p.id}
                                className={`flex items-start gap-3 p-3 transition-colors cursor-pointer select-none ${
                                  isChecked ? "bg-foreground/[0.02]" : "hover:bg-muted/20"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isSystemAdmin}
                                  onChange={() => handleTogglePermission(p.id)}
                                  className="mt-0.5 size-4 rounded border-border text-zinc-900 focus:ring-zinc-950 dark:text-zinc-100 disabled:opacity-60"
                                />
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-foreground">
                                      {p.label}
                                    </span>
                                    <span className="font-mono text-[10px] text-muted-foreground/80">
                                      {p.id}
                                    </span>
                                    {p.dependencies && p.dependencies.length > 0 && (
                                      <span className="rounded bg-muted px-1.5 py-0.2 text-[9.5px] text-muted-foreground font-mono">
                                        Req: {p.dependencies.join(", ")}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    {p.description}
                                  </p>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 border-t border-border/70 shrink-0 bg-muted/20">
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
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold px-5"
            >
              {isEditing ? "Save Role Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
