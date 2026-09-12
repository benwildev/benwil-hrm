"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  SearchIcon,
  XIcon,
  LayoutListIcon,
  LayoutGridIcon,
  CopyIcon,
  CheckIcon,
  MailIcon,
  PhoneIcon,
  ArrowUpRightIcon,
  PencilIcon,
  PlusIcon,
  DownloadIcon,
  UsersIcon,
  UserCheckIcon,
  CalendarClockIcon,
  Building2Icon,
  BriefcaseIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteEmployeeButton } from "@/components/employees/delete-employee-button";

export interface EmployeeListItem {
  id: string;
  employeeCode: string;
  fullName: string;
  profilePhotoUrl: string | null;
  personalEmail: string | null;
  workEmail: string | null;
  phone: string | null;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN" | null;
  employmentStatus: "ACTIVE" | "ON_LEAVE" | "RESIGNED" | "TERMINATED" | "INACTIVE";
  departmentId: string | null;
  department: { id: string; name: string } | null;
  designationId: string | null;
  designation: { id: string; name: string } | null;
  joiningDate: Date | string;
}

interface EmployeeDirectoryViewProps {
  employees: EmployeeListItem[];
  departments: { id: string; name: string }[];
  canManage: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; dotClass: string; badgeClass: string; bgSoft: string }
> = {
  ACTIVE: {
    label: "Active",
    dotClass: "bg-emerald-500 ring-emerald-500/20",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
    bgSoft: "bg-emerald-500",
  },
  ON_LEAVE: {
    label: "On Leave",
    dotClass: "bg-amber-500 ring-amber-500/20",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
    bgSoft: "bg-amber-500",
  },
  RESIGNED: {
    label: "Resigned",
    dotClass: "bg-zinc-400 ring-zinc-400/20",
    badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    bgSoft: "bg-zinc-400",
  },
  TERMINATED: {
    label: "Terminated",
    dotClass: "bg-rose-500 ring-rose-500/20",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50",
    bgSoft: "bg-rose-500",
  },
  INACTIVE: {
    label: "Inactive",
    dotClass: "bg-zinc-400 ring-zinc-400/20",
    badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    bgSoft: "bg-zinc-400",
  },
};

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  INTERN: "Intern",
};

