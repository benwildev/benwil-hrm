"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  WalletIcon,
  FileTextIcon,
  NetworkIcon,
  IdCardIcon,
  ClockAlertIcon,
  CalendarOffIcon,
  ShieldCheckIcon,
  Building2Icon,
  BarChart3Icon,
  CheckIcon,
  SearchIcon,
  RotateCcwIcon,
  CheckCheckIcon,
  XIcon,
  LockIcon,
  AlertCircleIcon,
  EyeIcon,
  PlusCircleIcon,
  Edit3Icon,
  Trash2Icon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateRolePermissionsAction } from "@/server/actions/roles.actions";

type Permission = {
  id: string;
  key: string;
  group: string;
  description: string | null;
};

interface RolePermissionsFormProps {
  roleId: string;
  roleName: string;
  permissions: Permission[];
  initialSelected: string[];
  disabled?: boolean;
}

interface ModuleSpec {
  id: string;
  name: string;
  groupNames: string[];
  description: string;
  icon: React.ElementType;
}

const MODULE_SPECS: ModuleSpec[] = [
  {
    id: "employees",
    name: "Employees Directory",
    groupNames: ["Employees"],
    description: "Employee directory, profiles, job titles, and status",
    icon: UsersIcon,
  },
  {
    id: "documents",
    name: "Personnel Documents",
    groupNames: ["Documents"],
    description: "Identity documents, certificates, and contracts",
    icon: FileTextIcon,
  },
  {
    id: "attendance",
    name: "Attendance & Shifts",
    groupNames: ["Attendance"],
    description: "Daily punch logs, lateness rules, and biometric machines",
    icon: ClockIcon,
  },
  {
    id: "leave",
    name: "Leave & Time-Off",
    groupNames: ["Leave"],
    description: "Leave requests, quotas, approvals, and balances",
    icon: CalendarDaysIcon,
  },
  {
    id: "payroll",
    name: "Payroll & Compensation",
    groupNames: ["Payroll"],
    description: "Salary structures, monthly runs, deductions, and payslips",
    icon: WalletIcon,
  },
  {
    id: "departments",
    name: "Departments",
    groupNames: ["Departments"],
    description: "Organizational departments and team groupings",
    icon: NetworkIcon,
  },
  {
    id: "designations",
    name: "Designations",
    groupNames: ["Designations"],
    description: "Job designations, ranks, and hierarchy levels",
    icon: IdCardIcon,
  },
  {
    id: "shifts",
    name: "Working Shifts",
    groupNames: ["Shifts"],
    description: "Operational shifts, break durations, and schedules",
    icon: ClockAlertIcon,
  },
  {
    id: "holidays",
    name: "Public Holidays",
    groupNames: ["Holidays"],
    description: "Company holiday calendar and non-working days",
    icon: CalendarOffIcon,
  },
  {
    id: "roles",
    name: "Access Control & Roles",
    groupNames: ["Access Control"],
    description: "System user roles, permissions, and security",
    icon: ShieldCheckIcon,
  },
  {
    id: "company",
    name: "Company Profile",
    groupNames: ["Company"],
    description: "Company branding, legal name, tax ID, and address",
    icon: Building2Icon,
  },
  {
    id: "reports",
    name: "Analytics & Reports",
    groupNames: ["Reports"],
    description: "Workforce distribution, attendance, and payroll reports",
    icon: BarChart3Icon,
  },
];

