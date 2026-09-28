"use client"

import * as React from "react"
import {
  InfoIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { DesignationDialog } from "@/features/organization/designation-dialog"
import { OrgNav } from "@/features/organization/org-nav"
import { departmentsService } from "@/lib/services/departments-service"
import { designationsService } from "@/lib/services/designations-service"
import { employeesService } from "@/lib/services/employees-service"
import type { Department, Designation } from "@/types/organization"

interface DesignationRowData extends Designation {
  department: Department | null
  employeeCount: number
}

export default function DesignationsPage() {
  const [designations, setDesignations] = React.useState<DesignationRowData[]>([])
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingDes, setEditingDes] = React.useState<Designation | null>(null)

  const [deleteTarget, setDeleteTarget] = React.useState<Designation | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const loadData = React.useCallback(() => {
    const rawList = designationsService.getDesignations()
    const allDepts = departmentsService.getDepartments()
    const allEmployees = employeesService.getEmployees()

    const enriched: DesignationRowData[] = rawList.map((des) => {
      const dept = des.departmentId
        ? allDepts.find((d) => d.id === des.departmentId) || null
        : null
      const count = allEmployees.filter((e) => e.designationId === des.id).length

      return {
        ...des,
        department: dept,
        employeeCount: count,
      }
    })

    setDesignations(enriched)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = () => {
    setEditingDes(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (des: Designation) => {
    setEditingDes(des)
    setIsDialogOpen(true)
  }

  const handleDeletePrompt = (des: Designation) => {
    setDeleteTarget(des)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      designationsService.deleteDesignation(deleteTarget.id)
      setDeleteTarget(null)
      loadData()
    }
  }

  const columns: DataTableColumn<DesignationRowData>[] = [
    {
      key: "name",
      header: "Designation Title",
      cell: (row) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground">{row.name}</p>
          {row.description && (
            <p className="line-clamp-1 max-w-sm text-xs text-muted-foreground">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "department",
      header: "Associated Department",
      className: "hidden sm:table-cell",
      cell: (row) => (
        <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground">
          {row.department ? row.department.name : "Company-wide / General"}
        </span>
      ),
    },
    {
      key: "headcount",
      header: "Assigned Employees",
      className: "hidden md:table-cell",
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <UsersIcon className="size-3.5 text-muted-foreground" />
          <span>{row.employeeCount} {row.employeeCount === 1 ? "employee" : "employees"}</span>
        </div>
      ),
    },
    {
      key: "created",
      header: "Created",
      className: "hidden lg:table-cell",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
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
            variant="ghost"
            size="icon-sm"
            onClick={() => handleEdit(row)}
            title="Edit Designation"
          >
            <PencilIcon className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleDeletePrompt(row)}
            title="Delete Designation"
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
        title="Designations"
        description="Manage organizational job titles and titles hierarchy across departments."
        actions={
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            <PlusIcon className="size-3.5" />
            Add Designation
          </Button>
        }
      />

      <OrgNav
        counts={{
          designations: designations.length,
        }}
      />

      {/* Distinction Note */}
      <div className="flex items-center gap-3 rounded-lg border border-blue-200/60 bg-blue-50/50 p-3 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200">
        <InfoIcon className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <p>
          <span className="font-semibold">Important Architecture Standard:</span> Job Designations reflect an employee&apos;s title and professional seniority (e.g. Senior Developer). System access permissions and roles (Admin, HR, Manager, Employee) are governed independently.
        </p>
      </div>

      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={designations}
          getRowId={(row) => row.id}
          emptyState={
            <EmptyState
              icon={TagIcon}
              title="No designations defined"
              description="Create standard job designations to classify roles across your company."
              action={
                <Button size="sm" onClick={handleCreate}>
                  <PlusIcon className="size-3.5" />
                  Add Designation
                </Button>
              }
            />
          }
        />
      </div>

      <DesignationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        designation={editingDes}
        onSuccess={() => loadData()}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Designation"
        description={`Are you sure you want to delete the "${deleteTarget?.name}" designation?`}
        confirmLabel="Delete Designation"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  )
}
