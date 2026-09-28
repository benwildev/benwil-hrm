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
import type { Department, Employee } from "@/types/organization"

interface DepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department?: Department | null // If present, edit mode
  onSuccess: (savedDept: Department) => void
}

export function DepartmentDialog({
  open,
  onOpenChange,
  department,
  onSuccess,
}: DepartmentDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [managerId, setManagerId] = React.useState<string>("")
  const [status, setStatus] = React.useState<"active" | "inactive">("active")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [availableEmployees, setAvailableEmployees] = React.useState<Employee[]>([])

  React.useEffect(() => {
    if (open) {
      setAvailableEmployees(employeesService.getEmployees({ status: "active" }))
      if (department) {
        setName(department.name)
        setDescription(department.description || "")
        setManagerId(department.managerId || "")
        setStatus(department.status)
      } else {
        setName("")
        setDescription("")
        setManagerId("")
        setStatus("active")
      }
      setError(null)
    }
  }, [open, department])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (department) {
        // Edit mode
        const result = departmentsService.updateDepartment(department.id, {
          name,
          description,
          managerId: managerId || null,
          status,
        })
        if (!result.success) {
          setError(result.error)
          setIsSubmitting(false)
          return
        }
        onSuccess(result.data)
        onOpenChange(false)
      } else {
        // Create mode
        const result = departmentsService.createDepartment({
          name,
          description,
          managerId: managerId || null,
          status,
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
            <DialogTitle>
              {department ? "Edit Department" : "Create Department"}
            </DialogTitle>
            <DialogDescription>
              {department
                ? "Update department information, manager assignment, and active status."
                : "Add a new department to organize your workforce and operational units."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <FormField label="Department Name" required error={!name.trim() && error ? "Name is required" : undefined}>
              <Input
                placeholder="e.g. Engineering, Sales, Operations"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </FormField>

            <FormField label="Description">
              <Textarea
                placeholder="Brief summary of this department's mission and scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </FormField>

            <FormField label="Department Head / Manager" description="Assign an active employee to lead this department.">
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
              >
                <option value="">-- No Department Head Assigned --</option>
                {availableEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Status">
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
              disabled={isSubmitting || !name.trim()}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {isSubmitting
                ? "Saving..."
                : department
                ? "Save Changes"
                : "Create Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
