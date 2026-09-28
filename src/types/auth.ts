export type UserRole = "admin" | "hr" | "manager" | "employee"

export type UserStatus = "active" | "invited" | "pending" | "suspended" | "disabled"

export type AccountStatus = "active" | "invited" | "pending" | "suspended" | "disabled"

export interface EmployeeAccount {
  id: string
  employeeId: string
  email: string
  role: UserRole
  roleId?: string
  status: AccountStatus
  mustChangePassword: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PasswordState {
  hasTemporaryPassword: boolean
  mustChangePassword: boolean
  lastChangedAt?: string | null
}

export interface CreateEmployeeAccountPayload {
  employeeId: string
  name: string
  email: string
  passwordOption: "generate" | "manual"
  manualPassword?: string
  role?: UserRole
  roleId?: string
}

export interface User {
  id: string
  employeeId?: string | null
  name: string
  email: string
  avatar?: string
  role: UserRole
  roleId?: string
  companyId: string | null
  status: UserStatus
  accountStatus?: AccountStatus
  mustChangePassword?: boolean
  lastLoginAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  logo?: string
  industry: string
  country: string
  timezone: string
  currency: string
  contactEmail: string
  phone: string
  address: string
  setupCompleted: boolean
  createdAt: string
  updatedAt: string
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export interface WorkSchedule {
  id: string
  companyId: string
  workingDays: DayOfWeek[]
  startTime: string // "09:00"
  endTime: string // "18:00"
  breakStart: string // "13:00"
  breakEnd: string // "14:00"
  breakDuration: number // minutes, e.g. 60
  updatedAt: string
}

export interface ActiveSession {
  id: string
  device: string
  browser: string
  location: string
  ipAddress: string
  isCurrent: boolean
  lastActive: string
}

export interface AuthSession {
  user: User
  company: Company | null
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface CompanySetupPayload {
  name: string
  industry: string
  country: string
  timezone: string
  currency: string
  workingDays: DayOfWeek[]
  startTime: string
  endTime: string
  breakDuration: number
}
