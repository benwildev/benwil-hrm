import * as React from "react"
import {
  ArrowRightIcon,
  Building2Icon,
  CalendarDaysIcon,
  ChevronRightIcon,
  ClockIcon,
  CrownIcon,
  ExternalLinkIcon,
  MailIcon,
  NetworkIcon,
  PencilIcon,
  PhoneIcon,
  UserCheckIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"

import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { departmentsService } from "@/lib/services/departments-service"
import { designationsService } from "@/lib/services/designations-service"
import { employeeProfileService } from "@/lib/services/employee-profile-service"
import { employeesService } from "@/lib/services/employees-service"
import { teamsService } from "@/lib/services/teams-service"
import type { EmploymentDetails } from "@/types/employee-profile"
import type { EmployeeWithRelations } from "@/types/organization"

interface TabOrganizationProps {
  employee: EmployeeWithRelations
  employmentDetails: EmploymentDetails
  onProfileUpdated: () => void
}

const SCHEDULE_PRESETS = [
  {
    id: "standard",
    name: "Standard Business Hours",
    hours: "09:00 AM – 05:00 PM",
    days: "Monday – Friday (40 hrs/wk)",
    timezone: "UTC-05:00 (Eastern Time)",
  },
  {
    id: "flexible_eng",
    name: "Engineering Core Shift",
    hours: "10:00 AM – 06:00 PM",
    days: "Monday – Friday (40 hrs/wk)",
    timezone: "UTC-05:00 (Eastern Time)",
  },
  {
    id: "support_morning",
    name: "Global Support — Morning Shift",
    hours: "07:00 AM – 03:00 PM",
    days: "Monday – Friday (40 hrs/wk)",
    timezone: "UTC+06:00 (Dhaka / Central Asia)",
  },
  {
    id: "support_evening",
    name: "Global Support — Evening Shift",
    hours: "03:00 PM – 11:00 PM",
    days: "Monday – Friday (40 hrs/wk)",
    timezone: "UTC+06:00 (Dhaka / Central Asia)",
  },
  {
    id: "part_time",
    name: "Part-Time Flexible Shift",
    hours: "10:00 AM – 02:00 PM",
    days: "Monday – Friday (20 hrs/wk)",
    timezone: "Flexible / Local",
  },
]

export function TabOrganization({
  employee,
  employmentDetails,
  onProfileUpdated,
}: TabOrganizationProps) {
  // Dialog States
  const [isDeptDialogOpen, setIsDeptDialogOpen] = React.useState(false)
  const [isTeamDialogOpen, setIsTeamDialogOpen] = React.useState(false)
  const [isDesigDialogOpen, setIsDesigDialogOpen] = React.useState(false)
  const [isManagerDialogOpen, setIsManagerDialogOpen] = React.useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = React.useState(false)

  // Selection states
  const [selectedDeptId, setSelectedDeptId] = React.useState(employee.departmentId || "")
  const [selectedTeamId, setSelectedTeamId] = React.useState(employee.teamId || "none")
  const [selectedDesigId, setSelectedDesigId] = React.useState(
    employee.designationId || ""
  )
  const [selectedManagerId, setSelectedManagerId] = React.useState(
    employee.managerId || "none"
  )
  const [selectedSchedule, setSelectedSchedule] = React.useState(
    employmentDetails.workSchedule || SCHEDULE_PRESETS[0].name
  )
  const [isSaving, setIsSaving] = React.useState(false)

  // Load org entities
  const departments = React.useMemo(() => departmentsService.getDepartments(), [])
  const teams = React.useMemo(
    () => teamsService.getTeams(employee.departmentId || undefined),
    [employee.departmentId]
  )
  const designations = React.useMemo(
    () => designationsService.getDesignations(),
    []
  )
  const allEmployees = React.useMemo(() => employeesService.getEmployees(), [])

  // Eligible managers (exclude this employee)
  const potentialManagers = React.useMemo(
    () => allEmployees.filter((e) => e.id !== employee.id && e.status === "active"),
    [allEmployees, employee.id]
  )

  // Direct reports of this employee
  const directReports = React.useMemo(
    () => allEmployees.filter((e) => e.managerId === employee.id),
    [allEmployees, employee.id]
  )

  // Current active schedule match
  const currentSchedule =
    SCHEDULE_PRESETS.find((s) => s.name === employmentDetails.workSchedule) ||
    SCHEDULE_PRESETS[0]

  // Handlers
  const handleSaveDepartment = () => {
    if (!selectedDeptId) return
    setIsSaving(true)
    try {
      employeesService.updateEmployee(employee.id, {
        departmentId: selectedDeptId,
        // Reset team if changing department
        teamId: null,
      })
      employeeProfileService.logActivity(employee.id, {
        type: "team_changed",
        title: "Department Assignment Changed",
        description: `Transferred to department: ${
          departments.find((d) => d.id === selectedDeptId)?.name
        }`,
        actorName: "System Administrator",
        actorRole: "Admin",
      })
      setIsDeptDialogOpen(false)
      onProfileUpdated()
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTeam = () => {
    setIsSaving(true)
    try {
      const newTeamId = selectedTeamId === "none" ? null : selectedTeamId
      employeesService.updateEmployee(employee.id, { teamId: newTeamId })
      employeeProfileService.logActivity(employee.id, {
        type: "team_changed",
        title: "Team Assignment Updated",
        description: newTeamId
          ? `Assigned to team: ${teams.find((t) => t.id === newTeamId)?.name}`
          : "Removed from specific team assignment.",
        actorName: "System Administrator",
        actorRole: "Admin",
      })
      setIsTeamDialogOpen(false)
      onProfileUpdated()
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDesignation = () => {
    if (!selectedDesigId) return
    setIsSaving(true)
    try {
      employeesService.updateEmployee(employee.id, {
        designationId: selectedDesigId,
      })
      employeeProfileService.logActivity(employee.id, {
        type: "profile_updated",
        title: "Designation Reassigned",
        description: `Designation title updated to: ${
          designations.find((d) => d.id === selectedDesigId)?.name
        }`,
        actorName: "System Administrator",
        actorRole: "Admin",
      })
      setIsDesigDialogOpen(false)
      onProfileUpdated()
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveManager = () => {
    setIsSaving(true)
    try {
      const newMgrId = selectedManagerId === "none" ? null : selectedManagerId
      employeesService.updateEmployee(employee.id, { managerId: newMgrId })
      employeeProfileService.logActivity(employee.id, {
        type: "profile_updated",
        title: "Reporting Line Updated",
        description: newMgrId
          ? `Direct reporting manager assigned: ${
              allEmployees.find((e) => e.id === newMgrId)?.firstName
            } ${allEmployees.find((e) => e.id === newMgrId)?.lastName}`
          : "Reporting line adjusted to executive / direct board.",
        actorName: "System Administrator",
        actorRole: "Admin",
      })
      setIsManagerDialogOpen(false)
      onProfileUpdated()
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSchedule = () => {
    setIsSaving(true)
    try {
      employeeProfileService.updateEmploymentDetails(employee.id, {
        workSchedule: selectedSchedule,
      })
      employeeProfileService.logActivity(employee.id, {
        type: "profile_updated",
        title: "Work Schedule Reassigned",
        description: `Operational work schedule adjusted to: ${selectedSchedule}`,
        actorName: "System Administrator",
        actorRole: "Admin",
      })
      setIsScheduleDialogOpen(false)
      onProfileUpdated()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Visual Hierarchy Path */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <NetworkIcon className="size-4 text-muted-foreground" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Organizational Position & Hierarchy
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/60">
          <div className="flex items-center gap-1.5 text-foreground font-semibold">
            <Building2Icon className="size-3.5 text-primary" />
            <span>Benwil Technologies</span>
          </div>
          <ChevronRightIcon className="size-3.5 text-muted-foreground/60 shrink-0" />

          <div className="flex items-center gap-1.5 text-foreground font-semibold">
            <span>{employee.department?.name || "Unassigned Dept"}</span>
          </div>
          <ChevronRightIcon className="size-3.5 text-muted-foreground/60 shrink-0" />

          <div className="flex items-center gap-1.5">
            <span>{employee.team?.name || "General Department Pool"}</span>
          </div>
          <ChevronRightIcon className="size-3.5 text-muted-foreground/60 shrink-0" />

          <div className="flex items-center gap-1.5 text-primary font-semibold">
            <Badge variant="outline" className="text-[11px] font-medium bg-primary/5">
              {employee.designation?.name || "Member"}
            </Badge>
          </div>
          <ChevronRightIcon className="size-3.5 text-muted-foreground/60 shrink-0" />

          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <span>
              {employee.firstName} {employee.lastName}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Department, Team & Designation 3-Column Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Department Card */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Department
              </span>
              <Building2Icon className="size-4 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {employee.department?.name || "Not Assigned"}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {employee.department?.description ||
                "Core business department organizing function and team personnel."}
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setSelectedDeptId(employee.departmentId || "")
              setIsDeptDialogOpen(true)
            }}
            className="w-full gap-1.5 text-xs h-8"
          >
            <PencilIcon className="size-3" />
            <span>Change Department</span>
          </Button>
        </div>

        {/* Team Card */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Functional Team
              </span>
              <UsersIcon className="size-4 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {employee.team?.name || "No Specific Team"}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {employee.team?.description ||
                "Specialized agile sprint unit operating under the parent department."}
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setSelectedTeamId(employee.teamId || "none")
              setIsTeamDialogOpen(true)
            }}
            className="w-full gap-1.5 text-xs h-8"
          >
            <PencilIcon className="size-3" />
            <span>Change Team</span>
          </Button>
        </div>

        {/* Designation Card */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Designation / Job Title
              </span>
              <CrownIcon className="size-4 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {employee.designation?.name || "General Staff"}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {employee.designation?.description ||
                "Official professional title and responsibilities framework."}
            </p>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setSelectedDesigId(employee.designationId || "")
              setIsDesigDialogOpen(true)
            }}
            className="w-full gap-1.5 text-xs h-8"
          >
            <PencilIcon className="size-3" />
            <span>Change Designation</span>
          </Button>
        </div>
      </div>

      {/* 3. Reporting Lines & Direct Reports Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Direct Manager Card */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <UserCheckIcon className="size-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Direct Reporting Manager
              </h3>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setSelectedManagerId(employee.managerId || "none")
                setIsManagerDialogOpen(true)
              }}
              className="gap-1.5 text-xs h-7"
            >
              <PencilIcon className="size-3" />
              <span>Change Manager</span>
            </Button>
          </div>

          {employee.manager ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/60 bg-muted/20">
              <div className="flex items-center gap-3.5">
                <Avatar className="size-11 border border-border/70">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.manager.email}`}
                  />
                  <AvatarFallback className="font-semibold text-xs">
                    {employee.manager.firstName[0]}
                    {employee.manager.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {employee.manager.firstName} {employee.manager.lastName}
                    </span>
                    <Badge variant="outline" className="text-[10px] h-4">
                      {employee.manager.employeeCode}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {designations.find((d) => d.id === employee.manager?.designationId)?.name || "Team Lead / Manager"}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MailIcon className="size-3 text-muted-foreground/80" />
                      {employee.manager.email}
                    </span>
                    {employee.manager.phone && (
                      <span className="flex items-center gap-1">
                        <PhoneIcon className="size-3 text-muted-foreground/80" />
                        {employee.manager.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link href={`/employees/${employee.manager.id}`}>
                <Button variant="ghost" size="xs" className="gap-1 text-xs shrink-0">
                  <span>View Profile</span>
                  <ExternalLinkIcon className="size-3" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/80 p-6 text-center">
              <UserIcon className="size-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs font-semibold text-foreground">
                No Direct Manager Assigned
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto">
                This employee holds top-tier executive authority or reports directly to
                the executive board.
              </p>
            </div>
          )}
        </div>

        {/* Direct Reports Card */}
        <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <UsersIcon className="size-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Direct Reports ({directReports.length})
              </h3>
            </div>
            {directReports.length > 0 && (
              <Badge variant="outline" className="text-[10px]">
                Active Squad
              </Badge>
            )}
          </div>

          {directReports.length > 0 ? (
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {directReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/10 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="size-8 border border-border/70 shrink-0">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${report.email}`}
                      />
                      <AvatarFallback className="text-[10px] font-semibold">
                        {report.firstName[0]}
                        {report.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {report.firstName} {report.lastName}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {designations.find((d) => d.id === report.designationId)?.name || "Team Member"} •{" "}
                        {departments.find((d) => d.id === report.departmentId)?.name || "Dept"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={report.status} />
                    <Link href={`/employees/${report.id}`}>
                      <Button variant="ghost" size="icon" className="size-7">
                        <ArrowRightIcon className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/80 p-6 text-center">
              <UsersIcon className="size-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-xs font-semibold text-foreground">No Direct Reports</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto">
                {employee.firstName} currently does not supervise any subordinates or
                direct functional reports.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Assigned Work Schedule Card */}
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="size-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Operational Work Schedule
            </h3>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              setSelectedSchedule(
                employmentDetails.workSchedule || SCHEDULE_PRESETS[0].name
              )
              setIsScheduleDialogOpen(true)
            }}
            className="gap-1.5 text-xs h-7"
          >
            <PencilIcon className="size-3" />
            <span>Change Schedule</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 text-xs">
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Schedule Plan</span>
            <p className="font-semibold text-foreground">{currentSchedule.name}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Operating Hours</span>
            <p className="font-semibold text-foreground flex items-center gap-1">
              <ClockIcon className="size-3 text-muted-foreground shrink-0" />
              <span>{currentSchedule.hours}</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Working Days</span>
            <p className="font-semibold text-foreground">{currentSchedule.days}</p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground">Timezone Standard</span>
            <p className="font-semibold text-foreground">{currentSchedule.timezone}</p>
          </div>
        </div>
      </div>

      {/* DIALOG: Change Department */}
      <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Department</DialogTitle>
            <DialogDescription>
              Assign {employee.firstName} to another core department. Note that any
              existing team assignment will be cleared.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label className="text-xs font-medium text-foreground">
              Select New Department
            </label>
            <Select value={selectedDeptId} onValueChange={(val) => { if (val) setSelectedDeptId(val) }}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeptDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDepartment} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Change Team */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Functional Team</DialogTitle>
            <DialogDescription>
              Assign {employee.firstName} to a team within{" "}
              {employee.department?.name || "their department"}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label className="text-xs font-medium text-foreground">
              Select Team
            </label>
            <Select value={selectedTeamId} onValueChange={(val) => { if (val) setSelectedTeamId(val) }}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Specific Team (General Pool)</SelectItem>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTeamDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTeam} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Change Designation */}
      <Dialog open={isDesigDialogOpen} onOpenChange={setIsDesigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reassign Designation</DialogTitle>
            <DialogDescription>
              Assign a new professional title/designation to {employee.firstName}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label className="text-xs font-medium text-foreground">
              Select Designation Title
            </label>
            <Select value={selectedDesigId} onValueChange={(val) => { if (val) setSelectedDesigId(val) }}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                {designations.map((desig) => (
                  <SelectItem key={desig.id} value={desig.id}>
                    {desig.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDesigDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDesignation} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update Designation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Change Manager */}
      <Dialog open={isManagerDialogOpen} onOpenChange={setIsManagerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Reporting Manager</DialogTitle>
            <DialogDescription>
              Designate a new supervisor responsible for {employee.firstName}&apos;s reviews
              and direct approvals.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <label className="text-xs font-medium text-foreground">
              Select Direct Manager
            </label>
            <Select value={selectedManagerId} onValueChange={(val) => { if (val) setSelectedManagerId(val) }}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  No Direct Manager (Top Executive / Board)
                </SelectItem>
                {potentialManagers.map((mgr) => (
                  <SelectItem key={mgr.id} value={mgr.id}>
                    {mgr.firstName} {mgr.lastName} ({designations.find((d) => d.id === mgr.designationId)?.name || mgr.employeeCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsManagerDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveManager} disabled={isSaving}>
              {isSaving ? "Saving..." : "Assign Manager"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Change Schedule */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reassign Work Schedule</DialogTitle>
            <DialogDescription>
              Select an operational shift and working hours template for{" "}
              {employee.firstName}.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <label className="text-xs font-medium text-foreground">
              Select Operational Shift
            </label>
            <Select value={selectedSchedule} onValueChange={(val) => { if (val) setSelectedSchedule(val) }}>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select schedule preset" />
              </SelectTrigger>
              <SelectContent>
                {SCHEDULE_PRESETS.map((sched) => (
                  <SelectItem key={sched.id} value={sched.name}>
                    {sched.name} ({sched.hours})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Shift preview box */}
            {(() => {
              const preview =
                SCHEDULE_PRESETS.find((s) => s.name === selectedSchedule) ||
                SCHEDULE_PRESETS[0]
              return (
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs space-y-1 mt-2">
                  <p className="font-semibold text-foreground">{preview.name}</p>
                  <p className="text-muted-foreground">
                    {preview.hours} • {preview.days}
                  </p>
                  <p className="text-[11px] text-muted-foreground/80">
                    Timezone: {preview.timezone}
                  </p>
                </div>
              )
            })()}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsScheduleDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} disabled={isSaving}>
              {isSaving ? "Saving..." : "Apply Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