export function RolePermissionsForm({
  roleId,
  roleName,
  permissions,
  initialSelected,
  disabled,
}: RolePermissionsFormProps) {
  const [selected, setSelected] = useState(() => new Set(initialSelected));
  const [initialSet] = useState(() => new Set(initialSelected));
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active" | "inactive">("all");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const totalPermissions = permissions.length;
  const activeCount = selected.size;
  const initialCount = initialSet.size;

  // Toggle single permission
  const togglePermission = (id: string) => {
    if (disabled) return;
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Toggle multiple permissions (e.g., entire row)
  const toggleRowPermissions = (modulePerms: Permission[], selectAll: boolean) => {
    if (disabled) return;
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      for (const p of modulePerms) {
        if (selectAll) next.add(p.id);
        else next.delete(p.id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (disabled) return;
    setSaved(false);
    setSelected(new Set(permissions.map((p) => p.id)));
  };

  const clearAll = () => {
    if (disabled) return;
    setSaved(false);
    setSelected(new Set());
  };

  const resetToSaved = () => {
    if (disabled) return;
    setSaved(false);
    setSelected(new Set(initialSet));
  };

  const handleSave = () => {
    if (disabled) return;
    setSaveError(null);
    startTransition(async () => {
      try {
        await updateRolePermissionsAction(roleId, Array.from(selected));
        setSaved(true);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "Failed to save permissions.");
      }
    });
  };

  // Resolve permissions per module into CRUD slots
  const moduleData = useMemo(() => {
    return MODULE_SPECS.map((spec) => {
      const perms = permissions.filter((p) => spec.groupNames.includes(p.group));

      // Categorize into Read, Create, Update, Delete, and Special
      let readPerm: Permission | undefined;
      let createPerm: Permission | undefined;
      let updatePerm: Permission | undefined;
      let deletePerm: Permission | undefined;
      const specialPerms: Permission[] = [];

      for (const p of perms) {
        const k = p.key;
        if (k.endsWith(":read") || k.endsWith(":view") || k.endsWith(":view:all")) {
          readPerm = readPerm || p;
        } else if (k.endsWith(":create") || k.endsWith(":write")) {
          createPerm = createPerm || p;
        } else if (k.endsWith(":update") || k.endsWith(":manage")) {
          // Check if it's a special manage action
          if (k.includes(":policy:") || k.startsWith("devices:") || k === "payroll:run" || k === "leave:approve") {
            specialPerms.push(p);
          } else {
            updatePerm = updatePerm || p;
          }
        } else if (k.endsWith(":delete")) {
          deletePerm = deletePerm || p;
        } else {
          specialPerms.push(p);
        }
      }

      const allModulePerms = perms;
      const activeInModule = perms.filter((p) => selected.has(p.id)).length;
      const isAllActive = allModulePerms.length > 0 && activeInModule === allModulePerms.length;

      return {
        spec,
        allModulePerms,
        readPerm,
        createPerm,
        updatePerm,
        deletePerm,
        specialPerms,
        activeInModule,
        isAllActive,
      };
    });
  }, [permissions, selected]);

  // Filter modules based on search and tab
  const filteredModules = useMemo(() => {
    return moduleData.filter(({ spec, activeInModule }) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = spec.name.toLowerCase().includes(q);
        const matchDesc = spec.description.toLowerCase().includes(q);
        if (!matchName && !matchDesc) return false;
      }

      if (filterMode === "active" && activeInModule === 0) return false;
      if (filterMode === "inactive" && activeInModule > 0) return false;

      return true;
    });
  }, [moduleData, searchQuery, filterMode]);

  const addedCount = Array.from(selected).filter((id) => !initialSet.has(id)).length;
  const removedCount = Array.from(initialSet).filter((id) => !selected.has(id)).length;
  const isDirty = addedCount > 0 || removedCount > 0;
  const coveragePercent = Math.round((activeCount / (totalPermissions || 1)) * 100);

  return (
    <div className="w-full space-y-6">
      {/* Top Controls Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                Role Permission Matrix
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {activeCount} of {totalPermissions} Active Permissions
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">
              Standardized Read, Write/Create, Update, and Delete matrix. Existing permissions for <strong>{roleName}</strong> are marked with green checkmarks.
            </p>
          </div>

          {!disabled && (
            <div className="flex items-center gap-2 self-start lg:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <CheckCheckIcon className="size-3.5" />
                <span>Grant All</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="h-8 text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <XIcon className="size-3.5" />
                <span>Revoke All</span>
              </Button>
              {isDirty && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetToSaved}
                  className="h-8 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RotateCcwIcon className="size-3.5" />
                  <span>Reset ({initialCount})</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Coverage Meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>Overall Privileges Granted</span>
            <span className="font-semibold text-foreground">{coveragePercent}%</span>
          </div>
          <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>

        {/* Search & Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search module or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-input bg-background text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterMode === "all"
                  ? "bg-background text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Modules ({MODULE_SPECS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("active")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === "active"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckIcon className="size-3 text-emerald-500" />
              <span>Assigned Existing ({moduleData.filter((m) => m.activeInModule > 0).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("inactive")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                filterMode === "inactive"
                  ? "bg-background text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unconfigured ({moduleData.filter((m) => m.activeInModule === 0).length})
            </button>
          </div>
        </div>
      </div>

      {saveError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircleIcon className="size-4 text-rose-600 mt-0.5 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main CRUD Matrix Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 pl-6 pr-4 min-w-[260px]">Resource Module</th>
                <th className="py-3.5 px-3 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                    <EyeIcon className="size-3.5" />
                    <span>Read</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <PlusCircleIcon className="size-3.5" />
                    <span>Create</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                    <Edit3Icon className="size-3.5" />
                    <span>Update</span>
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center min-w-[100px]">
                  <div className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                    <Trash2Icon className="size-3.5" />
                    <span>Delete</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 min-w-[180px]">Special Actions</th>
                <th className="py-3.5 pl-3 pr-6 text-right min-w-[100px]">Row Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-sans">
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No matching modules found for your search filter.
                  </td>
                </tr>
              ) : (
                filteredModules.map(
                  ({
                    spec,
                    allModulePerms,
                    readPerm,
                    createPerm,
                    updatePerm,
                    deletePerm,
                    specialPerms,
                    activeInModule,
                    isAllActive,
                  }) => {
                    const Icon = spec.icon;

                    return (
                      <tr
                        key={spec.id}
                        className="hover:bg-muted/20 transition-colors group"
                      >
                        {/* 1. Module Info */}
                        <td className="py-4 pl-6 pr-4 align-middle">
                          <div className="flex items-start gap-3">
                            <div className="size-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-foreground shrink-0 mt-0.5 border border-border/60">
                              <Icon className="size-4.5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-foreground">
                                  {spec.name}
                                </span>
                                {activeInModule > 0 && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                    {activeInModule}/{allModulePerms.length}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                {spec.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. Read Action Cell */}
                        <td className="py-4 px-3 text-center align-middle">
                          {readPerm ? (
                            <MatrixCheckboxCell
                              permission={readPerm}
                              isChecked={selected.has(readPerm.id)}
                              isExisting={initialSet.has(readPerm.id)}
                              disabled={disabled}
                              onToggle={() => togglePermission(readPerm!.id)}
                            />
                          ) : (
                            <span className="text-neutral-300 dark:text-neutral-700 select-none">—</span>
                          )}
                        </td>

                        {/* 3. Create Action Cell */}
                        <td className="py-4 px-3 text-center align-middle">
                          {createPerm ? (
                            <MatrixCheckboxCell
                              permission={createPerm}
                              isChecked={selected.has(createPerm.id)}
                              isExisting={initialSet.has(createPerm.id)}
                              disabled={disabled}
                              onToggle={() => togglePermission(createPerm!.id)}
                            />
                          ) : (
                            <span className="text-neutral-300 dark:text-neutral-700 select-none">—</span>
                          )}
                        </td>

                        {/* 4. Update Action Cell */}
                        <td className="py-4 px-3 text-center align-middle">
                          {updatePerm ? (
                            <MatrixCheckboxCell
                              permission={updatePerm}
                              isChecked={selected.has(updatePerm.id)}
                              isExisting={initialSet.has(updatePerm.id)}
                              disabled={disabled}
                              onToggle={() => togglePermission(updatePerm!.id)}
                            />
                          ) : (
                            <span className="text-neutral-300 dark:text-neutral-700 select-none">—</span>
                          )}
                        </td>

                        {/* 5. Delete Action Cell */}
                        <td className="py-4 px-3 text-center align-middle">
                          {deletePerm ? (
                            <MatrixCheckboxCell
                              permission={deletePerm}
                              isChecked={selected.has(deletePerm.id)}
                              isExisting={initialSet.has(deletePerm.id)}
                              disabled={disabled}
                              onToggle={() => togglePermission(deletePerm!.id)}
                            />
                          ) : (
                            <span className="text-neutral-300 dark:text-neutral-700 select-none">—</span>
                          )}
                        </td>

                        {/* 6. Special Actions */}
                        <td className="py-4 px-4 align-middle">
                          {specialPerms.length === 0 ? (
                            <span className="text-neutral-300 dark:text-neutral-700 select-none">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {specialPerms.map((sp) => {
                                const isChecked = selected.has(sp.id);
                                const isExisting = initialSet.has(sp.id);
                                return (
                                  <button
                                    key={sp.id}
                                    type="button"
                                    onClick={() => togglePermission(sp.id)}
                                    disabled={disabled}
                                    title={sp.description || sp.key}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                                      isChecked
                                        ? "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-700 shadow-2xs font-bold"
                                        : "bg-background text-muted-foreground border-border/70 hover:border-border hover:bg-muted/40"
                                    } ${disabled ? "pointer-events-none opacity-60" : ""}`}
                                  >
                                    <span
                                      className={`size-1.5 rounded-full ${
                                        isChecked ? "bg-purple-600 dark:bg-purple-400" : "bg-neutral-300 dark:bg-neutral-600"
                                      }`}
                                    />
                                    <span>
                                      {sp.key === "payroll:run"
                                        ? "Run Payroll"
                                        : sp.key === "leave:approve"
                                          ? "Approve Leaves"
                                          : sp.key === "devices:manage"
                                            ? "Biometric Devices"
                                            : sp.key.includes("policy")
                                              ? "Lateness Policy"
                                              : sp.key === "reports:export"
                                                ? "Export Data"
                                                : sp.key}
                                    </span>
                                    {isExisting && isChecked && (
                                      <CheckIcon className="size-3 text-purple-600 dark:text-purple-400 stroke-[3]" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* 7. Row Toggle Control */}
                        <td className="py-4 pl-3 pr-6 text-right align-middle">
                          {!disabled && (
                            <button
                              type="button"
                              onClick={() => toggleRowPermissions(allModulePerms, !isAllActive)}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                isAllActive
                                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-2xs"
                                  : "border-border/80 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              }`}
                            >
                              {isAllActive ? "All Active" : "Toggle Row"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Centered Floating Sticky Action Bar */}
      {!disabled && (
        <div className="sticky bottom-6 z-30 mx-auto max-w-3xl rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md p-4 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-foreground">
              {activeCount} Active Permissions
            </span>
            {isDirty && (
              <span className="text-xs text-muted-foreground">
                ({addedCount > 0 ? `+${addedCount} granted` : ""}{" "}
                {removedCount > 0 ? `-${removedCount} revoked` : ""})
              </span>
            )}
            {saved && !isPending && !isDirty && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckIcon className="size-3.5 text-emerald-500" />
                Permissions Saved Successfully
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetToSaved}
                disabled={isPending}
                className="text-xs font-semibold"
              >
                Discard Changes
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isPending || !isDirty}
              className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold px-5"
            >
              {isPending
                ? "Saving..."
                : isDirty
                  ? `Save Permissions (${addedCount + removedCount} changes)`
                  : "Saved"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Interactive Checkbox Cell in the CRUD Matrix
 */
function MatrixCheckboxCell({
  permission,
  isChecked,
  isExisting,
  disabled,
  onToggle,
}: {
  permission: Permission;
  isChecked: boolean;
  isExisting: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      title={`${permission.key} - ${permission.description || ""}`}
      className={`inline-flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer select-none group/cell ${
        isChecked
          ? "bg-emerald-50/70 dark:bg-emerald-950/30"
          : "hover:bg-muted/40"
      } ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <div
        className={`size-7 rounded-lg border-2 flex items-center justify-center transition-all ${
          isChecked
            ? "bg-emerald-600 border-emerald-600 text-white shadow-xs scale-105"
            : "border-neutral-300 bg-background dark:border-neutral-700 group-hover/cell:border-neutral-400"
        }`}
      >
        {isChecked && <CheckIcon className="size-4 stroke-[3]" />}
      </div>

      {isExisting && isChecked && (
        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">
          <span className="size-1 rounded-full bg-emerald-500" />
          Existing
        </span>
      )}
    </div>
  );
}
