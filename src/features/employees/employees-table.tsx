"use client"

import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import {
  DataTable,
  DataTablePagination,
  type DataTableColumn,
} from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterButton } from "@/components/shared/filter-button"
import { FormField } from "@/components/shared/form-field"
import { PageHeader } from "@/components/shared/page-header"
import { SearchInput } from "@/components/shared/search-input"
import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { departments, mockEmployees, type Employee } from "@/features/employees/mock-data"
import { getInitials } from "@/lib/utils"

const PAGE_SIZE = 6

export function EmployeesTable() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return employees.filter((employee) => {
      const matchesSearch =
        query.length === 0 ||
        [employee.name, employee.email, employee.role].some((field) =>
          field.toLowerCase().includes(query)
        )
      const matchesDepartment =
        departmentFilter.length === 0 || departmentFilter.includes(employee.department)
      return matchesSearch && matchesDepartment
    })
  }, [employees, search, departmentFilter])

  const pageCount = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1)
  const currentPage = Math.min(page, pageCount)
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const toggleDepartment = (department: string) => {
    setPage(1)
    setDepartmentFilter((prev) =>
      prev.includes(department)
        ? prev.filter((value) => value !== department)
        : [...prev, department]
    )
  }

  const pendingRemoveEmployee = employees.find((employee) => employee.id === pendingRemoveId)

  const columns: DataTableColumn<Employee>[] = [
    {
      key: "employee",
      header: "Employee",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(row.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      cell: (row) => <span className="text-sm text-foreground">{row.department}</span>,
    },
    {
      key: "role",
      header: "Role",
      cell: (row) => <span className="text-sm text-muted-foreground">{row.role}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-10 text-right",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.name}`}
              />
            }
          >
            <MoreHorizontalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <EyeIcon /> View profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <PencilIcon /> Edit details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setPendingRemoveId(row.id)}
            >
              <TrashIcon /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Employees"
        description="Manage your workforce directory and employee records."
        actions={
          <Sheet open={addOpen} onOpenChange={setAddOpen}>
            <SheetTrigger render={<Button />}>
              <PlusIcon data-icon="inline-start" />
              Add Employee
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add employee</SheetTitle>
                <SheetDescription>
                  Enter the employee&apos;s details below. You can complete the rest of
                  their profile later.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
                <FormField label="Full name" htmlFor="employee-name" required>
                  <Input id="employee-name" placeholder="e.g. Jordan Blake" />
                </FormField>
                <FormField label="Work email" htmlFor="employee-email" required>
                  <Input
                    id="employee-email"
                    type="email"
                    placeholder="jordan.blake@benwilhrm.com"
                  />
                </FormField>
                <FormField label="Department" htmlFor="employee-department">
                  <Select>
                    <SelectTrigger id="employee-department" className="w-full">
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Job title" htmlFor="employee-role">
                  <Input id="employee-role" placeholder="e.g. Product Designer" />
                </FormField>
              </div>
              <SheetFooter>
                <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
                <Button onClick={() => setAddOpen(false)}>Add Employee</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          placeholder="Search by name, email, or role..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          className="sm:w-72"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<FilterButton count={departmentFilter.length || undefined} />}
          >
            Department
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {departments.map((department) => (
              <DropdownMenuCheckboxItem
                key={department}
                checked={departmentFilter.includes(department)}
                onCheckedChange={() => toggleDepartment(department)}
              >
                {department}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DataTable
        columns={columns}
        data={paginated}
        getRowId={(row) => row.id}
        selectable
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        emptyState={
          <EmptyState
            icon={UsersIcon}
            title="No employees found"
            description="Try adjusting your search or filters, or add your first employee to start managing your workforce."
          />
        }
      />

      {filtered.length > 0 && (
        <DataTablePagination
          page={currentPage}
          pageCount={pageCount}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={pendingRemoveId !== null}
        onOpenChange={(open) => !open && setPendingRemoveId(null)}
        title="Remove employee"
        description={
          pendingRemoveEmployee
            ? `${pendingRemoveEmployee.name} will be removed from the directory. This cannot be undone.`
            : undefined
        }
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => {
          setEmployees((prev) => prev.filter((employee) => employee.id !== pendingRemoveId))
          setSelectedIds((prev) => prev.filter((id) => id !== pendingRemoveId))
        }}
      />
    </>
  )
}
