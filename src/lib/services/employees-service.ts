import type {
  Employee,
  EmployeeFilterParams,
  EmployeeStatus,
  EmploymentType,
  EmployeeWithRelations,
} from "@/types/organization"
import { authService } from "@/lib/auth/auth-service"
import { departmentsService } from "./departments-service"
import { designationsService } from "./designations-service"
import { INITIAL_EMPLOYEES } from "./seed-data"
import { teamsService } from "./teams-service"

const STORAGE_KEY = "benwil_hrm_employees"

class EmployeesService {
  private getStorage(): Employee[] {
    if (typeof window === "undefined") return INITIAL_EMPLOYEES
    try {
      const item = localStorage.getItem(STORAGE_KEY)
      if (!item) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES))
        return INITIAL_EMPLOYEES
      }
      return JSON.parse(item)
    } catch {
      return INITIAL_EMPLOYEES
    }
  }

  private setStorage(employees: Employee[]): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees))
    } catch {
      // Storage error
    }
  }

  getEmployees(filters?: EmployeeFilterParams): Employee[] {
    let list = this.getStorage()

    if (!filters) return list

    if (filters.search) {
      const query = filters.search.trim().toLowerCase()
      list = list.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.employeeCode.toLowerCase().includes(query) ||
          emp.phone.toLowerCase().includes(query)
      )
    }

    if (filters.departmentId && filters.departmentId !== "all") {
      list = list.filter((emp) => emp.departmentId === filters.departmentId)
    }

    if (filters.teamId && filters.teamId !== "all") {
      list = list.filter((emp) => emp.teamId === filters.teamId)
    }

    if (filters.designationId && filters.designationId !== "all") {
      list = list.filter((emp) => emp.designationId === filters.designationId)
    }

    if (filters.status && filters.status !== "all") {
      list = list.filter((emp) => emp.status === filters.status)
    }

    if (filters.employmentType && filters.employmentType !== "all") {
      list = list.filter((emp) => emp.employmentType === filters.employmentType)
    }

    if (filters.managerId && filters.managerId !== "all") {
      list = list.filter((emp) => emp.managerId === filters.managerId)
    }

    return list
  }

  getEmployee(id: string): Employee | null {
    return this.getStorage().find((e) => e.id === id) || null
  }

  getEmployeeWithRelations(id: string): EmployeeWithRelations | null {
    const employee = this.getEmployee(id)
    if (!employee) return null

    const allEmployees = this.getStorage()
    const department = departmentsService.getDepartment(employee.departmentId)
    const team = employee.teamId ? teamsService.getTeam(employee.teamId) : null
    const designation = designationsService.getDesignation(employee.designationId)
    const manager = employee.managerId ? this.getEmployee(employee.managerId) : null
    const directReports = allEmployees.filter((e) => e.managerId === id)

    return {
      ...employee,
      department,
      team,
      designation,
      manager,
      directReports,
    }
  }

  getPossibleManagers(excludeEmployeeId?: string): Employee[] {
    const all = this.getStorage().filter((e) => e.status !== "terminated")
    if (!excludeEmployeeId) return all

    // Exclude self and direct reports to prevent immediate circular relationships
    const directReports = all.filter((e) => e.managerId === excludeEmployeeId).map((e) => e.id)
    const excludeIds = new Set([excludeEmployeeId, ...directReports])

    return all.filter((e) => !excludeIds.has(e.id))
  }

  createEmployee(payload: {
    firstName: string
    lastName: string
    email: string
    phone: string
    employeeCode: string
    departmentId: string
    teamId?: string | null
    designationId: string
    managerId?: string | null
    joiningDate: string
    employmentType: EmploymentType
    status: EmployeeStatus
    avatar?: string
  }): { success: true; data: Employee } | { success: false; error: string } {
    const firstName = payload.firstName.trim()
    const lastName = payload.lastName.trim()
    const email = payload.email.trim().toLowerCase()
    const employeeCode = payload.employeeCode.trim().toUpperCase()

    if (!firstName || !lastName) {
      return { success: false, error: "First and last name are required." }
    }
    if (!email || !email.includes("@")) {
      return { success: false, error: "A valid email address is required." }
    }
    if (!employeeCode) {
      return { success: false, error: "Employee ID / Code is required." }
    }
    if (!payload.departmentId) {
      return { success: false, error: "Department assignment is required." }
    }
    if (!payload.designationId) {
      return { success: false, error: "Designation is required." }
    }
    if (!payload.joiningDate) {
      return { success: false, error: "Joining date is required." }
    }

    const employees = this.getStorage()

    // Unique email check
    if (employees.some((e) => e.email.toLowerCase() === email)) {
      return { success: false, error: `An employee with email "${email}" already exists.` }
    }

    // Unique employee code check
    if (employees.some((e) => e.employeeCode.toUpperCase() === employeeCode)) {
      return {
        success: false,
        error: `Employee ID "${employeeCode}" is already in use.`,
      }
    }

    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      employeeCode,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      phone: payload.phone.trim() || "+1 (555) 000-0000",
      avatar:
        payload.avatar?.trim() ||
        `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      departmentId: payload.departmentId,
      teamId: payload.teamId || undefined,
      designationId: payload.designationId,
      managerId: payload.managerId || null,
      joiningDate: payload.joiningDate,
      employmentType: payload.employmentType,
      status: payload.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updated = [newEmployee, ...employees]
    this.setStorage(updated)
    return { success: true, data: newEmployee }
  }

  updateEmployee(
    id: string,
    payload: {
      firstName?: string
      lastName?: string
      email?: string
      phone?: string
      employeeCode?: string
      departmentId?: string
      teamId?: string | null
      designationId?: string
      managerId?: string | null
      joiningDate?: string
      employmentType?: EmploymentType
      status?: EmployeeStatus
      avatar?: string
    }
  ): { success: true; data: Employee } | { success: false; error: string } {
    const employees = this.getStorage()
    const index = employees.findIndex((e) => e.id === id)
    if (index === -1) {
      return { success: false, error: "Employee not found." }
    }

    const current = employees[index]
    const firstName = payload.firstName !== undefined ? payload.firstName.trim() : current.firstName
    const lastName = payload.lastName !== undefined ? payload.lastName.trim() : current.lastName
    const email = payload.email !== undefined ? payload.email.trim().toLowerCase() : current.email
    const employeeCode =
      payload.employeeCode !== undefined
        ? payload.employeeCode.trim().toUpperCase()
        : current.employeeCode

    if (!firstName || !lastName) {
      return { success: false, error: "First and last name cannot be empty." }
    }
    if (!email || !email.includes("@")) {
      return { success: false, error: "A valid email address is required." }
    }
    if (!employeeCode) {
      return { success: false, error: "Employee ID cannot be empty." }
    }

    // Check duplicate email
    if (employees.some((e) => e.id !== id && e.email.toLowerCase() === email)) {
      return { success: false, error: `An employee with email "${email}" already exists.` }
    }

    // Check duplicate code
    if (employees.some((e) => e.id !== id && e.employeeCode.toUpperCase() === employeeCode)) {
      return {
        success: false,
        error: `Employee ID "${employeeCode}" is already in use.`,
      }
    }

    // Prevent self manager
    const managerId = payload.managerId !== undefined ? payload.managerId : current.managerId
    if (managerId && managerId === id) {
      return { success: false, error: "An employee cannot be their own manager." }
    }

    // Check circular manager relationship (direct)
    if (managerId) {
      const manager = employees.find((e) => e.id === managerId)
      if (manager && manager.managerId === id) {
        return {
          success: false,
          error: `Circular hierarchy detected: ${manager.fullName} currently reports to this employee.`,
        }
      }
    }

    const updatedEmployee: Employee = {
      ...current,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email,
      phone: payload.phone !== undefined ? payload.phone.trim() : current.phone,
      employeeCode,
      avatar: payload.avatar !== undefined ? payload.avatar.trim() : current.avatar,
      departmentId: payload.departmentId || current.departmentId,
      teamId: payload.teamId !== undefined ? payload.teamId || undefined : current.teamId,
      designationId: payload.designationId || current.designationId,
      managerId,
      joiningDate: payload.joiningDate || current.joiningDate,
      employmentType: payload.employmentType || current.employmentType,
      status: payload.status || current.status,
      updatedAt: new Date().toISOString(),
    }

    employees[index] = updatedEmployee
    this.setStorage(employees)
    return { success: true, data: updatedEmployee }
  }

  deactivateEmployee(id: string): { success: true } | { success: false; error: string } {
    const employees = this.getStorage()
    const index = employees.findIndex((e) => e.id === id)
    if (index === -1) {
      return { success: false, error: "Employee not found." }
    }

    employees[index] = {
      ...employees[index],
      status: "inactive",
      updatedAt: new Date().toISOString(),
    }
    this.setStorage(employees)

    // Synchronously disable associated login account without deleting historical records
    authService.disableEmployeeAccount(id)

    return { success: true }
  }

  deleteEmployee(id: string): { success: true } | { success: false; error: string } {
    const employees = this.getStorage()
    const exists = employees.some((e) => e.id === id)
    if (!exists) {
      return { success: false, error: "Employee not found." }
    }

    // Clean up manager references if any employee had this person as manager
    const filtered = employees
      .filter((e) => e.id !== id)
      .map((e) => (e.managerId === id ? { ...e, managerId: null } : e))

    this.setStorage(filtered)
    return { success: true }
  }

  getOrganizationTree() {
    const departments = departmentsService.getDepartments()
    const teams = teamsService.getTeams()
    const employees = this.getStorage()

    return departments.map((dept) => {
      const deptManager = dept.managerId ? this.getEmployee(dept.managerId) : null
      const deptTeams = teams.filter((t) => t.departmentId === dept.id)
      const deptEmployees = employees.filter((e) => e.departmentId === dept.id)

      const teamsData = deptTeams.map((team) => {
        const teamLead = team.leadId ? this.getEmployee(team.leadId) : null
        const teamMembers = employees.filter((e) => e.teamId === team.id)
        return {
          team,
          lead: teamLead,
          members: teamMembers,
        }
      })

      // Employees in department without specific team assigned
      const unassignedToTeam = deptEmployees.filter((e) => !e.teamId)

      return {
        department: dept,
        manager: deptManager,
        totalEmployees: deptEmployees.length,
        teams: teamsData,
        unassignedEmployees: unassignedToTeam,
      }
    })
  }
}

export const employeesService = new EmployeesService()
