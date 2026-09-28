"use client"

import * as React from "react"

import { FormField } from "@/components/shared/form-field"
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
import { departmentsService } from "@/lib/services/departments-service"
import { designationsService } from "@/lib/services/designations-service"
import { employeesService } from "@/lib/services/employees-service"
import { teamsService } from "@/lib/services/teams-service"
import {
  EMPLOYEE_STATUSES,
  EMPLOYMENT_TYPES,
  type Department,
  type Designation,
  type Employee,
  type EmployeeStatus,
  type EmploymentType,
  type Team,
} from "@/types/organization"

interface EmployeeEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee
  onSuccess: (updated: Employee) => void
}

export function EmployeeEditDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeEditDialogProps) {
  const [firstName, setFirstName] = React.useState(employee.firstName)
  const [lastName, setLastName] = React.useState(employee.lastName)
  const [email, setEmail] = React.useState(employee.email)
  const [phone, setPhone] = React.useState(employee.phone)
  const [avatar, setAvatar] = React.useState(employee.avatar || "")
  const [employeeCode, setEmployeeCode] = React.useState(employee.employeeCode)
  const [joiningDate, setJoiningDate] = React.useState(employee.joiningDate)
  const [employmentType, setEmploymentType] = React.useState<EmploymentType>(employee.employmentType)
  const [status, setStatus] = React.useState<EmployeeStatus>(employee.status)
  const [departmentId, setDepartmentId] = React.useState(employee.departmentId)
  const [teamId, setTeamId] = React.useState(employee.teamId || "")
  const [designationId, setDesignationId] = React.useState(employee.designationId)
  const [managerId, setManagerId] = React.useState(employee.managerId || "")

  const [departments, setDepartments] = React.useState<Department[]>([])
  const [teams, setTeams] = React.useState<Team[]>([])
  const [designations, setDesignations] = React.useState<Designation[]>([])
  const [possibleManagers, setPossibleManagers] = React.useState<Employee[]>([])

  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setFirstName(employee.firstName)
      setLastName(employee.lastName)
      setEmail(employee.email)
      setPhone(employee.phone)
      setAvatar(employee.avatar || "")
      setEmployeeCode(employee.employeeCode)
      setJoiningDate(employee.joiningDate)
      setEmploymentType(employee.employmentType)
      setStatus(employee.status)
      setDepartmentId(employee.departmentId)
      setTeamId(employee.teamId || "")
      setDesignationId(employee.designationId)
      setManagerId(employee.managerId || "")
      setError(null)

      setDepartments(departmentsService.getDepartments())
      setTeams(teamsService.getTeams())
      setDesignations(designationsService.getDesignations())
      setPossibleManagers(employeesService.getPossibleManagers(employee.id))
    }
  }, [open, employee])

  const departmentTeams = React.useMemo(() => {
    if (!departmentId) return []
    return teams.filter((t) => t.departmentId === departmentId)
  }, [teams, departmentId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const res = employeesService.updateEmployee(employee.id, {
      firstName,
      lastName,
      email,
      phone,
      avatar: avatar || undefined,
      employeeCode,
      joiningDate,
      employmentType,
      status,
      departmentId,
      teamId: teamId || null,
      designationId,
      managerId: managerId || null,
    })

    if (!res.success) {
      setError(res.error)
      setIsSubmitting(false)
      return
    }

    onSuccess(res.data)
    onOpenChange(false)
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Employee Profile</DialogTitle>
            <DialogDescription>
              Update contact info, organizational placement, reporting hierarchy, and employment status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First Name" required>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Last Name" required>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Work Email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Phone">
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </FormField>

              <FormField label="Employee ID / Code" required>
                <Input
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Joining Date" required>
                <Input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Department" required>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value)
                    setTeamId("")
                  }}
                  required
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Team Assignment">
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                >
                  <option value="">-- No Team (General Dept) --</option>
                  {departmentTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Designation" required>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                  value={designationId}
                  onChange={(e) => setDesignationId(e.target.value)}
                  required
                >
                  {designations.map((des) => (
                    <option key={des.id} value={des.id}>
                      {des.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Direct Manager">
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                >
                  <option value="">-- Direct to CEO / Executive --</option>
                  {possibleManagers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.employeeCode})
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Employment Type">
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                >
                  {Object.values(EMPLOYMENT_TYPES).map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Status">
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                >
                  {Object.values(EMPLOYEE_STATUSES).map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="sm:col-span-2">
                <FormField label="Profile Photo URL">
                  <Input
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                  />
                </FormField>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
