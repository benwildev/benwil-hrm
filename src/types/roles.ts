export type DataScope = "all" | "department" | "team" | "self"

export const DATA_SCOPE_LABELS: Record<DataScope, { label: string; description: string }> = {
  all: {
    label: "All Employees",
    description: "Access full company-wide records across all departments",
  },
  department: {
    label: "My Department",
    description: "Access records within the user's assigned department only",
  },
  team: {
    label: "My Team",
    description: "Access records within the user's assigned squad or direct reports",
  },
  self: {
    label: "Only Myself",
    description: "Strictly limited to the user's own personal records and submissions",
  },
}

export type PermissionModule =
  | "employees"
  | "departments"
  | "teams"
  | "designations"
  | "attendance"
  | "leave"
  | "payroll"
  | "reports"
  | "settings"

export const PERMISSION_MODULE_LABELS: Record<PermissionModule, string> = {
  employees: "Employees",
  departments: "Departments",
  teams: "Teams",
  designations: "Designations",
  attendance: "Attendance",
  leave: "Leave",
  payroll: "Payroll",
  reports: "Reports",
  settings: "Settings",
}

export interface PermissionDefinition {
  id: string
  label: string
  description: string
  module: PermissionModule
  dependencies?: string[] // e.g. ["employees.view"]
}

export interface Role {
  id: string
  name: string
  description: string
  isSystem: boolean
  dataScope: DataScope
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // 1. Employees
  {
    id: "employees.view",
    label: "View Employees",
    description: "View workforce directory and employee profiles",
    module: "employees",
  },
  {
    id: "employees.create",
    label: "Create Employees",
    description: "Add new employees to the workforce directory",
    module: "employees",
    dependencies: ["employees.view"],
  },
  {
    id: "employees.edit",
    label: "Edit Employees",
    description: "Modify employee profile parameters and information",
    module: "employees",
    dependencies: ["employees.view"],
  },
  {
    id: "employees.deactivate",
    label: "Deactivate Employees",
    description: "Transition employee status to inactive",
    module: "employees",
    dependencies: ["employees.view", "employees.edit"],
  },
  {
    id: "employees.delete",
    label: "Delete Employees",
    description: "Permanently delete employee records from system",
    module: "employees",
    dependencies: ["employees.view"],
  },
  {
    id: "employees.view_personal",
    label: "View Personal Information",
    description: "Access residential address, date of birth, and emergency contacts",
    module: "employees",
    dependencies: ["employees.view"],
  },
  {
    id: "employees.view_compensation",
    label: "View Compensation",
    description: "View employee salary, allowances, and bank accounts",
    module: "employees",
    dependencies: ["employees.view"],
  },
  {
    id: "employees.manage_documents",
    label: "Manage Documents",
    description: "Upload, download, and delete employee compliance documents",
    module: "employees",
    dependencies: ["employees.view"],
  },
  {
    id: "employees.manage_accounts",
    label: "Manage Accounts",
    description: "Provision login accounts, reset passwords, and change roles",
    module: "employees",
    dependencies: ["employees.view"],
  },

  // 2. Departments
  {
    id: "departments.view",
    label: "View Departments",
    description: "View organizational departments and staff counts",
    module: "departments",
  },
  {
    id: "departments.create",
    label: "Create Departments",
    description: "Establish new organizational departments",
    module: "departments",
    dependencies: ["departments.view"],
  },
  {
    id: "departments.edit",
    label: "Edit Departments",
    description: "Modify department metadata and assigned managers",
    module: "departments",
    dependencies: ["departments.view"],
  },
  {
    id: "departments.delete",
    label: "Delete Departments",
    description: "Remove departments from the organization",
    module: "departments",
    dependencies: ["departments.view"],
  },

