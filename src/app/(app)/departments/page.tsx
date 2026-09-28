"use client"

import * as React from "react"
import {
  BuildingIcon,
  Edit2Icon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DepartmentDialog } from "@/features/organization/department-dialog"
import { OrgNav } from "@/features/organization/org-nav"
import { departmentsService } from "@/lib/services/departments-service"
import { employeesService } from "@/lib/services/employees-service"
import { teamsService } from "@/lib/services/teams-service"
import type { Department, Employee, Team } from "@/types/organization"

interface DepartmentRowData extends Department {
  manager: Employee | null
  teams: Team[]
  employeeCount: number
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = React.useState<DepartmentRowData[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingDept, setEditingDept] = React.useState<Department | null>(null)

  const [deleteTarget, setDeleteTarget] = React.useState<Department | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const loadData = React.useCallback(() => {
    const rawDepts = departmentsService.getDepartments()
    const allTeams = teamsService.getTeams()
    const allEmployees = employeesService.getEmployees()

    const enriched: DepartmentRowData[] = rawDepts.map((dept) => {
      const manager = dept.managerId ? employeesService.getEmployee(dept.managerId) : null
      const deptTeams = allTeams.filter((t) => t.departmentId === dept.id)
      const employeeCount = allEmployees.filter((e) => e.departmentId === dept.id).length

      return {
        ...dept,
        manager,
        teams: deptTeams,
        employeeCount,
      }
    })

    setDepartments(enriched)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = () => {
    setEditingDept(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (dept: Department) => {
    setEditingDept(dept)
    setIsDialogOpen(true)
  }

  const handleDeletePrompt = (dept: Department) => {
    setDeleteTarget(dept)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      departmentsService.deleteDepartment(deleteTarget.id)
      setDeleteTarget(null)
      loadData()
    }
  }

  const columns: DataTableColumn<DepartmentRowData>[] = [
    {
      key: "name",
      header: "Department",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground">{row.name}</p>
          {row.description && (
            <p className="line-clamp-1 max-w-xs text-xs text-muted-foreground">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "manager",
      header: "Department Head",
      className: "hidden sm:table-cell",
      cell: (row) => {
        if (!row.manager) {
          return (
            <span className="text-xs text-muted-foreground italic">
              Unassigned
            </span>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={row.manager.avatar} alt={row.manager.fullName} />
              <AvatarFallback className="text-[10px]">
                {row.manager.firstName[0]}
                {row.manager.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-foreground">
                {row.manager.fullName}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {row.manager.email}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      key: "teams",
      header: "Teams",
      className: "hidden md:table-cell",
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
          {row.teams.length > 0 ? (
            row.teams.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                {t.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">
              No teams assigned
            </span>
          )}
        </div>
      ),
    },
    {
      key: "headcount",
      header: "Headcount",
      className: "hidden sm:table-cell",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
          <UsersIcon className="size-3.5 text-muted-foreground" />
          <span>{row.employeeCount} {row.employeeCount === 1 ? "member" : "members"}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
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
            onClick={(e) => {
              e.stopPropagation()
              handleEdit(row)
            }}
            title="Edit Department"
          >
            <Edit2Icon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              handleDeletePrompt(row)
            }}
            title="Delete Department"
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
        title="Departments"
        description="Organize your workforce into functional departments and teams."
        actions={
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <PlusIcon className="size-3.5" />
            Add Department
          </Button>
        }
      />

      <OrgNav
        counts={{
          departments: departments.length,
        }}
      />

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={departments}
          getRowId={(row) => row.id}
          emptyState={
            <EmptyState
              icon={BuildingIcon}
              title="No departments found"
              description="Create your first department to start structuring teams and workforce branches."
              action={
                <Button size="sm" onClick={handleCreate}>
                  <PlusIcon className="size-3.5" />
                  Add Department
                </Button>
              }
            />
          }
        />
      </div>

      <DepartmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        department={editingDept}
        onSuccess={() => loadData()}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Department"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Employees and teams belonging to this department will need reassignment.`}
        confirmLabel="Delete Department"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  )
}
