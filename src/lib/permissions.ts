export const PERMISSIONS = {
  // Employees
  EMPLOYEES_READ: "employees:read",
  EMPLOYEES_CREATE: "employees:create",
  EMPLOYEES_UPDATE: "employees:update",
  EMPLOYEES_DELETE: "employees:delete",

  // Documents
  DOCUMENTS_READ: "documents:read",
  DOCUMENTS_CREATE: "documents:create",
  DOCUMENTS_UPDATE: "documents:update",
  DOCUMENTS_DELETE: "documents:delete",

  // Attendance
  ATTENDANCE_READ: "attendance:read",
  ATTENDANCE_CREATE: "attendance:create",
  ATTENDANCE_UPDATE: "attendance:update",
  ATTENDANCE_DELETE: "attendance:delete",
  ATTENDANCE_POLICY_MANAGE: "attendance:policy:manage",
  DEVICES_MANAGE: "devices:manage",

  // Leaves
  LEAVE_READ: "leave:read",
  LEAVE_CREATE: "leave:create",
  LEAVE_UPDATE: "leave:update",
  LEAVE_DELETE: "leave:delete",
  LEAVE_APPROVE: "leave:approve",

  // Payroll
  PAYROLL_READ: "payroll:read",
  PAYROLL_CREATE: "payroll:create",
  PAYROLL_UPDATE: "payroll:update",
  PAYROLL_DELETE: "payroll:delete",
  PAYROLL_RUN: "payroll:run",

  // Departments
  DEPARTMENTS_READ: "departments:read",
  DEPARTMENTS_CREATE: "departments:create",
  DEPARTMENTS_UPDATE: "departments:update",
  DEPARTMENTS_DELETE: "departments:delete",

  // Designations
  DESIGNATIONS_READ: "designations:read",
  DESIGNATIONS_CREATE: "designations:create",
  DESIGNATIONS_UPDATE: "designations:update",
  DESIGNATIONS_DELETE: "designations:delete",

  // Shifts
  SHIFTS_READ: "shifts:read",
  SHIFTS_CREATE: "shifts:create",
  SHIFTS_UPDATE: "shifts:update",
  SHIFTS_DELETE: "shifts:delete",

  // Holidays
  HOLIDAYS_READ: "holidays:read",
  HOLIDAYS_CREATE: "holidays:create",
  HOLIDAYS_UPDATE: "holidays:update",
  HOLIDAYS_DELETE: "holidays:delete",

  // Roles & Permissions
  ROLES_READ: "roles:read",
  ROLES_CREATE: "roles:create",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",

  // Company Settings
  COMPANY_READ: "company:read",
  COMPANY_UPDATE: "company:update",

  // Reports
  REPORTS_READ: "reports:read",
  REPORTS_EXPORT: "reports:export",

  // Backward-compatible alias mappings.
  //
  // IMPORTANT: EMPLOYEES_READ, DOCUMENTS_READ/CREATE, ATTENDANCE_READ/CREATE
  // and LEAVE_READ/CREATE are granted to every base "Employee" role by
  // default (see EMPLOYEE_DEFAULT_PERMISSIONS below) so staff can browse the
  // company directory and manage their own attendance/leave/documents. Any
  // alias below that is meant to gate "can see/manage OTHER employees'
  // data" must resolve to a DIFFERENT permission string than those, or the
  // check silently passes for every employee. EMPLOYEES_VIEW and
  // DOCUMENTS_MANAGE intentionally still alias the base read/create keys
  // (they gate the safe company directory and an employee's own document
  // uploads respectively) — do not use them to gate a full profile, another
  // employee's documents, or any other cross-employee data; use
  // EMPLOYEES_MANAGE (or requireEmployeeAccess) for that instead.
  COMPANY_MANAGE: "company:update",
  ROLES_MANAGE: "roles:update",
  EMPLOYEES_MANAGE: "employees:update",
  EMPLOYEES_VIEW: "employees:read",
  DOCUMENTS_MANAGE: "documents:create",
  // Deliberately NOT aliased to ATTENDANCE_READ ("attendance:read", a
  // default Employee permission) — that collision previously let any
  // employee call the "view every employee's attendance" DAL functions.
  ATTENDANCE_VIEW_ALL: "attendance:update",
  ATTENDANCE_MANAGE: "attendance:update",
  LEAVE_TYPES_MANAGE: "leave:update",
  PAYROLL_MANAGE: "payroll:update",
  PAYROLL_VIEW_ALL: "payroll:read",
  REPORTS_VIEW: "reports:read",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type PermissionAction = "READ" | "CREATE" | "UPDATE" | "DELETE" | "SPECIAL";

export interface PermissionDefinition {
  key: PermissionKey;
  group: string;
  action: PermissionAction;
  description: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Employees
  { key: PERMISSIONS.EMPLOYEES_READ, group: "Employees", action: "READ", description: "View employee profiles and personnel directory" },
  { key: PERMISSIONS.EMPLOYEES_CREATE, group: "Employees", action: "CREATE", description: "Onboard and create new employee records" },
  { key: PERMISSIONS.EMPLOYEES_UPDATE, group: "Employees", action: "UPDATE", description: "Edit personal details, job titles, and status" },
  { key: PERMISSIONS.EMPLOYEES_DELETE, group: "Employees", action: "DELETE", description: "Deactivate or terminate employee profiles" },

  // Documents
  { key: PERMISSIONS.DOCUMENTS_READ, group: "Documents", action: "READ", description: "View and inspect uploaded personnel files" },
  { key: PERMISSIONS.DOCUMENTS_CREATE, group: "Documents", action: "CREATE", description: "Upload new personnel documents & credentials" },
  { key: PERMISSIONS.DOCUMENTS_UPDATE, group: "Documents", action: "UPDATE", description: "Edit and replace existing employee documents" },
  { key: PERMISSIONS.DOCUMENTS_DELETE, group: "Documents", action: "DELETE", description: "Delete stored employee documentation" },

  // Attendance
  { key: PERMISSIONS.ATTENDANCE_READ, group: "Attendance", action: "READ", description: "View attendance logs and timesheets" },
  { key: PERMISSIONS.ATTENDANCE_CREATE, group: "Attendance", action: "CREATE", description: "Record and punch daily check-in and check-out" },
  { key: PERMISSIONS.ATTENDANCE_UPDATE, group: "Attendance", action: "UPDATE", description: "Manually adjust and correct attendance logs" },
  { key: PERMISSIONS.ATTENDANCE_DELETE, group: "Attendance", action: "DELETE", description: "Remove erroneous attendance punch records" },
  { key: PERMISSIONS.ATTENDANCE_POLICY_MANAGE, group: "Attendance", action: "SPECIAL", description: "Configure lateness tolerance and work-hour rules" },
  { key: PERMISSIONS.DEVICES_MANAGE, group: "Attendance", action: "SPECIAL", description: "Manage biometric devices and machine sync logs" },

  // Leave
  { key: PERMISSIONS.LEAVE_READ, group: "Leave", action: "READ", description: "View leave balances and time-off histories" },
  { key: PERMISSIONS.LEAVE_CREATE, group: "Leave", action: "CREATE", description: "Submit and apply for new leave requests" },
  { key: PERMISSIONS.LEAVE_UPDATE, group: "Leave", action: "UPDATE", description: "Edit leave policies and entitlement quotas" },
  { key: PERMISSIONS.LEAVE_DELETE, group: "Leave", action: "DELETE", description: "Cancel and remove submitted leave applications" },
  { key: PERMISSIONS.LEAVE_APPROVE, group: "Leave", action: "SPECIAL", description: "Approve or reject employee leave requests" },

  // Payroll
  { key: PERMISSIONS.PAYROLL_READ, group: "Payroll", action: "READ", description: "View salary structures and employee payslips" },
  { key: PERMISSIONS.PAYROLL_CREATE, group: "Payroll", action: "CREATE", description: "Generate monthly payroll calculations and runs" },
  { key: PERMISSIONS.PAYROLL_UPDATE, group: "Payroll", action: "UPDATE", description: "Adjust earnings, deductions, and disburse pay" },
  { key: PERMISSIONS.PAYROLL_DELETE, group: "Payroll", action: "DELETE", description: "Reset or delete unprocessed payroll records" },
  { key: PERMISSIONS.PAYROLL_RUN, group: "Payroll", action: "SPECIAL", description: "Finalize, execute disbursements, and lock periods" },

  // Departments
  { key: PERMISSIONS.DEPARTMENTS_READ, group: "Departments", action: "READ", description: "View company departments and roster assignments" },
  { key: PERMISSIONS.DEPARTMENTS_CREATE, group: "Departments", action: "CREATE", description: "Create new company departments" },
  { key: PERMISSIONS.DEPARTMENTS_UPDATE, group: "Departments", action: "UPDATE", description: "Rename and update department structures" },
  { key: PERMISSIONS.DEPARTMENTS_DELETE, group: "Departments", action: "DELETE", description: "Delete departments that have no assigned staff" },

  // Designations
  { key: PERMISSIONS.DESIGNATIONS_READ, group: "Designations", action: "READ", description: "View job designations and ranks" },
  { key: PERMISSIONS.DESIGNATIONS_CREATE, group: "Designations", action: "CREATE", description: "Create new job designations" },
  { key: PERMISSIONS.DESIGNATIONS_UPDATE, group: "Designations", action: "UPDATE", description: "Edit designation titles and requirements" },
  { key: PERMISSIONS.DESIGNATIONS_DELETE, group: "Designations", action: "DELETE", description: "Delete unused job designations" },

  // Shifts
  { key: PERMISSIONS.SHIFTS_READ, group: "Shifts", action: "READ", description: "View company shifts and working hours" },
  { key: PERMISSIONS.SHIFTS_CREATE, group: "Shifts", action: "CREATE", description: "Create new operational work shifts" },
  { key: PERMISSIONS.SHIFTS_UPDATE, group: "Shifts", action: "UPDATE", description: "Edit shift schedules and start/end times" },
  { key: PERMISSIONS.SHIFTS_DELETE, group: "Shifts", action: "DELETE", description: "Remove discontinued work shifts" },

  // Holidays
  { key: PERMISSIONS.HOLIDAYS_READ, group: "Holidays", action: "READ", description: "View company holiday calendar" },
  { key: PERMISSIONS.HOLIDAYS_CREATE, group: "Holidays", action: "CREATE", description: "Add official public and company holidays" },
  { key: PERMISSIONS.HOLIDAYS_UPDATE, group: "Holidays", action: "UPDATE", description: "Modify holiday dates and descriptions" },
  { key: PERMISSIONS.HOLIDAYS_DELETE, group: "Holidays", action: "DELETE", description: "Remove obsolete holidays from calendar" },

  // Roles & Permissions
  { key: PERMISSIONS.ROLES_READ, group: "Access Control", action: "READ", description: "View roles and assigned system permissions" },
  { key: PERMISSIONS.ROLES_CREATE, group: "Access Control", action: "CREATE", description: "Create new custom system access roles" },
  { key: PERMISSIONS.ROLES_UPDATE, group: "Access Control", action: "UPDATE", description: "Update role permissions and assignments" },
  { key: PERMISSIONS.ROLES_DELETE, group: "Access Control", action: "DELETE", description: "Delete custom user roles" },

  // Company
  { key: PERMISSIONS.COMPANY_READ, group: "Company", action: "READ", description: "View company profile and business details" },
  { key: PERMISSIONS.COMPANY_UPDATE, group: "Company", action: "UPDATE", description: "Edit company legal name, logo, address and tax ID" },

  // Reports
  { key: PERMISSIONS.REPORTS_READ, group: "Reports", action: "READ", description: "View workforce and payroll analytical reports" },
  { key: PERMISSIONS.REPORTS_EXPORT, group: "Reports", action: "SPECIAL", description: "Export HR analytics to CSV, Excel, and PDF" },
];

export const EMPLOYEE_DEFAULT_PERMISSIONS: PermissionKey[] = [
  PERMISSIONS.EMPLOYEES_READ,
  PERMISSIONS.DOCUMENTS_READ,
  PERMISSIONS.DOCUMENTS_CREATE,
  PERMISSIONS.ATTENDANCE_READ,
  PERMISSIONS.ATTENDANCE_CREATE,
  PERMISSIONS.LEAVE_READ,
  PERMISSIONS.LEAVE_CREATE,
];