  // 3. Teams
  {
    id: "teams.view",
    label: "View Teams",
    description: "View functional teams and agile squads",
    module: "teams",
  },
  {
    id: "teams.create",
    label: "Create Teams",
    description: "Form new functional teams within departments",
    module: "teams",
    dependencies: ["teams.view"],
  },
  {
    id: "teams.edit",
    label: "Edit Teams",
    description: "Modify team parameters and assigned team leads",
    module: "teams",
    dependencies: ["teams.view"],
  },
  {
    id: "teams.delete",
    label: "Delete Teams",
    description: "Disband or delete functional teams",
    module: "teams",
    dependencies: ["teams.view"],
  },
  {
    id: "teams.manage_members",
    label: "Manage Team Members",
    description: "Assign or transfer members between teams",
    module: "teams",
    dependencies: ["teams.view"],
  },

  // 4. Designations
  {
    id: "designations.view",
    label: "View Designations",
    description: "View professional job titles and role levels",
    module: "designations",
  },
  {
    id: "designations.create",
    label: "Create Designations",
    description: "Register new professional designations",
    module: "designations",
    dependencies: ["designations.view"],
  },
  {
    id: "designations.edit",
    label: "Edit Designations",
    description: "Update job title descriptions and specifications",
    module: "designations",
    dependencies: ["designations.view"],
  },
  {
    id: "designations.delete",
    label: "Delete Designations",
    description: "Remove designations from the system",
    module: "designations",
    dependencies: ["designations.view"],
  },

  // 5. Attendance
  {
    id: "attendance.view",
    label: "View Attendance",
    description: "Access general attendance logs and timesheets",
    module: "attendance",
  },
  {
    id: "attendance.view_own",
    label: "View Own Attendance",
    description: "Access personal attendance history and clock times",
    module: "attendance",
  },
  {
    id: "attendance.view_team",
    label: "View Team Attendance",
    description: "Monitor presence and check-ins of assigned team",
    module: "attendance",
  },
  {
    id: "attendance.manage",
    label: "Manage Attendance",
    description: "Override shifts and confirm daily attendance batches",
    module: "attendance",
    dependencies: ["attendance.view"],
  },
  {
    id: "attendance.correct",
    label: "Correct Attendance",
    description: "Adjust missed punches and review correction requests",
    module: "attendance",
    dependencies: ["attendance.view"],
  },
  {
    id: "attendance.manage_rules",
    label: "Manage Attendance Rules",
    description: "Configure grace periods, half-day cutoffs, and shift rules",
    module: "attendance",
    dependencies: ["attendance.view"],
  },
  {
    id: "attendance.export",
    label: "Export Attendance",
    description: "Download attendance spreadsheets and summaries",
    module: "attendance",
    dependencies: ["attendance.view"],
  },

  // 6. Leave
  {
    id: "leave.view",
    label: "View Leave",
    description: "Access company leave calendar and applications",
    module: "leave",
  },
  {
    id: "leave.apply",
    label: "Apply Leave",
    description: "Submit personal time-off and medical leave applications",
    module: "leave",
  },
  {
    id: "leave.view_own",
    label: "View Own Leave",
    description: "Check personal leave balances and application statuses",
    module: "leave",
  },
  {
    id: "leave.view_team",
    label: "View Team Leave",
    description: "View vacation calendars for team members",
    module: "leave",
  },
  {
    id: "leave.approve",
    label: "Approve Leave",
    description: "Approve pending leave requests",
    module: "leave",
    dependencies: ["leave.view"],
  },
  {
    id: "leave.reject",
    label: "Reject Leave",
    description: "Decline submitted leave requests with remarks",
    module: "leave",
    dependencies: ["leave.view"],
  },
  {
    id: "leave.manage_policies",
    label: "Manage Leave Policies",
    description: "Configure annual quotas, carry-over limits, and leave types",
    module: "leave",
    dependencies: ["leave.view"],
  },

