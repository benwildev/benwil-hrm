"use client"

import * as React from "react"
import {
  ActivityIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
  Building2Icon,
  CalendarCheckIcon,
  CalendarClockIcon,
  CreditCardIcon,
  DollarSignIcon,
  FileTextIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageContainer } from "@/components/shared/page-container"
import { EmployeeEditDialog } from "@/features/employees/employee-edit-dialog"
import { ProfileHeader } from "@/features/employees/tabs/profile-header"
import { TabAccount } from "@/features/employees/tabs/tab-account"
import { TabActivity } from "@/features/employees/tabs/tab-activity"
import { TabCompensation } from "@/features/employees/tabs/tab-compensation"
import { TabDocuments } from "@/features/employees/tabs/tab-documents"
import { TabEmployment } from "@/features/employees/tabs/tab-employment"
import { TabOrganization } from "@/features/employees/tabs/tab-organization"
import { TabOverview } from "@/features/employees/tabs/tab-overview"
import { TabPersonal } from "@/features/employees/tabs/tab-personal"
import { TabPlaceholder } from "@/features/employees/tabs/tab-placeholder"
import { authService } from "@/lib/auth/auth-service"
import { employeeProfileService } from "@/lib/services/employee-profile-service"
import { employeesService } from "@/lib/services/employees-service"
import type { EmployeeAccount } from "@/types/auth"
import type {
  Compensation,
  CompensationHistory,
  EmergencyContact,
  EmployeeActivity,
  EmployeeDocument,
  EmployeeNote,
  EmployeePersonalInfo,
  EmploymentDetails,
  PaymentInformation,
} from "@/types/employee-profile"
import type { EmployeeWithRelations } from "@/types/organization"

export type ProfileTab =
  | "overview"
  | "personal"
  | "employment"
  | "organization"
  | "compensation"
  | "documents"
  | "account"
  | "activity"
  | "attendance"
  | "leave"
  | "payroll"

