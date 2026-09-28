import * as React from "react"
import {
  AlertCircleIcon,
  BadgeCheckIcon,
  BriefcaseIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  ClockIcon,
  MapPinIcon,
  PencilIcon,
  ShieldAlertIcon,
  UserCheckIcon,
} from "lucide-react"

import { FormField } from "@/components/shared/form-field"
import { StatusBadge } from "@/components/shared/status-badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { employeeProfileService } from "@/lib/services/employee-profile-service"
import type { EmploymentDetails } from "@/types/employee-profile"
import type { EmployeeWithRelations } from "@/types/organization"

interface TabEmploymentProps {
  employee: EmployeeWithRelations
  employmentDetails: EmploymentDetails
  onProfileUpdated: () => void
}

export function TabEmployment({
  employee,
  employmentDetails,
  onProfileUpdated,
}: TabEmploymentProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  // Edit form state
  const [workLocation, setWorkLocation] = React.useState(
    employmentDetails.workLocation || "HQ - New York Office"
  )
  const [contractType, setContractType] = React.useState<
    "permanent" | "probationary" | "fixed_term" | "internship"
  >(employmentDetails.contractType || "permanent")
  const [noticePeriod, setNoticePeriod] = React.useState(
    employmentDetails.noticePeriod || "30 Days"
  )
  const [probationEndDate, setProbationEndDate] = React.useState(
    employmentDetails.probationEndDate || ""
  )
  const [confirmationDate, setConfirmationDate] = React.useState(
    employmentDetails.confirmationDate || ""
  )
  const [employmentEndDate, setEmploymentEndDate] = React.useState(
    employmentDetails.employmentEndDate || ""
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleOpenEdit = () => {
    setWorkLocation(employmentDetails.workLocation || "HQ - New York Office")
    setContractType(employmentDetails.contractType || "permanent")
    setNoticePeriod(employmentDetails.noticePeriod || "30 Days")
    setProbationEndDate(employmentDetails.probationEndDate || "")
    setConfirmationDate(employmentDetails.confirmationDate || "")
    setEmploymentEndDate(employmentDetails.employmentEndDate || "")
    setIsEditDialogOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      employeeProfileService.updateEmploymentDetails(employee.id, {
        workLocation,
        contractType,
        noticePeriod,
        probationEndDate: probationEndDate || undefined,
        confirmationDate: confirmationDate || undefined,
        employmentEndDate: employmentEndDate || undefined,
      })
      setIsEditDialogOpen(false)
      onProfileUpdated()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate lifecycle stages
  const isTerminated =
    employee.status === "terminated" || employee.status === "inactive"
  const isProbation = employee.status === "probation"
  const isActive = employee.status === "active"

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Lifecycle Progress Banner */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Employment Lifecycle Tracker
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tracks the formal employment milestones and operational status of{" "}
              {employee.firstName}.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Current Stage:</span>
            <StatusBadge status={employee.status} />
          </div>
        </div>

        {/* Milestone Steps */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {/* Step 1: Onboarding */}
          <div className="relative flex flex-col rounded-lg border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2Icon className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground">1. Onboarding</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Joined organization</p>
            <p className="mt-2 text-xs font-medium text-foreground">
              {formatDate(employee.joiningDate)}
            </p>
          </div>

          {/* Step 2: Probation */}
          <div
            className={`relative flex flex-col rounded-lg border p-4 ${
              isProbation
                ? "border-amber-400/60 bg-amber-50/40 dark:border-amber-700/50 dark:bg-amber-950/20"
                : "border-border/60 bg-muted/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`flex size-7 items-center justify-center rounded-full ${
                  isProbation
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {isProbation ? (
                  <ClockIcon className="size-4" />
                ) : (
                  <CheckCircle2Icon className="size-4" />
                )}
              </div>
              <span className="text-xs font-semibold text-foreground">2. Probation</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isProbation ? "Under evaluation" : "Evaluation concluded"}
            </p>
            <p className="mt-2 text-xs font-medium text-foreground">
              {employmentDetails.probationEndDate
                ? `Until ${formatDate(employmentDetails.probationEndDate)}`
                : "Standard 3 Months"}
            </p>
          </div>

          {/* Step 3: Confirmation / Active Regular */}
          <div
            className={`relative flex flex-col rounded-lg border p-4 ${
              isActive
                ? "border-emerald-400/60 bg-emerald-50/30 dark:border-emerald-700/50 dark:bg-emerald-950/20"
                : "border-border/60 bg-muted/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`flex size-7 items-center justify-center rounded-full ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <BadgeCheckIcon className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                3. Regularized
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Confirmed workforce member</p>
            <p className="mt-2 text-xs font-medium text-foreground">
              {employmentDetails.confirmationDate
                ? formatDate(employmentDetails.confirmationDate)
                : isActive
                ? "Confirmed"
                : "Pending Confirmation"}
            </p>
          </div>

          {/* Step 4: Separation / Retention */}
          <div
            className={`relative flex flex-col rounded-lg border p-4 ${
              isTerminated
                ? "border-destructive/60 bg-destructive/10"
                : "border-border/60 bg-muted/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`flex size-7 items-center justify-center rounded-full ${
                  isTerminated
                    ? "bg-destructive/20 text-destructive"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isTerminated ? (
                  <ShieldAlertIcon className="size-4" />
                ) : (
                  <UserCheckIcon className="size-4" />
                )}
              </div>
              <span className="text-xs font-semibold text-foreground">
                4. {isTerminated ? "Separated" : "In Good Standing"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isTerminated ? "Contract concluded" : "Active retention"}
            </p>
            <p className="mt-2 text-xs font-medium text-foreground">
              {employmentDetails.employmentEndDate
                ? `Ended ${formatDate(employmentDetails.employmentEndDate)}`
                : "Continuous Tenancy"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Employment Parameters Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Card: Core Employment Terms */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="size-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Terms & Classification
              </h3>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={handleOpenEdit}
              className="gap-1.5 text-xs h-7"
            >
              <PencilIcon className="size-3" />
              <span>Edit Parameters</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Employee Code</span>
              <p className="font-mono font-semibold text-foreground">
                {employee.employeeCode}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Employment Type</span>
              <p className="font-semibold text-foreground capitalize">
                {employee.employmentType.replace("_", " ")}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Contract Type</span>
              <p className="font-semibold text-foreground capitalize">
                {(employmentDetails.contractType || "permanent").replace("_", " ")}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Work Location</span>
              <p className="font-semibold text-foreground flex items-center gap-1">
                <MapPinIcon className="size-3 text-muted-foreground shrink-0" />
                <span>{employmentDetails.workLocation || "HQ - New York Office"}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Notice Period</span>
              <p className="font-semibold text-foreground">
                {employmentDetails.noticePeriod || "30 Days"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Official Email</span>
              <p className="font-semibold text-foreground truncate">{employee.email}</p>
            </div>
          </div>
        </div>

        {/* Right Card: Critical Timeline Dates */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <CalendarClockIcon className="size-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tenure & Key Dates
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Date of Joining</span>
              <p className="font-semibold text-foreground">
                {formatDate(employee.joiningDate)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Confirmation Date</span>
              <p className="font-semibold text-foreground">
                {formatDate(employmentDetails.confirmationDate)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">
                Probation End Date
              </span>
              <p className="font-semibold text-foreground">
                {formatDate(employmentDetails.probationEndDate)}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">
                Contract Expiry / Separation Date
              </span>
              <p
                className={`font-semibold ${
                  employmentDetails.employmentEndDate
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {employmentDetails.employmentEndDate
                  ? formatDate(employmentDetails.employmentEndDate)
                  : "Indefinite / Permanent"}
              </p>
            </div>
          </div>

          {/* Conditional Alert if Separated or Probation */}
          {isProbation && (
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-3 dark:border-amber-900/50 dark:bg-amber-950/30 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
              <ClockIcon className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold">Under Active Probation</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400/90 mt-0.5">
                  Performance review scheduled prior to{" "}
                  {formatDate(employmentDetails.probationEndDate)}.
                </p>
              </div>
            </div>
          )}

          {isTerminated && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-start gap-2 text-xs text-destructive">
              <AlertCircleIcon className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Separation Finalized</p>
                <p className="text-[11px] text-destructive/80 mt-0.5">
                  Employment was discontinued on{" "}
                  {formatDate(employmentDetails.employmentEndDate)}. System access has
                  been decommissioned.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Employment Parameters Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>Edit Employment Parameters</DialogTitle>
              <DialogDescription>
                Update location, contract classification, and milestones for{" "}
                {employee.firstName}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 text-xs">
              <FormField label="Work Location" required>
                <Input
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  placeholder="e.g. HQ - New York, Remote - EMEA"
                  required
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Contract Type">
                  <Select
                    value={contractType}
                    onValueChange={(val) =>
                      setContractType(
                        val as "permanent" | "probationary" | "fixed_term" | "internship"
                      )
                    }
                  >
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="probationary">Probationary</SelectItem>
                      <SelectItem value="fixed_term">Fixed Term</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Notice Period">
                  <Input
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    placeholder="e.g. 30 Days"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Probation End Date">
                  <Input
                    type="date"
                    value={probationEndDate}
                    onChange={(e) => setProbationEndDate(e.target.value)}
                  />
                </FormField>

                <FormField label="Confirmation Date">
                  <Input
                    type="date"
                    value={confirmationDate}
                    onChange={(e) => setConfirmationDate(e.target.value)}
                  />
                </FormField>
              </div>

              <FormField
                label="Separation / Contract End Date"
                description="Leave empty if the employee is in active employment."
              >
                <Input
                  type="date"
                  value={employmentEndDate}
                  onChange={(e) => setEmploymentEndDate(e.target.value)}
                />
              </FormField>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Parameters"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
