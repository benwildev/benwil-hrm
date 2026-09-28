import { ALL_PERMISSIONS, Role, DataScope } from "@/types/roles"
import { authService } from "@/lib/auth/auth-service"
import { employeesService } from "@/lib/services/employees-service"
import type { Employee } from "@/types/organization"
import type { EmployeeAccount } from "@/types/auth"

const ROLES_STORAGE_KEY = "benwil_hrm_roles"

export const INITIAL_ROLES: Role[] = [
  {
    id: "role_admin",
    name: "Administrator",
    description: "Full, unrestricted administrative access across the entire organization and system settings.",
    isSystem: true,
    dataScope: "all",
    permissions: ALL_PERMISSIONS.map((p) => p.id),
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-09-01T12:00:00.000Z",
  },
  {
    id: "role_hr",
    name: "HR Manager",
    description: "People operations lead with full employee lifecycle, directory, attendance, leave, and reporting management.",
    isSystem: true,
    dataScope: "all",
    permissions: [
      // Employees (all except delete)
      "employees.view",
      "employees.create",
      "employees.edit",
      "employees.deactivate",
      "employees.view_personal",
      "employees.manage_documents",
      "employees.manage_accounts",
      // Departments
      "departments.view",
      "departments.create",
      "departments.edit",
      "departments.delete",
      // Teams
      "teams.view",
      "teams.create",
      "teams.edit",
      "teams.delete",
      "teams.manage_members",
      // Designations
      "designations.view",
      "designations.create",
      "designations.edit",
      "designations.delete",
      // Attendance
      "attendance.view",
      "attendance.view_own",
      "attendance.view_team",
      "attendance.manage",
      "attendance.correct",
      "attendance.manage_rules",
      "attendance.export",
      // Leave
      "leave.view",
      "leave.apply",
      "leave.view_own",
      "leave.view_team",
      "leave.approve",
      "leave.reject",
      "leave.manage_policies",
      // Reports (no payroll report)
      "reports.view",
      "reports.export",
      "reports.view_attendance",
      "reports.view_leave",
      "reports.view_employees",
      // Settings
      "settings.view_company",
      "settings.manage_leave_policies",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-09-01T12:00:00.000Z",
  },
  {
    id: "role_manager",
    name: "Manager",
    description: "Department manager with staff oversight, team attendance monitoring, and leave approvals. No payroll access.",
    isSystem: true,
    dataScope: "department",
    permissions: [
      "employees.view",
      "employees.view_personal",
      "teams.view",
      "teams.manage_members",
      "attendance.view",
      "attendance.view_own",
      "attendance.view_team",
      "attendance.manage",
      "attendance.correct",
      "leave.view",
      "leave.apply",
      "leave.view_own",
      "leave.view_team",
      "leave.approve",
      "leave.reject",
      "reports.view",
      "reports.view_attendance",
      "reports.view_leave",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-09-01T12:00:00.000Z",
  },
  {
    id: "role_employee",
    name: "Employee",
    description: "Standard employee access strictly scoped to own personal records, attendance punches, and leave applications.",
    isSystem: true,
    dataScope: "self",
    permissions: [
      "attendance.view_own",
      "leave.apply",
      "leave.view_own",
      "payroll.view_own",
    ],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-09-01T12:00:00.000Z",
  },
  {
    id: "role_team_lead",
    name: "Team Lead",
    description: "Agile squad lead with member visibility, team attendance tracking, and leave approvals.",
    isSystem: false,
    dataScope: "team",
    permissions: [
      "employees.view",
      "teams.view",
      "teams.manage_members",
      "attendance.view",
      "attendance.view_own",
      "attendance.view_team",
      "leave.view",
      "leave.apply",
      "leave.view_own",
      "leave.view_team",
      "leave.approve",
      "leave.reject",
    ],
    createdAt: "2026-02-15T09:00:00.000Z",
    updatedAt: "2026-09-01T12:00:00.000Z",
  },
  {
    id: "role_payroll_specialist",
    name: "Payroll Specialist",
    description: "Dedicated finance specialist managing compensation, pay runs, disbursement exports, and payroll settings.",
    isSystem: false,
    dataScope: "all",
    permissions: [
      "employees.view",
      "employees.view_compensation",
      "payroll.view",
      "payroll.view_own",
      "payroll.manage",
      "payroll.approve",
      "payroll.manage_salary",
      "payroll.view_compensation",
      "payroll.export",
      "reports.view",
      "reports.export",
      "reports.view_payroll",
      "settings.view_company",
      "settings.manage_payroll_settings",
    ],
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-09-01T12:00:00.000Z",
  },
]

class RolesService {
  private getStorageItem<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch {
      return fallback
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage quota or disabled
    }
  }

  getRoles(): Role[] {
    const roles = this.getStorageItem<Role[]>(ROLES_STORAGE_KEY, INITIAL_ROLES)
    // Make sure default system roles are always present
    const existingIds = new Set(roles.map((r) => r.id))
    const missingSystemRoles = INITIAL_ROLES.filter((ir) => ir.isSystem && !existingIds.has(ir.id))
    if (missingSystemRoles.length > 0) {
      const merged = [...roles, ...missingSystemRoles]
      this.setStorageItem(ROLES_STORAGE_KEY, merged)
      return merged
    }
    return roles
  }

  getRole(id: string): Role | null {
    const roles = this.getRoles()
    return roles.find((r) => r.id === id) || null
  }

  private saveRoles(roles: Role[]): void {
    this.setStorageItem(ROLES_STORAGE_KEY, roles)
  }

  createRole(data: {
    name: string
    description: string
    dataScope: DataScope
    permissions: string[]
  }): Role {
    const roles = this.getRoles()
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: data.name.trim(),
      description: data.description.trim(),
      isSystem: false,
      dataScope: data.dataScope,
      permissions: [...data.permissions],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [...roles, newRole]
    this.saveRoles(updated)
    return newRole
  }

  updateRole(
    id: string,
    updates: Partial<{
      name: string
      description: string
      dataScope: DataScope
      permissions: string[]
    }>
  ): { success: true; role: Role } | { success: false; error: string } {
    const roles = this.getRoles()
    const index = roles.findIndex((r) => r.id === id)
    if (index === -1) {
      return { success: false, error: "Role not found." }
    }

    const current = roles[index]
    const updatedRole: Role = {
      ...current,
      name: updates.name !== undefined ? updates.name.trim() : current.name,
      description: updates.description !== undefined ? updates.description.trim() : current.description,
      dataScope: updates.dataScope !== undefined ? updates.dataScope : current.dataScope,
      permissions: updates.permissions !== undefined ? updates.permissions : current.permissions,
      updatedAt: new Date().toISOString(),
    }

    roles[index] = updatedRole
    this.saveRoles(roles)
    return { success: true, role: updatedRole }
  }

  duplicateRole(id: string, customName?: string): { success: true; role: Role } | { success: false; error: string } {
    const sourceRole = this.getRole(id)
    if (!sourceRole) {
      return { success: false, error: "Source role not found." }
    }

    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: customName?.trim() || `${sourceRole.name} (Copy)`,
      description: sourceRole.description,
      isSystem: false,
      dataScope: sourceRole.dataScope,
      permissions: [...sourceRole.permissions],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const roles = this.getRoles()
    this.saveRoles([...roles, newRole])
    return { success: true, role: newRole }
  }

  deleteRole(id: string): { success: true } | { success: false; error: string } {
    const roles = this.getRoles()
    const role = roles.find((r) => r.id === id)
    if (!role) {
      return { success: false, error: "Role not found." }
    }

    if (role.isSystem) {
      return {
        success: false,
        error: "System roles are built-in and protected. They cannot be deleted.",
      }
    }

    const assignedCount = this.getAssignedUsersCount(id)
    if (assignedCount > 0) {
      return {
        success: false,
        error: `Cannot delete "${role.name}" because it is currently assigned to ${assignedCount} employee account(s). Reassign these users to another role first.`,
      }
    }

    const filtered = roles.filter((r) => r.id !== id)
    this.saveRoles(filtered)
    return { success: true }
  }

  getAssignedUsersCount(roleId: string): number {
    return this.getAssignedAccounts(roleId).length
  }

  getAssignedAccounts(roleId: string): EmployeeAccount[] {
    const accounts = authService.getAccounts()
    return accounts.filter((acc) => {
      if (acc.roleId) {
        return acc.roleId === roleId
      }
      // Fallback matching for legacy accounts without explicit roleId
      if (roleId === "role_admin") return acc.role === "admin"
      if (roleId === "role_manager") return acc.role === "manager"
      if (roleId === "role_hr") return acc.role === "hr"
      if (roleId === "role_employee") return acc.role === "employee"
      return false
    })
  }

  getAssignedEmployees(roleId: string): { account: EmployeeAccount; employee: Employee | null }[] {
    const accounts = this.getAssignedAccounts(roleId)
    const employees = employeesService.getEmployees()
    return accounts.map((account) => {
      const employee = employees.find((e: Employee) => e.id === account.employeeId) || null
      return { account, employee }
    })
  }

  getRoleForAccount(account: EmployeeAccount | null): Role {
    if (!account) {
      return this.getRole("role_employee") || INITIAL_ROLES[3]
    }
    if (account.roleId) {
      const found = this.getRole(account.roleId)
      if (found) return found
    }
    // Fallback based on user role enum
    if (account.role === "admin") return this.getRole("role_admin") || INITIAL_ROLES[0]
    if (account.role === "hr") return this.getRole("role_hr") || INITIAL_ROLES[1]
    if (account.role === "manager") return this.getRole("role_manager") || INITIAL_ROLES[2]
    return this.getRole("role_employee") || INITIAL_ROLES[3]
  }
}

export const rolesService = new RolesService()