const AVATAR_GRADIENTS = [
  "from-blue-600 to-indigo-600 text-white",
  "from-emerald-600 to-teal-600 text-white",
  "from-violet-600 to-purple-600 text-white",
  "from-amber-500 to-orange-600 text-white",
  "from-rose-500 to-pink-600 text-white",
  "from-cyan-600 to-blue-600 text-white",
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function EmployeeDirectoryView({
  employees,
  departments,
  canManage,
}: EmployeeDirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"TABLE" | "GRID">("TABLE");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Overall metrics
  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.employmentStatus === "ACTIVE").length;
  const onLeaveCount = employees.filter((e) => e.employmentStatus === "ON_LEAVE").length;
  const inactiveCount = employees.filter(
    (e) => !["ACTIVE", "ON_LEAVE"].includes(e.employmentStatus)
  ).length;
  const uniqueDepartments = new Set(
    employees.map((e) => e.department?.name).filter(Boolean)
  ).size;

  // Filtered list
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      // Status filter
      if (statusFilter === "ACTIVE" && employee.employmentStatus !== "ACTIVE") return false;
      if (statusFilter === "ON_LEAVE" && employee.employmentStatus !== "ON_LEAVE") return false;
      if (
        statusFilter === "INACTIVE" &&
        ["ACTIVE", "ON_LEAVE"].includes(employee.employmentStatus)
      ) {
        return false;
      }

      // Department filter
      if (departmentFilter !== "ALL" && employee.departmentId !== departmentFilter) {
        return false;
      }

      // Text search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = employee.fullName.toLowerCase().includes(q);
      const codeMatch = employee.employeeCode.toLowerCase().includes(q);
      const emailMatch =
        (employee.workEmail?.toLowerCase().includes(q) ?? false) ||
        (employee.personalEmail?.toLowerCase().includes(q) ?? false);
      const deptMatch = employee.department?.name.toLowerCase().includes(q) ?? false;
      const desigMatch = employee.designation?.name.toLowerCase().includes(q) ?? false;

      return nameMatch || codeMatch || emailMatch || deptMatch || desigMatch;
    });
  }, [employees, searchQuery, statusFilter, departmentFilter]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setDepartmentFilter("ALL");
  };

  return (
    <div className="space-y-6">
      {/* 1. Metric KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Staff */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 p-4 shadow-xs transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Staff</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#162E51]/10 text-[#162E51] ring-1 ring-[#162E51]/20">
              <UsersIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {totalCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">registered</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Personnel on record</p>
        </div>

        {/* Active Workforce */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-b from-emerald-50/30 via-white to-slate-50/50 p-4 shadow-xs transition-all hover:shadow-md hover:border-emerald-300 dark:border-emerald-900/40 dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Active Now</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30">
              <UserCheckIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700/70 dark:text-emerald-400/60">Active on duty roster</p>
        </div>

        {/* On Leave */}
        <div className="group relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-b from-amber-50/30 via-white to-slate-50/50 p-4 shadow-xs transition-all hover:shadow-md hover:border-amber-300 dark:border-amber-900/40 dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">On Leave</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30">
              <CalendarClockIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {onLeaveCount}
            </span>
            <span className="text-xs text-amber-700/80 dark:text-amber-400 font-medium">away today</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-700/70 dark:text-amber-400/60">Approved leave absences</p>
        </div>

        {/* Departments */}
        <div className="group relative overflow-hidden rounded-2xl border border-purple-200/60 bg-gradient-to-b from-purple-50/30 via-white to-slate-50/50 p-4 shadow-xs transition-all hover:shadow-md hover:border-purple-300 dark:border-purple-900/40 dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-400">Departments</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/30">
              <Building2Icon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-purple-700 dark:text-purple-300">
              {uniqueDepartments}
            </span>
            <span className="text-xs text-purple-600/80 dark:text-purple-400 font-medium">divisions</span>
          </div>
          <p className="mt-1 text-[11px] text-purple-700/70 dark:text-purple-400/60">Functional business units</p>
        </div>
      </div>

      {/* 2. Interactive Search, Filter & Controls Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Live Search Input */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID code, email, designation..."
              className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50/60 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <XIcon className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Department Filter */}
            {departments.length > 0 && (
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <option value="ALL">All Departments ({totalCount})</option>
                {departments.map((dept) => {
                  const count = employees.filter((e) => e.departmentId === dept.id).length;
                  return (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({count})
                    </option>
                  );
                })}
              </select>
            )}

            {/* View Mode Switcher (Table vs. Cards) */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/60 p-1 dark:border-slate-800 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => setViewMode("TABLE")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "TABLE"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Table View"
              >
                <LayoutListIcon className="size-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("GRID")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "GRID"
                    ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Grid Card View"
              >
                <LayoutGridIcon className="size-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              statusFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            All Personnel ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ACTIVE")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              statusFilter === "ACTIVE"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-emerald-950/40"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ON_LEAVE")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              statusFilter === "ON_LEAVE"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-amber-50 hover:text-amber-700 dark:text-slate-400 dark:hover:bg-amber-950/40"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            On Leave ({onLeaveCount})
          </button>
          {inactiveCount > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter("INACTIVE")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                statusFilter === "INACTIVE"
                  ? "bg-zinc-700 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              Inactive / Exited ({inactiveCount})
            </button>
          )}

          {/* Result counter indicator */}
          <span className="ml-auto text-[11px] text-slate-400 font-medium hidden md:inline">
            Showing <strong className="text-slate-700 dark:text-slate-200">{filteredEmployees.length}</strong> of {totalCount}
          </span>
        </div>
      </div>

      {/* 3. Main Employee Roster Container */}
      {filteredEmployees.length === 0 ? (
        /* Empty Filter Results State */
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-3.5">
            <SearchIcon className="h-6 w-6 stroke-1.5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No matching employees found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No personnel matched your search query "${searchQuery}".`
              : "No employees match the selected filters."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs h-8 rounded-xl cursor-pointer"
            >
              Reset all filters
            </Button>
            {canManage && (
              <Button
                size="sm"
                nativeButton={false}
                render={<Link href="/employees/new" />}
                className="text-xs h-8 rounded-xl"
              >
                <PlusIcon className="h-3.5 w-3.5 mr-1" />
                Add New Employee
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "TABLE" ? (
        /* ======================== A. HIGH-END TABLE VIEW ======================== */
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200/80 bg-slate-50/70 hover:bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/50">
                  <TableHead className="py-3.5 pl-6 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Employee Details
                  </TableHead>
                  <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Staff Code
                  </TableHead>
                  <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Department
                  </TableHead>
                  <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Designation
                  </TableHead>
                  <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Type
                  </TableHead>
                  <TableHead className="py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Status
                  </TableHead>
                  <TableHead className="py-3.5 pr-6 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredEmployees.map((employee) => {
                  const status =
                    STATUS_CONFIG[employee.employmentStatus] ?? STATUS_CONFIG.ACTIVE;
                  const initials = getInitials(employee.fullName);
                  const gradient = getAvatarColor(employee.fullName);

                  return (
                    <TableRow
                      key={employee.id}
                      className="group border-slate-100 hover:bg-slate-50/70 transition-colors dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                    >
                      {/* Employee Avatar & Name */}
                      <TableCell className="py-3.5 pl-6">
                        <Link
                          href={`/employees/${employee.id}`}
                          className="flex items-center gap-3.5 group/link"
                        >
                          <div className="relative shrink-0">
                            {employee.profilePhotoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={employee.profilePhotoUrl}
                                alt={employee.fullName}
                                className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-xs ring-1 ring-slate-200/80 dark:border-slate-900 dark:ring-slate-700"
                              />
                            ) : (
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-xs font-bold shadow-xs border-2 border-white dark:border-slate-900 ring-1 ring-slate-200/80 dark:ring-slate-700`}
                              >
                                {initials}
                              </div>
                            )}
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${status.bgSoft}`}
                              title={status.label}
                            />
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover/link:text-primary transition-colors flex items-center gap-1.5 dark:text-white">
                              <span className="truncate">{employee.fullName}</span>
                              <ArrowUpRightIcon className="h-3 w-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-primary shrink-0" />
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {employee.workEmail || employee.personalEmail || "No email on record"}
                            </span>
                          </div>
                        </Link>
                      </TableCell>

                      {/* Staff Code */}
                      <TableCell className="py-3.5">
                        <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <span>{employee.employeeCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(employee.employeeCode)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode === employee.employeeCode ? (
                              <CheckIcon className="size-3 text-emerald-600" />
                            ) : (
                              <CopyIcon className="size-3" />
                            )}
                          </button>
                        </div>
                      </TableCell>

                      {/* Department */}
                      <TableCell className="py-3.5">
                        {employee.department ? (
                          <span className="inline-flex items-center gap-1 rounded-lg border border-[#162E51]/20 bg-[#F0F4F9] px-2.5 py-0.5 text-xs font-semibold text-[#162E51] dark:border-[#162E51]/60 dark:bg-[#162E51]/40 dark:text-blue-300">
                            <Building2Icon className="size-3 text-[#162E51]" />
                            {employee.department.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] text-slate-400 italic">
                            Unassigned
                          </span>
                        )}
                      </TableCell>

                      {/* Designation */}
                      <TableCell className="py-3.5">
                        {employee.designation ? (
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                            {employee.designation.name}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Not set</span>
                        )}
                      </TableCell>

                      {/* Employment Type */}
                      <TableCell className="py-3.5">
                        <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100/60 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                          {employee.employmentType
                            ? EMPLOYMENT_TYPE_LABELS[employee.employmentType] ?? employee.employmentType
                            : "Regular"}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.badgeClass}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ring-2 ${status.dotClass} ${
                              employee.employmentStatus === "ACTIVE" ? "animate-pulse" : ""
                            }`}
                          />
                          {status.label}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            nativeButton={false}
                            render={<Link href={`/employees/${employee.id}`} />}
                            className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="View Full Profile"
                          >
                            <ArrowUpRightIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">View {employee.fullName}</span>
                          </Button>
                          {canManage && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                nativeButton={false}
                                render={<Link href={`/employees/${employee.id}/edit`} />}
                                className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title={`Edit ${employee.fullName}`}
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">Edit {employee.fullName}</span>
                              </Button>
                              <DeleteEmployeeButton
                                employeeId={employee.id}
                                employeeName={employee.fullName}
                              />
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        /* ======================== B. HIGH-END BENTO CARD GRID ======================== */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => {
            const status =
              STATUS_CONFIG[employee.employmentStatus] ?? STATUS_CONFIG.ACTIVE;
            const initials = getInitials(employee.fullName);
            const gradient = getAvatarColor(employee.fullName);

            return (
              <div
                key={employee.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  {/* Top card header: Avatar + Status + Monospace Code */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative">
                      {employee.profilePhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={employee.profilePhotoUrl}
                          alt={employee.fullName}
                          className="h-14 w-14 rounded-2xl object-cover border-2 border-white shadow-xs ring-1 ring-slate-200 dark:border-slate-900 dark:ring-slate-700"
                        />
                      ) : (
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-sm font-bold shadow-xs border-2 border-white dark:border-slate-900 ring-1 ring-slate-200 dark:ring-slate-700`}
                        >
                          {initials}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${status.bgSoft}`}
                        title={status.label}
                      />
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${status.badgeClass}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ring-2 ${status.dotClass} ${
                            employee.employmentStatus === "ACTIVE" ? "animate-pulse" : ""
                          }`}
                        />
                        {status.label}
                      </span>
                      <div className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60 dark:bg-slate-800 dark:text-slate-400">
                        <span>{employee.employeeCode}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(employee.employeeCode)}
                          className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Copy"
                        >
                          {copiedCode === employee.employeeCode ? (
                            <CheckIcon className="size-2.5 text-emerald-600" />
                          ) : (
                            <CopyIcon className="size-2.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Name & Designation */}
                  <div className="mt-4">
                    <Link
                      href={`/employees/${employee.id}`}
                      className="text-base font-bold text-slate-900 hover:text-primary transition-colors flex items-center gap-1 group/title dark:text-white"
                    >
                      <span className="truncate">{employee.fullName}</span>
                      <ChevronRightIcon className="size-3.5 opacity-0 -translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all text-primary" />
                    </Link>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      {employee.designation?.name ?? "No designation set"}
                    </p>
                  </div>

                  {/* Department & Employment Type Badges */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {employee.department ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#162E51]/20 bg-[#F0F4F9] px-2 py-0.5 text-[11px] font-semibold text-[#162E51] dark:border-[#162E51]/60 dark:bg-[#162E51]/40 dark:text-blue-300">
                        <Building2Icon className="size-3 text-[#162E51]" />
                        {employee.department.name}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Unassigned Department</span>
                    )}

                    {employee.employmentType && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                        <BriefcaseIcon className="size-2.5 text-slate-400" />
                        {EMPLOYMENT_TYPE_LABELS[employee.employmentType] ?? employee.employmentType}
                      </span>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                    {(employee.workEmail || employee.personalEmail) && (
                      <a
                        href={`mailto:${employee.workEmail || employee.personalEmail}`}
                        className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors truncate dark:text-slate-400"
                        title={employee.workEmail || employee.personalEmail || ""}
                      >
                        <MailIcon className="size-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{employee.workEmail || employee.personalEmail}</span>
                      </a>
                    )}
                    {employee.phone && (
                      <a
                        href={`tel:${employee.phone}`}
                        className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors truncate dark:text-slate-400"
                      >
                        <PhoneIcon className="size-3.5 text-slate-400 shrink-0" />
                        <span>{employee.phone}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={`/employees/${employee.id}`} />}
                    className="flex-1 h-8 rounded-xl text-xs font-semibold gap-1 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span>View Profile</span>
                    <ArrowUpRightIcon className="size-3 text-slate-400" />
                  </Button>

                  {canManage && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={<Link href={`/employees/${employee.id}/edit`} />}
                        className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Employee"
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                      <DeleteEmployeeButton
                        employeeId={employee.id}
                        employeeName={employee.fullName}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
