"use client"

import * as React from "react"
import {
  ArrowLeftIcon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  LayersIcon,
  ListChecksIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TeamDialog } from "@/features/organization/team-dialog"
import { departmentsService } from "@/lib/services/departments-service"
import { employeesService } from "@/lib/services/employees-service"
import { teamsService } from "@/lib/services/teams-service"
import type { Department, Employee, Team } from "@/types/organization"

type TabKey = "overview" | "members" | "tasks" | "attendance"

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params?.id as string

  const [activeTab, setActiveTab] = React.useState<TabKey>("overview")
  const [team, setTeam] = React.useState<Team | null>(null)
  const [department, setDepartment] = React.useState<Department | null>(null)
  const [lead, setLead] = React.useState<Employee | null>(null)
  const [members, setMembers] = React.useState<Employee[]>([])

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = React.useState(false)
  const [selectedCandidateId, setSelectedCandidateId] = React.useState<string>("")
  const [availableCandidates, setAvailableCandidates] = React.useState<Employee[]>([])

  const [removeTarget, setRemoveTarget] = React.useState<Employee | null>(null)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = React.useState(false)

  const loadData = React.useCallback(() => {
    if (!teamId) return
    const currentTeam = teamsService.getTeam(teamId)
    if (!currentTeam) {
      router.push("/teams")
      return
    }

    setTeam(currentTeam)
    const dept = departmentsService.getDepartment(currentTeam.departmentId)
    setDepartment(dept)

    const currentLead = currentTeam.leadId ? employeesService.getEmployee(currentTeam.leadId) : null
    setLead(currentLead)

    const allEmployees = employeesService.getEmployees()
    const teamMembers = allEmployees.filter((e) => e.teamId === currentTeam.id)
    setMembers(teamMembers)

    // Employees in same department or company not already in this team
    const candidates = allEmployees.filter(
      (e) => e.teamId !== currentTeam.id && e.status !== "terminated"
    )
    setAvailableCandidates(candidates)
  }, [teamId, router])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  if (!team) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center p-12 text-xs text-muted-foreground">
          Loading team details...
        </div>
      </PageContainer>
    )
  }

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCandidateId) return

    employeesService.updateEmployee(selectedCandidateId, {
      teamId: team.id,
      departmentId: team.departmentId, // sync department
    })
    setIsAddMemberDialogOpen(false)
    setSelectedCandidateId("")
    loadData()
  }

  const handleRemoveMember = () => {
    if (removeTarget) {
      employeesService.updateEmployee(removeTarget.id, {
        teamId: null,
      })
      setRemoveTarget(null)
      loadData()
    }
  }

  const memberColumns: DataTableColumn<Employee>[] = [
    {
      key: "employee",
      header: "Member",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={row.avatar} alt={row.fullName} />
            <AvatarFallback className="text-xs">
              {row.firstName[0]}
              {row.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <Link
              href={`/employees/${row.id}`}
              className="text-xs font-semibold text-foreground hover:underline"
            >
              {row.fullName}
            </Link>
            <span className="text-[11px] text-muted-foreground">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "code",
      header: "Employee ID",
      className: "hidden sm:table-cell",
      cell: (row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.employeeCode}
        </span>
      ),
    },
    {
      key: "designation",
      header: "Designation",
      className: "hidden md:table-cell",
      cell: (row) => {
        const des = row.designationId
        return (
          <span className="text-xs text-foreground font-medium">
            {des}
          </span>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "joined",
      header: "Joined",
      className: "hidden lg:table-cell",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">{row.joiningDate}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              setRemoveTarget(row)
              setIsRemoveDialogOpen(true)
            }}
            title="Remove from Team"
          >
            <UserMinusIcon className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer className="gap-5">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to Teams
        </Link>
      </div>

      {/* Team Executive Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs">
            <LayersIcon className="size-6" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {team.name}
              </h1>
              <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground">
                {department ? department.name : "Department"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              {team.description || "Active operational team in " + (department?.name || "the company")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="text-xs"
          >
            <PencilIcon className="size-3.5" />
            Edit Team
          </Button>
          <Button
            size="sm"
            onClick={() => setIsAddMemberDialogOpen(true)}
            className="text-xs bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <UserPlusIcon className="size-3.5" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-1 border-b border-border/80 pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab("overview")}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
            activeTab === "overview"
              ? "bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          }`}
        >
          <CheckCircle2Icon className="size-3.5" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
            activeTab === "members"
              ? "bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          }`}
        >
          <UsersIcon className="size-3.5" />
          Members ({members.length})
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
            activeTab === "tasks"
              ? "bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          }`}
        >
          <ListChecksIcon className="size-3.5" />
          Tasks
        </button>

        <button
          onClick={() => setActiveTab("attendance")}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors ${
            activeTab === "attendance"
              ? "bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          }`}
        >
          <CalendarCheckIcon className="size-3.5" />
          Attendance
        </button>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === "overview" && (
        <div className="grid gap-5 md:grid-cols-3">
          {/* Team Lead Card */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Designated Team Lead
            </h2>
            {lead ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11">
                    <AvatarImage src={lead.avatar} alt={lead.fullName} />
                    <AvatarFallback>{lead.firstName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/employees/${lead.id}`}
                      className="text-sm font-bold text-foreground hover:underline"
                    >
                      {lead.fullName}
                    </Link>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MailIcon className="size-3.5 text-muted-foreground" />
                    <span>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="size-3.5 text-muted-foreground" />
                    <span>{lead.phone}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground italic">
                No lead assigned to this team yet.
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 md:col-span-2">
            <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Team Overview & Scope
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground">Department</span>
                <p className="text-sm font-bold text-foreground">
                  {department?.name || "Unassigned"}
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground">Headcount</span>
                <p className="text-sm font-bold text-foreground">
                  {members.length} active
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
                <span className="text-[11px] text-muted-foreground">Created</span>
                <p className="text-sm font-bold text-foreground">
                  {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Mission Statement: </span>
              {team.description || "Dedicated to driving high-performance results in " + (department?.name || "organization") + "."}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Members */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Team Roster</h2>
              <p className="text-xs text-muted-foreground">
                All employees officially assigned to {team.name}
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddMemberDialogOpen(true)}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <PlusIcon className="size-3.5" />
              Add Member
            </Button>
          </div>

          <DataTable
            columns={memberColumns}
            data={members}
            getRowId={(row) => row.id}
            emptyState={
              <EmptyState
                icon={UsersIcon}
                title="No team members assigned"
                description="Add members from your workforce to assign them to this team."
                action={
                  <Button size="sm" onClick={() => setIsAddMemberDialogOpen(true)}>
                    <PlusIcon className="size-3.5" />
                    Add First Member
                  </Button>
                }
              />
            }
          />
        </div>
      )}

      {/* Tab Content: Tasks (Placeholder) */}
      {activeTab === "tasks" && (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ListChecksIcon className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Team Task Board (Phase 4)</h3>
            <p className="max-w-md mx-auto text-xs text-muted-foreground">
              Task assignment, sprint tracking, and project delegation for {team.name} will be unlocked during Phase 4 implementation.
            </p>
          </div>
        </div>
      )}

      {/* Tab Content: Attendance (Placeholder) */}
      {activeTab === "attendance" && (
        <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center space-y-3">
          <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CalendarCheckIcon className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Team Attendance & Shift Logs (Phase 3)</h3>
            <p className="max-w-md mx-auto text-xs text-muted-foreground">
              Real-time clock-in records, shift schedules, and presence monitoring for {team.name} will be unlocked during Phase 3.
            </p>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <TeamDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        team={team}
        onSuccess={() => loadData()}
      />

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddMember}>
            <DialogHeader>
              <DialogTitle>Assign Employee to {team.name}</DialogTitle>
              <DialogDescription>
                Select an active workforce employee to assign to this team.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <label className="text-xs font-semibold text-foreground">Select Employee</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                required
              >
                <option value="">-- Choose an Employee --</option>
                {availableCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.employeeCode}) - Current Dept: {c.departmentId}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddMemberDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedCandidateId}
                className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        title="Remove Member from Team"
        description={`Are you sure you want to remove ${removeTarget?.fullName} from ${team.name}? The employee will remain active in the company.`}
        confirmLabel="Remove Member"
        variant="destructive"
        onConfirm={handleRemoveMember}
      />
    </PageContainer>
  )
}