export default function EmployeeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [activeTab, setActiveTab] = React.useState<ProfileTab>("overview")

  // Employee core & relations
  const [employeeData, setEmployeeData] =
    React.useState<EmployeeWithRelations | null>(null)
  const [account, setAccount] = React.useState<EmployeeAccount | null>(null)

  // Profile-specific HR state
  const [personalInfo, setPersonalInfo] =
    React.useState<EmployeePersonalInfo>({})
  const [emergencyContacts, setEmergencyContacts] = React.useState<
    EmergencyContact[]
  >([])
  const [employmentDetails, setEmploymentDetails] =
    React.useState<EmploymentDetails>({
      noticePeriod: "30 Days",
      workLocation: "HQ - New York Office",
      contractType: "permanent",
    })
  const [compensation, setCompensation] = React.useState<Compensation | null>(
    null
  )
  const [compensationHistory, setCompensationHistory] = React.useState<
    CompensationHistory[]
  >([])
  const [paymentInfo, setPaymentInfo] =
    React.useState<PaymentInformation | null>(null)
  const [documents, setDocuments] = React.useState<EmployeeDocument[]>([])
  const [notes, setNotes] = React.useState<EmployeeNote[]>([])
  const [activities, setActivities] = React.useState<EmployeeActivity[]>([])

  // Top level dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] =
    React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const loadEmployee = React.useCallback(() => {
    if (!id) return
    const emp = employeesService.getEmployeeWithRelations(id)
    if (!emp) {
      router.push("/employees")
      return
    }
    setEmployeeData(emp)

    // Load account
    const acc = authService.getAccountByEmployeeId(id)
    setAccount(acc)

    // Load HR profile entities
    setPersonalInfo(employeeProfileService.getPersonalInfo(id))
    setEmergencyContacts(employeeProfileService.getEmergencyContacts(id))
    setEmploymentDetails(employeeProfileService.getEmploymentDetails(id))
    setCompensation(employeeProfileService.getCompensation(id))
    setCompensationHistory(employeeProfileService.getCompensationHistory(id))
    setPaymentInfo(employeeProfileService.getPaymentInformation(id))
    setDocuments(employeeProfileService.getDocuments(id))
    setNotes(employeeProfileService.getNotes(id))
    setActivities(employeeProfileService.getActivities(id))
  }, [id, router])

  React.useEffect(() => {
    loadEmployee()
  }, [loadEmployee])

  if (!employeeData) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center p-16 text-xs text-muted-foreground">
          Loading comprehensive employee profile...
        </div>
      </PageContainer>
    )
  }

  const handleDeactivateConfirm = () => {
    employeesService.deactivateEmployee(employeeData.id)
    setIsDeactivateDialogOpen(false)
    loadEmployee()
  }

  const handleDeleteConfirm = () => {
    employeesService.deleteEmployee(employeeData.id)
    setIsDeleteDialogOpen(false)
    router.push("/employees")
  }

  const handleToggleAccountStatus = () => {
    if (!account) return
    if (account.status === "disabled") {
      authService.enableEmployeeAccount(employeeData.id)
    } else {
      authService.disableEmployeeAccount(employeeData.id)
    }
    loadEmployee()
  }

  const handleResetPassword = () => {
    setActiveTab("account")
  }

  const handleQuickChangeOrg = () => {
    setActiveTab("organization")
  }

  // 12 Tabs Specification
  const tabsList: Array<{
    id: ProfileTab
    label: string
    icon: React.ComponentType<{ className?: string }>
    isFuture?: boolean
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboardIcon },
    { id: "personal", label: "Personal", icon: UserIcon },
    { id: "employment", label: "Employment", icon: BriefcaseIcon },
    { id: "organization", label: "Organization", icon: Building2Icon },
    { id: "compensation", label: "Compensation", icon: DollarSignIcon },
    { id: "documents", label: "Documents", icon: FileTextIcon },
    { id: "account", label: "Account & Security", icon: KeyRoundIcon },
    { id: "activity", label: "Activity", icon: ActivityIcon },
    { id: "attendance", label: "Attendance", icon: CalendarCheckIcon, isFuture: true },
    { id: "leave", label: "Leave", icon: CalendarClockIcon, isFuture: true },
    { id: "payroll", label: "Payroll", icon: CreditCardIcon, isFuture: true },
  ]

  return (
    <PageContainer className="gap-6 max-w-7xl">
      {/* 1. Navigation Breadcrumb Back link */}
      <div>
        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" />
          <span>Back to Workforce Roster</span>
        </Link>
      </div>

      {/* 2. Executive Profile Header with Dual Status Badges & Quick Actions */}
      <ProfileHeader
        employee={employeeData}
        account={account}
        onEditProfile={() => setIsEditDialogOpen(true)}
        onDeactivate={() => setIsDeactivateDialogOpen(true)}
        onDelete={() => setIsDeleteDialogOpen(true)}
        onResetPassword={handleResetPassword}
        onToggleAccountStatus={handleToggleAccountStatus}
        onQuickChangeOrg={handleQuickChangeOrg}
      />

      {/* 3. Comprehensive Horizontal Tab Strip */}
      <div className="border-b border-border/80">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
          {tabsList.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-foreground text-background shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.isFuture && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded-full uppercase tracking-wider font-semibold ${
                      isActive
                        ? "bg-background/20 text-background"
                        : "bg-muted text-muted-foreground/80"
                    }`}
                  >
                    Module
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Active Tab Content Rendering */}
      <div className="pt-1">
        {activeTab === "overview" && (
          <TabOverview
            employee={employeeData}
            account={account}
            personalInfo={personalInfo}
            emergencyContacts={emergencyContacts}
            employmentDetails={employmentDetails}
            activities={activities}
            notes={notes}
            onNavigateTab={(tab) => setActiveTab(tab as ProfileTab)}
          />
        )}

        {activeTab === "personal" && (
          <TabPersonal
            employee={employeeData}
            personalInfo={personalInfo}
            emergencyContacts={emergencyContacts}
            onProfileUpdated={loadEmployee}
          />
        )}

        {activeTab === "employment" && (
          <TabEmployment
            employee={employeeData}
            employmentDetails={employmentDetails}
            onProfileUpdated={loadEmployee}
          />
        )}

        {activeTab === "organization" && (
          <TabOrganization
            employee={employeeData}
            employmentDetails={employmentDetails}
            onProfileUpdated={loadEmployee}
          />
        )}

        {activeTab === "compensation" && (
          <TabCompensation
            employee={employeeData}
            compensation={compensation}
            compensationHistory={compensationHistory}
            paymentInfo={paymentInfo}
            onProfileUpdated={loadEmployee}
          />
        )}

        {activeTab === "documents" && (
          <TabDocuments
            employee={employeeData}
            documents={documents}
            onProfileUpdated={loadEmployee}
          />
        )}

        {activeTab === "account" && (
          <TabAccount employee={employeeData} onProfileUpdated={loadEmployee} />
        )}

        {activeTab === "activity" && (
          <TabActivity
            employee={employeeData}
            activities={activities}
            notes={notes}
            onProfileUpdated={loadEmployee}
          />
        )}

        {/* 4 Polished Future Module Placeholders */}
        {activeTab === "attendance" && (
          <TabPlaceholder
            module="attendance"
            employeeName={employeeData.firstName}
          />
        )}

        {activeTab === "leave" && (
          <TabPlaceholder module="leave" employeeName={employeeData.firstName} />
        )}

        {activeTab === "payroll" && (
          <TabPlaceholder module="payroll" employeeName={employeeData.firstName} />
        )}
      </div>

      {/* Top Level Edit Profile Dialog */}
      <EmployeeEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        employee={employeeData}
        onSuccess={loadEmployee}
      />

      {/* Confirm Deactivation Dialog */}
      <ConfirmDialog
        open={isDeactivateDialogOpen}
        onOpenChange={setIsDeactivateDialogOpen}
        title="Deactivate Employee Record"
        description={`Are you sure you want to deactivate ${employeeData.firstName} ${employeeData.lastName}? Their employment status will transition to Inactive, and associated accounts will be flagged.`}
        confirmLabel="Deactivate"
        variant="destructive"
        onConfirm={handleDeactivateConfirm}
      />

      {/* Confirm Permanent Delete Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Employee Record"
        description={`Are you sure you want to permanently delete ${employeeData.firstName} ${employeeData.lastName}? This will permanently remove all profile documents, compensation histories, and credentials. This action is irreversible.`}
        confirmLabel="Delete Permanently"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  )
}
