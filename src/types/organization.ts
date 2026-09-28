export type EmployeeStatus =
  | "active"
  | "inactive"
  | "onboarding"
  | "probation"
  | "terminated"

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "intern"

export interface EmployeeStatusConfig {
  value: EmployeeStatus
  label: string
  description: string
}

export const EMPLOYEE_STATUSES: Record<EmployeeStatus, EmployeeStatusConfig> = {
  active: {
    value: "active",
    label: "Active",
    description: "Employee is active and in good standing",
  },
  onboarding: {
    value: "onboarding",
    label: "Onboarding",
    description: "Employee is undergoing company induction and setup",
  },
  probation: {
    value: "probation",
    label: "Probation",
    description: "Employee is serving a probation evaluation period",
  },
  inactive: {
    value: "inactive",
    label: "Inactive",
    description: "Employee is currently deactivated (record preserved)",
  },
  terminated: {
    value: "terminated",
    label: "Terminated",
    description: "Employment has been officially terminated",
  },
}

export interface EmploymentTypeConfig {
  value: EmploymentType
  label: string
  description: string
}

export const EMPLOYMENT_TYPES: Record<EmploymentType, EmploymentTypeConfig> = {
  full_time: {
    value: "full_time",
    label: "Full Time",
    description: "Permanent full-time role (standard weekly hours)",
  },
  part_time: {
    value: "part_time",
    label: "Part Time",
    description: "Scheduled part-time employment",
  },
  contract: {
    value: "contract",
    label: "Contract",
    description: "Fixed-term or independent contractor",
  },
  intern: {
    value: "intern",
    label: "Intern",
    description: "Apprenticeship or internship programme",
  },
}

export interface Department {
  id: string
  name: string
  description?: string
  managerId?: string | null // Employee ID of the department head
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  name: string
  departmentId: string
  leadId?: string | null // Employee ID of the team lead
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Designation {
  id: string
  name: string
  description?: string
  departmentId?: string | null
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  employeeCode: string // e.g. "EMP-1001"
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  avatar?: string
  departmentId: string
  teamId?: string
  designationId: string
  managerId?: string | null
  joiningDate: string // YYYY-MM-DD
  employmentType: EmploymentType
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export interface EmployeeWithRelations extends Employee {
  department?: Department | null
  team?: Team | null
  designation?: Designation | null
  manager?: Employee | null
  directReports?: Employee[]
}

export interface EmployeeFilterParams {
  search?: string
  departmentId?: string
  teamId?: string
  designationId?: string
  status?: EmployeeStatus | "all"
  employmentType?: EmploymentType | "all"
  managerId?: string
}
