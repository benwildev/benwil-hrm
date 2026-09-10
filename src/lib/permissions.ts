export const PERMISSIONS = {
  COMPANY_MANAGE: "company:manage",
  ROLES_MANAGE: "roles:manage",
  EMPLOYEES_MANAGE: "employees:manage",
  EMPLOYEES_VIEW: "employees:view",
  DOCUMENTS_MANAGE: "documents:manage",
  ATTENDANCE_VIEW_ALL: "attendance:view:all",
  ATTENDANCE_MANAGE: "attendance:manage",
  ATTENDANCE_POLICY_MANAGE: "attendance:policy:manage",
  DEVICES_MANAGE: "devices:manage",
  LEAVE_APPROVE: "leave:approve",
  LEAVE_TYPES_MANAGE: "leave:types:manage",
  PAYROLL_MANAGE: "payroll:manage",
  PAYROLL_RUN: "payroll:run",
  PAYROLL_VIEW_ALL: "payroll:view:all",
  REPORTS_VIEW: "reports:view",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_DEFINITIONS: {
  key: PermissionKey;
  group: string;
  description: string;
}[] = [
  { key: PERMISSIONS.COMPANY_MANAGE, group: "Company", description: "Manage company profile and branding" },
  { key: PERMISSIONS.ROLES_MANAGE, group: "Access Control", description: "Create/edit roles and permissions" },
  { key: PERMISSIONS.EMPLOYEES_MANAGE, group: "Employees", description: "Create/edit/deactivate employees" },
  { key: PERMISSIONS.EMPLOYEES_VIEW, group: "Employees", description: "View all employee records" },
  { key: PERMISSIONS.DOCUMENTS_MANAGE, group: "Employees", description: "Manage all employees' documents" },
  { key: PERMISSIONS.ATTENDANCE_VIEW_ALL, group: "Attendance", description: "View attendance for all employees" },
  { key: PERMISSIONS.ATTENDANCE_MANAGE, group: "Attendance", description: "Manually create/edit attendance records" },
  { key: PERMISSIONS.ATTENDANCE_POLICY_MANAGE, group: "Attendance", description: "Configure lateness/work-hour policy" },
  { key: PERMISSIONS.DEVICES_MANAGE, group: "Attendance", description: "Manage biometric devices and imports" },
  { key: PERMISSIONS.LEAVE_APPROVE, group: "Leave", description: "Approve or reject leave applications" },
  { key: PERMISSIONS.LEAVE_TYPES_MANAGE, group: "Leave", description: "Configure leave types and balances" },
  { key: PERMISSIONS.PAYROLL_MANAGE, group: "Payroll", description: "Manage salary structures and settings" },
  { key: PERMISSIONS.PAYROLL_RUN, group: "Payroll", description: "Run and lock payroll" },
  { key: PERMISSIONS.PAYROLL_VIEW_ALL, group: "Payroll", description: "View all employees' payslips" },
  { key: PERMISSIONS.REPORTS_VIEW, group: "Reports", description: "View company-wide reports" },
];
