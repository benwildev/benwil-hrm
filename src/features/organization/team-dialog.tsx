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
import { Textarea } from "@/components/ui/textarea"
import { departmentsService } from "@/lib/services/departments-service"
import { employeesService } from "@/lib/services/employees-service"
import { teamsService } from "@/lib/services/teams-service"
import type { Department, Employee, Team } from "@/types/organization"

interface TeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team?: Team | null
  defaultDepartmentId?: string
  onSuccess: (savedTeam: Team) => void
}

export function TeamDialog({
  open,
  onOpenChange,
  team,
  defaultDepartmentId,
  onSuccess,
}: TeamDialogProps) {
  const [name, setName] = React.useState("")
  const [departmentId, setDepartmentId] = React.useState("")
  const [leadId, setLeadId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [departments, setDepartments] = React.useState<Department[]>([])
  const [employees, setEmployees] = React.useState<Employee[]>([])

  React.useEffect(() => {
    if (open) {
      const allDepts = departmentsService.getDepartments()
      setDepartments(allDepts)
      setEmployees(employeesService.getEmployees({ status: "active" }))

      if (team) {
        setName(team.name)
        setDepartmentId(team.departmentId)
        setLeadId(team.leadId || "")
        setDescription(team.description || "")
      } else {
        setName("")
        setDepartmentId(defaultDepartmentId || allDepts[0]?.id || "")
        setLeadId("")
        setDescription("")
      }
      setError(null)
    }
  }, [open, team, defaultDepartmentId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (team) {
        const result = teamsService.updateTeam(team.id, {
          name,
          departmentId,
          leadId: leadId || null,
          description,
        })
        if (!result.success) {
          setError(result.error)
          setIsSubmitting(false)
          return
        }
        onSuccess(result.data)
        onOpenChange(false)
      } else {
        const result = teamsService.createTeam({
          name,
          departmentId,
          leadId: leadId || null,
          description,
        })
        if (!result.success) {
          setError(result.error)
          setIsSubmitting(false)
          return
        }
        onSuccess(result.data)
        onOpenChange(false)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{team ? "Edit Team" : "Create Team"}</DialogTitle>
            <DialogDescription>
              {team
                ? "Update team details, department assignment, or designated team lead."
                : "Add a specialized team within an existing department."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <FormField label="Team Name" required>
              <Input
                placeholder="e.g. Backend Team, Mobile Team, Content Team"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </FormField>

            <FormField label="Department" required>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                <option value="" disabled>
                  -- Select Department --
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Team Lead" description="Assign an active employee to lead this team.">
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
              >
                <option value="">-- No Team Lead Assigned --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Description">
              <Textarea
                placeholder="Key goals, domain boundaries, or projects handled by this team..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </FormField>
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
              disabled={isSubmitting || !name.trim() || !departmentId}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {isSubmitting
                ? "Saving..."
                : team
                ? "Save Changes"
                : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
