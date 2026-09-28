import * as React from "react"
import {
  ChevronDownIcon,
  KeyRoundIcon,
  ListChecksIcon,
  MessageSquareIcon,
  PencilIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserCheckIcon,
  UserMinusIcon,
  UsersIcon,
} from "lucide-react"

import { StatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { EmployeeAccount } from "@/types/auth"
import type { EmployeeWithRelations } from "@/types/organization"

interface ProfileHeaderProps {
  employee: EmployeeWithRelations
  account: EmployeeAccount | null
  onEditProfile: () => void
  onDeactivate: () => void
  onDelete: () => void
  onResetPassword?: () => void
  onToggleAccountStatus?: () => void
  onQuickChangeOrg?: (field: "department" | "team" | "designation" | "manager") => void
}

export function ProfileHeader({
  employee,
  account,
  onEditProfile,
  onDeactivate,
  onDelete,
  onResetPassword,
  onToggleAccountStatus,
  onQuickChangeOrg,
}: ProfileHeaderProps) {
  const renderAccountBadge = () => {
    if (!account) {
      return (
        <Badge variant="outline" className="text-muted-foreground/70 border-dashed gap-1 text-[11px]">
          — No Account
        </Badge>
      )
    }

    switch (account.status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-400 gap-1.5 font-semibold text-[11px]"
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Account: Active
          </Badge>
        )
      case "disabled":
        return (
          <Badge
            variant="outline"
            className="border-destructive/30 bg-destructive/10 text-destructive gap-1.5 font-semibold text-[11px]"
          >
            <span className="size-1.5 rounded-full bg-destructive" />
            Account: Disabled
          </Badge>
        )
      case "pending":
      case "invited":
        return (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-400 gap-1.5 font-semibold text-[11px]"
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            Account: Pending First Login
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="gap-1.5 capitalize text-[11px]">
            <span className="size-1.5 rounded-full bg-muted-foreground" />
            Account: {account.status}
          </Badge>
        )
    }
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs lg:flex-row lg:items-center lg:justify-between">
      {/* Left: Avatar & Identity details */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Avatar className="size-16 sm:size-20 border-2 border-border/80 shadow-xs shrink-0">
          <AvatarImage src={employee.avatar} alt={employee.fullName} />
          <AvatarFallback className="text-lg sm:text-xl font-bold bg-muted text-foreground">
            {employee.firstName[0]}
            {employee.lastName[0]}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {employee.fullName}
            </h1>
            <StatusBadge status={employee.status} />
            {renderAccountBadge()}
            <span className="font-mono text-xs text-muted-foreground">
              ({employee.employeeCode})
            </span>
          </div>

          <p className="text-sm font-medium text-foreground/90">
            {employee.designation ? employee.designation.name : "Unassigned Designation"}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {employee.department ? employee.department.name : "No Department"}
            </span>
            <span>·</span>
            <span>
              {employee.team ? employee.team.name : "No Team Assignment"}
            </span>
            <span>·</span>
            <span>
              Joined {new Date(employee.joiningDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
        {/* Message - Future placeholder */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-xs opacity-60 cursor-not-allowed"
              >
                <MessageSquareIcon className="size-3.5" />
                Message
              </Button>
            }
          />
          <TooltipContent>Chat functionality will be unlocked in a future phase</TooltipContent>
        </Tooltip>

        {/* Assign Task - Future placeholder */}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-xs opacity-60 cursor-not-allowed"
              >
                <ListChecksIcon className="size-3.5" />
                Assign Task
              </Button>
            }
          />
          <TooltipContent>Task assignments will be unlocked in a future phase</TooltipContent>
        </Tooltip>

        {/* Edit Profile */}
        <Button
          size="sm"
          onClick={onEditProfile}
          className="text-xs bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
        >
          <PencilIcon className="size-3.5" />
          Edit Profile
        </Button>

        {/* More Actions Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <span>More</span>
                <ChevronDownIcon className="size-3.5 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-[11px] text-muted-foreground font-semibold">
              Organizational Placement
            </DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onQuickChangeOrg?.("department")}>
              <UsersIcon className="size-3.5 mr-2" />
              Change Department
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickChangeOrg?.("team")}>
              <UsersIcon className="size-3.5 mr-2" />
              Change Team
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickChangeOrg?.("designation")}>
              <UsersIcon className="size-3.5 mr-2" />
              Change Designation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickChangeOrg?.("manager")}>
              <UserCheckIcon className="size-3.5 mr-2" />
              Change Direct Manager
            </DropdownMenuItem>

            {account && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px] text-muted-foreground font-semibold">
                  Account Management
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={onResetPassword}>
                  <KeyRoundIcon className="size-3.5 mr-2" />
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleAccountStatus}>
                  {account.status === "disabled" ? (
                    <>
                      <ShieldCheckIcon className="size-3.5 mr-2 text-emerald-600" />
                      Re-enable Login Account
                    </>
                  ) : (
                    <>
                      <ShieldAlertIcon className="size-3.5 mr-2 text-destructive" />
                      Disable Login Account
                    </>
                  )}
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] text-muted-foreground font-semibold">
              HR Administration
            </DropdownMenuLabel>
            {employee.status !== "inactive" && (
              <DropdownMenuItem
                onClick={onDeactivate}
                className="text-amber-700 dark:text-amber-400 focus:text-amber-700"
              >
                <UserMinusIcon className="size-3.5 mr-2" />
                Deactivate Employee
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2Icon className="size-3.5 mr-2" />
              Delete Record
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
