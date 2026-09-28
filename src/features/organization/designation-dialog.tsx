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
import { designationsService } from "@/lib/services/designations-service"
import type { Department, Designation } from "@/types/organization"

interface DesignationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  designation?: Designation | null
  onSuccess: (saved: Designation) => void
}

export function DesignationDialog({
  open,
  onOpenChange,
  designation,
  onSuccess,
}: DesignationDialogProps) {
  const [name, setName] = React.useState("")
  const [departmentId, setDepartmentId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [departments, setDepartments] = React.useState<Department[]>([])

  React.useEffect(() => {
    if (open) {
      setDepartments(departmentsService.getDepartments())
      if (designation) {
        setName(designation.name)
        setDepartmentId(designation.departmentId || "")
        setDescription(designation.description || "")
      } else {
        setName("")
        setDepartmentId("")
        setDescription("")
      }
      setError(null)
    }
  }, [open, designation])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (designation) {
        const result = designationsService.updateDesignation(designation.id, {
          name,
          departmentId: departmentId || null,
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
        const result = designationsService.createDesignation({
          name,
          departmentId: departmentId || null,
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
            <DialogTitle>
              {designation ? "Edit Designation" : "Create Designation"}
            </DialogTitle>
            <DialogDescription>
              Job titles define employee responsibilities and hierarchy, independent of system security roles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <FormField label="Designation Title" required>
              <Input
                placeholder="e.g. Senior Backend Developer, UX Researcher"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </FormField>

            <FormField label="Department (Optional)" description="Assign to a specific department or leave blank for company-wide roles.">
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:bg-zinc-900"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">-- Company-wide / General --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Role Summary / Description">
              <Textarea
                placeholder="Brief summary of duties, core seniority expectations, or scope..."
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
              disabled={isSubmitting || !name.trim()}
              className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {isSubmitting
                ? "Saving..."
                : designation
                ? "Save Changes"
                : "Create Designation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
