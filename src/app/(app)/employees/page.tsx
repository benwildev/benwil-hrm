"use client"

import * as React from "react"
import {
  FilterXIcon,
  PlusIcon,
  UserMinusIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { SearchInput } from "@/components/shared/search-input"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { OrgNav } from "@/features/organization/org-nav"
import { authService } from "@/lib/auth/auth-service"
import { departmentsService } from "@/lib/services/departments-service"
import { designationsService } from "@/lib/services/designations-service"
import { employeesService } from "@/lib/services/employees-service"
import { rolesService } from "@/lib/services/roles-service"
import { teamsService } from "@/lib/services/teams-service"
import type { EmployeeAccount } from "@/types/auth"
import {
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  type Department,
  type Designation,
  type Employee,
  type EmployeeFilterParams,
  type EmployeeStatus,
  type EmploymentType,
  type Team,
} from "@/types/organization"

interface EnrichedEmployee extends Employee {
  department: Department | null
  team: Team | null
  designation: Designation | null
  manager: Employee | null
  account: EmployeeAccount | null
}

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<EnrichedEmployee[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [teams, setTeams] = React.useState<Team[]>([])
  const [designations, setDesignations] = React.useState<Designation[]>([])

  // Filters State
  const [search, setSearch] = React.useState("")
  const [selectedDept, setSelectedDept] = React.useState<string>("all")
  const [selectedTeam, setSelectedTeam] = React.useState<string>("all")
  const [selectedDes, setSelectedDes] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedType, setSelectedType] = React.useState<string>("all")
  const [selectedAccount, setSelectedAccount] = React.useState<string>("all")

  // Deactivate confirmation
  const [deactivateTarget, setDeactivateTarget] = React.useState<Employee | null>(null)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = React.useState(false)

  const loadData = React.useCallback(() => {
    const allDepts = departmentsService.getDepartments()
    const allTeams = teamsService.getTeams()
    const allDes = designationsService.getDesignations()
    const allAccounts = authService.getAccounts()

    setDepartments(allDepts)
    setTeams(allTeams)
    setDesignations(allDes)

    const filterParams: EmployeeFilterParams = {
      search: search.trim() || undefined,
      departmentId: selectedDept !== "all" ? selectedDept : undefined,
      teamId: selectedTeam !== "all" ? selectedTeam : undefined,
      designationId: selectedDes !== "all" ? selectedDes : undefined,
      status: selectedStatus !== "all" ? (selectedStatus as EmployeeStatus) : undefined,
      employmentType: selectedType !== "all" ? (selectedType as EmploymentType) : undefined,
    }

    const rawEmployees = employeesService.getEmployees(filterParams)

    let enriched: EnrichedEmployee[] = rawEmployees.map((emp) => {
      const dept = allDepts.find((d) => d.id === emp.departmentId) || null
      const team = emp.teamId ? allTeams.find((t) => t.id === emp.teamId) || null : null
      const des = allDes.find((d) => d.id === emp.designationId) || null
      const mgr = emp.managerId ? rawEmployees.find((e) => e.id === emp.managerId) || employeesService.getEmployee(emp.managerId) : null
      const account = allAccounts.find((a) => a.employeeId === emp.id) || null

      return {
        ...emp,
        department: dept,
        team,
        designation: des,
        manager: mgr,
        account,
      }
    })

    // Account Access Filter
    if (selectedAccount !== "all") {
      enriched = enriched.filter((emp) => {
        if (selectedAccount === "has_account") return Boolean(emp.account)
        if (selectedAccount === "no_account") return !emp.account
        if (selectedAccount === "active") return emp.account?.status === "active"
        if (selectedAccount === "disabled") return emp.account?.status === "disabled"
        if (selectedAccount === "pending") {
          return emp.account?.status === "pending" || emp.account?.status === "invited"
        }
        return true
      })
    }

    setEmployees(enriched)
  }, [search, selectedDept, selectedTeam, selectedDes, selectedStatus, selectedType, selectedAccount])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Count active filters
  const activeFilterCount = [
    selectedDept !== "all",
    selectedTeam !== "all",
    selectedDes !== "all",
    selectedStatus !== "all",
    selectedType !== "all",
    selectedAccount !== "all",
    Boolean(search.trim()),
  ].filter(Boolean).length

  const handleClearFilters = () => {
    setSearch("")
    setSelectedDept("all")
    setSelectedTeam("all")
    setSelectedDes("all")
    setSelectedStatus("all")
    setSelectedType("all")
    setSelectedAccount("all")
  }

  const handleDeactivatePrompt = (emp: Employee) => {
    setDeactivateTarget(emp)
    setIsDeactivateDialogOpen(true)
  }

  const handleDeactivateConfirm = () => {
    if (deactivateTarget) {
      employeesService.deactivateEmployee(deactivateTarget.id)
      setDeactivateTarget(null)
      loadData()
    }
  }

  // Filtered teams list based on selected department
  const filteredTeams = React.useMemo(() => {
    if (selectedDept === "all") return teams
    return teams.filter((t) => t.departmentId === selectedDept)
  }, [teams, selectedDept])

  const columns: DataTableColumn<EnrichedEmployee>[] = [
    {
      key: "employee",
      header: "Employee",
      cell: (row) => (
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Avatar className="size-8 sm:size-9 shrink-0 border border-border/60">
            <AvatarImage src={row.avatar} alt={row.fullName} />
            <AvatarFallback className="text-xs font-semibold">
              {row.firstName[0]}
              {row.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <Link
              href={`/employees/${row.id}`}
              className="truncate text-xs font-bold text-foreground hover:underline"
            >
              {row.fullName}
            </Link>
            <span className="truncate text-[11px] text-muted-foreground">{row.email}</span>
            <span className="sm:hidden font-mono text-[10px] text-muted-foreground/80">
              {row.employeeCode}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "code",
      header: "Employee ID",
      className: "hidden sm:table-cell",
      cell: (row) => (
        <span className="font-mono text-xs font-medium text-foreground">
          {row.employeeCode}
        </span>
      ),
    },
    {
      key: "department",
      header: "Department",
      className: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-xs text-foreground font-medium">
          {row.department ? row.department.name : "Unassigned"}
        </span>
      ),
    },
    {
      key: "team",
      header: "Team",
      className: "hidden 2xl:table-cell",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.team ? row.team.name : "—"}
        </span>
      ),
    },
    {
      key: "designation",
      header: "Designation",
      className: "hidden sm:table-cell",
      cell: (row) => (
        <span className="text-xs font-medium text-foreground">
          {row.designation ? row.designation.name : "—"}
        </span>
      ),
    },
    {
      key: "manager",
      header: "Direct Manager",
      className: "hidden 2xl:table-cell",
      cell: (row) => {
        if (!row.manager) {
          return (
            <span className="text-[11px] text-muted-foreground italic">
              Reports to CEO
            </span>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-5">
              <AvatarImage src={row.manager.avatar} alt={row.manager.fullName} />
              <AvatarFallback className="text-[9px]">
                {row.manager.firstName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-foreground truncate max-w-[120px]">
              {row.manager.fullName}
            </span>
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "account",
      header: "Account",
      className: "hidden sm:table-cell",
      cell: (row) => {
        if (!row.account) {
          return (
            <span className="text-xs text-muted-foreground/60">
              — No Account
            </span>
          )
        }
        const role = rolesService.getRoleForAccount(row.account)
        const getStatusDot = () => {
          switch (row.account?.status) {
            case "active":
              return (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                  Active
                </span>
              )
            case "disabled":
              return (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                  <span className="size-1.5 rounded-full bg-destructive shrink-0" />
                  Disabled
                </span>
              )
            case "pending":
            case "invited":
              return (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />
                  Pending
                </span>
              )
            default:
              return (
                <span className="text-[11px] text-muted-foreground">
                  {row.account?.status}
                </span>
              )
          }
        }

        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-foreground">
              {role.name}
            </span>
            {getStatusDot()}
          </div>
        )
      },
    },
    {
      key: "joined",
      header: "Joined",
      className: "hidden 2xl:table-cell",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.joiningDate}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/employees/${row.id}`} />}
            className="text-xs"
          >
            Profile
          </Button>
          {row.status !== "inactive" && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
              onClick={() => handleDeactivatePrompt(row)}
              title="Deactivate Employee"
            >
              <UserMinusIcon className="size-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <PageContainer className="gap-5">
      <PageHeader
        title="Employees"
        description="Manage your workforce, organizational hierarchy, and job assignments."
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/employees/new" />}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
          >
            <PlusIcon className="size-3.5" />
            Add Employee
          </Button>
        }
      />

      <OrgNav
        counts={{
          employees: employees.length,
          departments: departments.length,
          teams: teams.length,
          designations: designations.length,
        }}
      />

      {/* Filter and Search Bar */}
      <div className="space-y-3 rounded-xl border border-border/80 bg-card p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-xs">
            <SearchInput
              placeholder="Search by name, email, ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Department Filter */}
            <select
              id="filter-dept"
              name="department"
              aria-label="Filter by department"
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900 w-full sm:w-auto"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value)
                setSelectedTeam("all")
              }}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Team Filter */}
            <select
              id="filter-team"
              name="team"
              aria-label="Filter by team"
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900 w-full sm:w-auto"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="all">All Teams</option>
              {filteredTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Designation Filter */}
            <select
              id="filter-designation"
              name="designation"
              aria-label="Filter by designation"
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900 w-full sm:w-auto"
              value={selectedDes}
              onChange={(e) => setSelectedDes(e.target.value)}
            >
              <option value="all">All Designations</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              id="filter-status"
              name="status"
              aria-label="Filter by status"
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900 w-full sm:w-auto"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {Object.values(EMPLOYEE_STATUSES).map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>

            {/* Account Access Filter */}
            <select
              id="filter-account"
              name="account"
              aria-label="Filter by account access"
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900 w-full sm:w-auto"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="all">All Accounts</option>
              <option value="has_account">Has Account</option>
              <option value="no_account">No Account</option>
              <option value="active">Active Access</option>
              <option value="disabled">Disabled Access</option>
              <option value="pending">Pending First Login</option>
            </select>

            {/* Employment Type Filter */}
            <select
              id="filter-type"
              name="type"
              aria-label="Filter by employment type"
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900 w-full sm:w-auto col-span-2 sm:col-span-1"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {Object.values(EMPLOYMENT_TYPES).map((tp) => (
                <option key={tp.value} value={tp.value}>
                  {tp.label}
                </option>
              ))}
            </select>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 text-xs text-muted-foreground hover:text-foreground col-span-2 sm:col-span-1 w-full sm:w-auto"
              >
                <FilterXIcon className="size-3.5" />
                Clear ({activeFilterCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Employee Table */}
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={employees}
          getRowId={(row) => row.id}
          emptyState={
            <EmptyState
              icon={UsersIcon}
              title={
                activeFilterCount > 0
                  ? "No matching employees"
                  : "No employees registered"
              }
              description={
                activeFilterCount > 0
                  ? "Try resetting your search query or broadening your filters."
                  : "Add your first workforce member to begin tracking employee records."
              }
              action={
                activeFilterCount > 0 ? (
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    Reset Filters
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    nativeButton={false}
                    render={<Link href="/employees/new" />}
                    className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    <PlusIcon className="size-3.5" />
                    Add First Employee
                  </Button>
                )
              }
            />
          }
        />
      </div>

      {/* Deactivate Employee Dialog */}
      <ConfirmDialog
        open={isDeactivateDialogOpen}
        onOpenChange={setIsDeactivateDialogOpen}
        title="Deactivate Employee Account"
        description={`Are you sure you want to deactivate ${deactivateTarget?.fullName}? The record and history will be preserved safely, but their account status will become Inactive.`}
        confirmLabel="Deactivate Employee"
        variant="destructive"
        onConfirm={handleDeactivateConfirm}
      />
    </PageContainer>
  )
}
