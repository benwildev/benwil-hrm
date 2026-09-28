"use client"

import * as React from "react"
import {
  ExternalLinkIcon,
  LayersIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { OrgNav } from "@/features/organization/org-nav"
import { TeamDialog } from "@/features/organization/team-dialog"
import { departmentsService } from "@/lib/services/departments-service"
import { employeesService } from "@/lib/services/employees-service"
import { teamsService } from "@/lib/services/teams-service"
import type { Department, Employee, Team } from "@/types/organization"

interface TeamRowData extends Team {
  department: Department | null
  lead: Employee | null
  members: Employee[]
}

export default function TeamsPage() {
  const [teams, setTeams] = React.useState<TeamRowData[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [selectedDeptFilter, setSelectedDeptFilter] = React.useState<string>("all")

  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingTeam, setEditingTeam] = React.useState<Team | null>(null)

  const [deleteTarget, setDeleteTarget] = React.useState<Team | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const loadData = React.useCallback(() => {
    const rawTeams = teamsService.getTeams(
      selectedDeptFilter === "all" ? undefined : selectedDeptFilter
    )
    const allDepts = departmentsService.getDepartments()
    const allEmployees = employeesService.getEmployees()

    setDepartments(allDepts)

    const enriched: TeamRowData[] = rawTeams.map((team) => {
      const dept = allDepts.find((d) => d.id === team.departmentId) || null
      const lead = team.leadId ? employeesService.getEmployee(team.leadId) : null
      const members = allEmployees.filter((e) => e.teamId === team.id)

      return {
        ...team,
        department: dept,
        lead,
        members,
      }
    })

    setTeams(enriched)
  }, [selectedDeptFilter])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = () => {
    setEditingTeam(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setIsDialogOpen(true)
  }

  const handleDeletePrompt = (team: Team) => {
    setDeleteTarget(team)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      teamsService.deleteTeam(deleteTarget.id)
      setDeleteTarget(null)
      loadData()
    }
  }

  const columns: DataTableColumn<TeamRowData>[] = [
    {
      key: "name",
      header: "Team Name",
      cell: (row) => (
        <div className="space-y-0.5">
          <Link
            href={`/teams/${row.id}`}
            className="font-semibold text-foreground hover:underline flex items-center gap-1.5"
          >
            {row.name}
            <ExternalLinkIcon className="size-3 text-muted-foreground opacity-60" />
          </Link>
          {row.description && (
            <p className="line-clamp-1 max-w-xs text-xs text-muted-foreground">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      className: "hidden sm:table-cell",
      cell: (row) => (
        <span className="inline-flex items-center rounded-md border border-border bg-muted/30 px-2 py-0.5 text-xs font-medium text-foreground">
          {row.department ? row.department.name : "Unassigned"}
        </span>
      ),
    },
    {
      key: "lead",
      header: "Team Lead",
      className: "hidden md:table-cell",
      cell: (row) => {
        if (!row.lead) {
          return (
            <span className="text-xs text-muted-foreground italic">
              No Lead Assigned
            </span>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={row.lead.avatar} alt={row.lead.fullName} />
              <AvatarFallback className="text-[10px]">
                {row.lead.firstName[0]}
                {row.lead.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium text-foreground">
              {row.lead.fullName}
            </span>
          </div>
        )
      },
    },
    {
      key: "members",
      header: "Members",
      className: "hidden sm:table-cell",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5 overflow-hidden">
            {row.members.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="size-6 border-2 border-background">
                <AvatarImage src={member.avatar} alt={member.fullName} />
                <AvatarFallback className="text-[9px]">
                  {member.firstName[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {row.members.length} {row.members.length === 1 ? "member" : "members"}
          </span>
        </div>
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
            render={<Link href={`/teams/${row.id}`} />}
            className="text-xs"
          >
            Manage
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleEdit(row)}
            title="Edit Team"
          >
            <PencilIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleDeletePrompt(row)}
            title="Delete Team"
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer className="gap-5">
      <PageHeader
        title="Teams"
        description="Organize functional squads, leads, and operational teams within departments."
        actions={
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <PlusIcon className="size-3.5" />
            Add Team
          </Button>
        }
      />

      <OrgNav
        counts={{
          teams: teams.length,
        }}
      />

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Department:</span>
          <select
            className="flex h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{teams.length}</span> active teams
        </p>
      </div>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={teams}
          getRowId={(row) => row.id}
          emptyState={
            <EmptyState
              icon={LayersIcon}
              title="No teams found"
              description="Create teams to group employees by specific functions, projects, or objectives."
              action={
                <Button size="sm" onClick={handleCreate}>
                  <PlusIcon className="size-3.5" />
                  Add Team
                </Button>
              }
            />
          }
        />
      </div>

      <TeamDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        team={editingTeam}
        defaultDepartmentId={selectedDeptFilter !== "all" ? selectedDeptFilter : undefined}
        onSuccess={() => loadData()}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Team"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Assigned members will remain in their department but will lose their team assignment.`}
        confirmLabel="Delete Team"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  )
}