  // 7. Payroll
  {
    id: "payroll.view",
    label: "View Payroll",
    description: "Access payroll summaries and remuneration batches",
    module: "payroll",
  },
  {
    id: "payroll.view_own",
    label: "View Own Payroll",
    description: "View and download personal monthly payslips",
    module: "payroll",
  },
  {
    id: "payroll.view_team",
    label: "View Team Payroll",
    description: "Access team-level payroll overview if authorized",
    module: "payroll",
  },
  {
    id: "payroll.manage",
    label: "Manage Payroll",
    description: "Calculate deductions, process pay runs, and generate slips",
    module: "payroll",
    dependencies: ["payroll.view"],
  },
  {
    id: "payroll.approve",
    label: "Approve Payroll",
    description: "Authorize executive disbursement of processed payroll",
    module: "payroll",
    dependencies: ["payroll.view", "payroll.manage"],
  },
  {
    id: "payroll.manage_salary",
    label: "Manage Salary",
    description: "Adjust basic salaries and recurring allowances",
    module: "payroll",
    dependencies: ["payroll.view"],
  },
  {
    id: "payroll.view_compensation",
    label: "View Remuneration Data",
    description: "View sensitive compensation details across workforce",
    module: "payroll",
    dependencies: ["payroll.view"],
  },
  {
    id: "payroll.export",
    label: "Export Payroll",
    description: "Export bank disbursement files and tax reports",
    module: "payroll",
    dependencies: ["payroll.view"],
  },

  // 8. Reports
  {
    id: "reports.view",
    label: "View Reports",
    description: "Access analytics dashboards and executive KPIs",
    module: "reports",
  },
  {
    id: "reports.export",
    label: "Export Reports",
    description: "Download analytical CSVs and executive PDF summaries",
    module: "reports",
    dependencies: ["reports.view"],
  },
  {
    id: "reports.view_attendance",
    label: "View Attendance Reports",
    description: "Access presence rates, punctuality, and overtime metrics",
    module: "reports",
    dependencies: ["reports.view"],
  },
  {
    id: "reports.view_leave",
    label: "View Leave Reports",
    description: "Access absence trends, leave utilization, and balances",
    module: "reports",
    dependencies: ["reports.view"],
  },
  {
    id: "reports.view_payroll",
    label: "View Payroll Reports",
    description: "Access compensation trends, tax withholdings, and totals",
    module: "reports",
    dependencies: ["reports.view"],
  },
  {
    id: "reports.view_employees",
    label: "View Workforce Reports",
    description: "Access headcount, turnover, and demographic analytics",
    module: "reports",
    dependencies: ["reports.view"],
  },

  // 9. Settings
  {
    id: "settings.view_company",
    label: "View Company Settings",
    description: "View organization profile, address, and legal details",
    module: "settings",
  },
  {
    id: "settings.manage_company",
    label: "Manage Company Settings",
    description: "Update company details, branding, and timezone",
    module: "settings",
    dependencies: ["settings.view_company"],
  },
  {
    id: "settings.manage_work_schedule",
    label: "Manage Work Schedule",
    description: "Configure operating hours and working days",
    module: "settings",
  },
  {
    id: "settings.manage_roles",
    label: "Manage Roles",
    description: "Create, edit, duplicate, and delete custom roles",
    module: "settings",
  },
  {
    id: "settings.manage_permissions",
    label: "Manage Permissions",
    description: "Assign and reconfigure permission sets across roles",
    module: "settings",
    dependencies: ["settings.manage_roles"],
  },
  {
    id: "settings.manage_biometrics",
    label: "Manage Biometric Devices",
    description: "Configure biometric punch terminals and API keys",
    module: "settings",
  },
  {
    id: "settings.manage_leave_policies",
    label: "Manage Leave Policies",
    description: "Configure organization-wide leave entitlements",
    module: "settings",
  },
  {
    id: "settings.manage_payroll_settings",
    label: "Manage Payroll Settings",
    description: "Configure tax rules, pay cycles, and disbursement accounts",
    module: "settings",
  },
]
