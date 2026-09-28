import type {
  AccountStatus,
  ActiveSession,
  AuthSession,
  Company,
  CompanySetupPayload,
  CreateEmployeeAccountPayload,
  EmployeeAccount,
  LoginCredentials,
  User,
  UserRole,
  WorkSchedule,
} from "@/types/auth"

const SESSION_STORAGE_KEY = "benwil_hrm_session"
const COMPANY_STORAGE_KEY = "benwil_hrm_company"
const SCHEDULE_STORAGE_KEY = "benwil_hrm_schedule"
const SESSIONS_STORAGE_KEY = "benwil_hrm_sessions"
const ACCOUNTS_STORAGE_KEY = "benwil_hrm_accounts"
const CREDENTIALS_STORAGE_KEY = "benwil_hrm_credentials"
const COOKIE_NAME = "benwil_auth_session"

// Default mock seed data
const DEFAULT_COMPANY: Company = {
  id: "comp_benwil_01",
  name: "Benwil Technologies HQ",
  logo: "/logo.svg",
  industry: "Information Technology & Software",
  country: "United States",
  timezone: "America/New_York (EST, UTC-5)",
  currency: "USD ($)",
  contactEmail: "admin@benwilhrm.com",
  phone: "+1 (555) 234-5678",
  address: "100 Innovation Way, Suite 400, New York, NY 10001",
  setupCompleted: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-09-01T12:00:00.000Z",
}

const DEFAULT_SCHEDULE: WorkSchedule = {
  id: "sched_01",
  companyId: "comp_benwil_01",
  workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  startTime: "09:00",
  endTime: "18:00",
  breakStart: "13:00",
  breakEnd: "14:00",
  breakDuration: 60,
  updatedAt: "2026-09-01T12:00:00.000Z",
}

const DEFAULT_USER: User = {
  id: "usr_admin_01",
  employeeId: "emp_admin_01",
  name: "Amara Whitfield",
  email: "admin@benwilhrm.com",
  avatar: "",
  role: "admin",
  roleId: "role_admin",
  companyId: "comp_benwil_01",
  status: "active",
  accountStatus: "active",
  mustChangePassword: false,
  lastLoginAt: "2026-09-09T08:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-09-01T12:00:00.000Z",
}

// Initial mock accounts reflecting required test personas
export const INITIAL_ACCOUNTS: EmployeeAccount[] = [
  {
    id: "acc_admin_01",
    employeeId: "emp_admin_01",
    email: "admin@benwilhrm.com",
    role: "admin",
    roleId: "role_admin",
    status: "active",
    mustChangePassword: false,
    lastLoginAt: "2026-09-09T08:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-09-01T12:00:00.000Z",
  },
  {
    id: "acc_emp_01",
    employeeId: "emp_01",
    email: "sarah.chen@benwilhrm.com",
    role: "manager",
    roleId: "role_manager",
    status: "active",
    mustChangePassword: false,
    lastLoginAt: "2026-09-08T16:30:00.000Z",
    createdAt: "2024-03-15T09:00:00.000Z",
    updatedAt: "2026-01-01T12:00:00.000Z",
  },
  {
    id: "acc_emp_02",
    employeeId: "emp_02",
    email: "rahim.ahmed@benwilhrm.com",
    role: "manager",
    roleId: "role_manager",
    status: "active",
    mustChangePassword: false,
    lastLoginAt: "2026-09-09T09:04:00.000Z",
    createdAt: "2024-05-01T09:00:00.000Z",
    updatedAt: "2026-01-01T12:00:00.000Z",
  },
  {
    id: "acc_emp_03",
    employeeId: "emp_03",
    email: "david.kim@benwilhrm.com",
    role: "employee",
    roleId: "role_employee",
    status: "pending",
    mustChangePassword: true,
    lastLoginAt: null,
    createdAt: "2024-07-15T09:00:00.000Z",
    updatedAt: "2026-01-01T12:00:00.000Z",
  },
  {
    id: "acc_emp_04",
    employeeId: "emp_04",
    email: "hasan.khan@benwilhrm.com",
    role: "employee",
    roleId: "role_employee",
    status: "disabled",
    mustChangePassword: false,
    lastLoginAt: "2026-08-15T11:20:00.000Z",
    createdAt: "2026-01-10T09:00:00.000Z",
    updatedAt: "2026-01-10T09:00:00.000Z",
  },
]

// Isolated mock credentials store (passwords are NOT stored in Employee HR records)
const INITIAL_CREDENTIALS: Record<string, string> = {
  "admin@benwilhrm.com": "password123",
  "amara@benwilhrm.com": "password123",
  "newadmin@benwilhrm.com": "password123",
  "sarah.chen@benwilhrm.com": "password123",
  "rahim.ahmed@benwilhrm.com": "password123",
  "david.kim@benwilhrm.com": "password123",
  "hasan.khan@benwilhrm.com": "password123",
}

const DEFAULT_SESSIONS: ActiveSession[] = [
  {
    id: "sess_01",
    device: "MacBook Pro 16”",
    browser: "Chrome 128 · macOS",
    location: "New York, US",
    ipAddress: "192.168.1.104",
    isCurrent: true,
    lastActive: "Active now",
  },
  {
    id: "sess_02",
    device: "iPhone 15 Pro",
    browser: "Mobile Safari 18 · iOS",
    location: "New York, US",
    ipAddress: "172.56.21.89",
    isCurrent: false,
    lastActive: "2 hours ago",
  },
]

export function generateTemporaryPassword(): string {
  const prefixes = ["Benwil", "Orion", "Apex", "Nexus", "Summit", "Horizon"]
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const num = Math.floor(1000 + Math.random() * 9000)
  const symbols = ["!", "@", "#", "$", "*"]
  const sym = symbols[Math.floor(Math.random() * symbols.length)]
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"
  const suffix = Array.from({ length: 3 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
  return `${prefix}#${num}${sym}${suffix}`
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`
}

export type AuthResult =
  | { success: true; session: AuthSession; isNewSetup?: boolean }
  | {
      success: false
      error:
        | "invalid_credentials"
        | "account_disabled"
        | "invalid_email"
        | "server_error"
      message: string
    }

class AuthService {
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

  // --- ACCOUNTS & CREDENTIALS STORAGE ---

  getAccounts(): EmployeeAccount[] {
    return this.getStorageItem<EmployeeAccount[]>(ACCOUNTS_STORAGE_KEY, INITIAL_ACCOUNTS)
  }

  private saveAccounts(accounts: EmployeeAccount[]): void {
    this.setStorageItem(ACCOUNTS_STORAGE_KEY, accounts)
  }

  private getCredentials(): Record<string, string> {
    return this.getStorageItem<Record<string, string>>(CREDENTIALS_STORAGE_KEY, INITIAL_CREDENTIALS)
  }

  private saveCredentials(credentials: Record<string, string>): void {
    this.setStorageItem(CREDENTIALS_STORAGE_KEY, credentials)
  }

  getAccountByEmployeeId(employeeId: string): EmployeeAccount | null {
    const accounts = this.getAccounts()
    return accounts.find((a) => a.employeeId === employeeId) || null
  }

  getAccountByEmail(email: string): EmployeeAccount | null {
    const accounts = this.getAccounts()
    return accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase()) || null
  }

  hasLoginAccount(employeeId: string): boolean {
    return Boolean(this.getAccountByEmployeeId(employeeId))
  }

  getAccountStatus(employeeId: string): AccountStatus | null {
    const account = this.getAccountByEmployeeId(employeeId)
    return account ? account.status : null
  }

  isLoginEmailAvailable(email: string, excludeAccountId?: string): boolean {
    const cleanEmail = email.trim().toLowerCase()
    const accounts = this.getAccounts()
    return !accounts.some(
      (a) => a.email.toLowerCase() === cleanEmail && a.id !== excludeAccountId
    )
  }

  createEmployeeAccount(payload: CreateEmployeeAccountPayload): {
    success: true
    account: EmployeeAccount
    temporaryPassword: string
  } | {
    success: false
    error: string
  } {
    const email = payload.email.trim().toLowerCase()
    if (!email || !email.includes("@")) {
      return { success: false, error: "A valid login email address is required." }
    }

    if (!this.isLoginEmailAvailable(email)) {
      return { success: false, error: "An account with this email already exists." }
    }

    const accounts = this.getAccounts()
    if (accounts.some((a) => a.employeeId === payload.employeeId)) {
      return { success: false, error: "This employee already has a login account." }
    }

    const temporaryPassword =
      payload.passwordOption === "manual" && payload.manualPassword?.trim()
        ? payload.manualPassword.trim()
        : generateTemporaryPassword()

    if (temporaryPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." }
    }

    const roleId =
      payload.roleId ||
      (payload.role === "admin"
        ? "role_admin"
        : payload.role === "manager"
        ? "role_manager"
        : payload.role === "hr"
        ? "role_hr"
        : "role_employee")
    const role: UserRole =
      payload.role ||
      (roleId === "role_admin"
        ? "admin"
        : roleId === "role_manager" || roleId === "role_team_lead"
        ? "manager"
        : roleId === "role_hr"
        ? "hr"
        : "employee")

    const newAccount: EmployeeAccount = {
      id: `acc_${Date.now()}`,
      employeeId: payload.employeeId,
      email,
      role,
      roleId,
      status: "pending",
      mustChangePassword: true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const credentials = this.getCredentials()
    credentials[email] = temporaryPassword
    this.saveCredentials(credentials)

    const updatedAccounts = [...accounts, newAccount]
    this.saveAccounts(updatedAccounts)

    return {
      success: true,
      account: newAccount,
      temporaryPassword,
    }
  }

  updateEmployeeAccountRole(
    employeeId: string,
    newRoleId: string
  ): { success: true; account: EmployeeAccount } | { success: false; error: string } {
    const accounts = this.getAccounts()
    const account = accounts.find((a) => a.employeeId === employeeId)
    if (!account) {
      return { success: false, error: "Account not found." }
    }

    const currentIsAdmin = account.role === "admin" || account.roleId === "role_admin"
    const targetIsAdmin = newRoleId === "role_admin"

    // Single active admin protection: cannot downgrade the only active administrator
    if (currentIsAdmin && !targetIsAdmin && account.status === "active") {
      const activeAdmins = accounts.filter(
        (a) => (a.role === "admin" || a.roleId === "role_admin") && a.status === "active"
      )
      if (activeAdmins.length <= 1) {
        return {
          success: false,
          error: "You cannot remove administrator privileges from the only active administrator account.",
        }
      }
    }

    const newRole: UserRole =
      newRoleId === "role_admin"
        ? "admin"
        : newRoleId === "role_manager" || newRoleId === "role_team_lead"
        ? "manager"
        : newRoleId === "role_hr"
        ? "hr"
        : "employee"

    account.roleId = newRoleId
    account.role = newRole
    account.updatedAt = new Date().toISOString()
    this.saveAccounts(accounts)

    // Update active session if target is logged in
    const currentSession = this.getCurrentSession()
    if (
      currentSession &&
      (currentSession.user.id === account.id ||
        currentSession.user.email.toLowerCase() === account.email.toLowerCase() ||
        currentSession.user.employeeId === employeeId)
    ) {
      currentSession.user.roleId = newRoleId
      currentSession.user.role = newRole
      this.saveSession(currentSession)
    }

    return { success: true, account }
  }

  disableEmployeeAccount(employeeId: string): { success: true } | { success: false; error: string } {
    const accounts = this.getAccounts()
    const account = accounts.find((a) => a.employeeId === employeeId)
    if (!account) {
      return { success: false, error: "Account not found." }
    }

    // Single active admin protection
    if (account.role === "admin") {
      const activeAdmins = accounts.filter((a) => a.role === "admin" && a.status === "active")
      if (activeAdmins.length <= 1 && account.status === "active") {
        return {
          success: false,
          error: "You cannot disable the only active administrator account.",
        }
      }
    }

    account.status = "disabled"
    account.updatedAt = new Date().toISOString()
    this.saveAccounts(accounts)

    // Check if current session belongs to this account
    const currentSession = this.getCurrentSession()
    if (
      currentSession &&
      (currentSession.user.id === account.id ||
        currentSession.user.email.toLowerCase() === account.email.toLowerCase() ||
        currentSession.user.employeeId === employeeId)
    ) {
      currentSession.user.status = "disabled"
      currentSession.user.accountStatus = "disabled"
      this.saveSession(currentSession)
    }

    return { success: true }
  }

  enableEmployeeAccount(employeeId: string): { success: true } | { success: false; error: string } {
    const accounts = this.getAccounts()
    const account = accounts.find((a) => a.employeeId === employeeId)
    if (!account) {
      return { success: false, error: "Account not found." }
    }

    account.status = account.mustChangePassword ? "pending" : "active"
    account.updatedAt = new Date().toISOString()
    this.saveAccounts(accounts)
    return { success: true }
  }

  resetEmployeePassword(employeeId: string): {
    success: true
    temporaryPassword: string
  } | {
    success: false
    error: string
  } {
    const accounts = this.getAccounts()
    const account = accounts.find((a) => a.employeeId === employeeId)
    if (!account) {
      return { success: false, error: "Account not found." }
    }

    const temporaryPassword = generateTemporaryPassword()
    const credentials = this.getCredentials()
    credentials[account.email.toLowerCase()] = temporaryPassword
    this.saveCredentials(credentials)

    account.mustChangePassword = true
    if (account.status !== "disabled") {
      account.status = "pending"
    }
    account.updatedAt = new Date().toISOString()
    this.saveAccounts(accounts)

    return { success: true, temporaryPassword }
  }

  async changePassword(
    userId: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: "Password must be at least 8 characters long." }
    }

    const accounts = this.getAccounts()
    const currentSession = this.getCurrentSession()

    // Find target account by user ID, employee ID, or session email
    const account = accounts.find(
      (a) =>
        a.id === userId ||
        a.employeeId === userId ||
        (currentSession && a.email.toLowerCase() === currentSession.user.email.toLowerCase())
    )

    const email = account ? account.email.toLowerCase() : currentSession?.user.email.toLowerCase()

    if (account) {
      account.mustChangePassword = false
      if (account.status === "pending") {
        account.status = "active"
      }
      account.updatedAt = new Date().toISOString()
      this.saveAccounts(accounts)
    }

    if (email) {
      const credentials = this.getCredentials()
      credentials[email] = newPassword
      this.saveCredentials(credentials)
    }

    // Update active session state
    if (currentSession) {
      currentSession.user.mustChangePassword = false
      if (currentSession.user.accountStatus === "pending") {
        currentSession.user.accountStatus = "active"
      }
      this.saveSession(currentSession)
    }

    return { success: true, message: "Password updated successfully." }
  }

  updateLoginEmail(
    employeeId: string,
    newEmail: string
  ): { success: true; email: string } | { success: false; error: string } {
    const email = newEmail.trim().toLowerCase()
    if (!email || !email.includes("@")) {
      return { success: false, error: "A valid email address is required." }
    }

    const accounts = this.getAccounts()
    const account = accounts.find((a) => a.employeeId === employeeId)
    if (!account) {
      return { success: false, error: "Account not found." }
    }

    if (!this.isLoginEmailAvailable(email, account.id)) {
      return { success: false, error: "An account with this email already exists." }
    }

    const oldEmail = account.email.toLowerCase()
    account.email = email
    account.updatedAt = new Date().toISOString()
    this.saveAccounts(accounts)

    const credentials = this.getCredentials()
    if (credentials[oldEmail]) {
      credentials[email] = credentials[oldEmail]
      delete credentials[oldEmail]
      this.saveCredentials(credentials)
    }

    return { success: true, email }
  }

  validateCurrentSession(): { isValid: boolean; error?: string } {
    const session = this.getCurrentSession()
    if (!session) return { isValid: false }

    const accounts = this.getAccounts()
    const account = accounts.find(
      (a) =>
        a.id === session.user.id ||
        a.email.toLowerCase() === session.user.email.toLowerCase() ||
        (session.user.employeeId && a.employeeId === session.user.employeeId)
    )

    if (account && account.status === "disabled") {
      this.signOut()
      return {
        isValid: false,
        error: "Your account has been disabled. Please contact your administrator.",
      }
    }

    return { isValid: true }
  }

  // --- SESSIONS & BASE AUTH ---

  getCurrentSession(): AuthSession | null {
    if (typeof window === "undefined") return null
    return this.getStorageItem<AuthSession | null>(SESSION_STORAGE_KEY, null)
  }

  getCompany(): Company | null {
    return this.getStorageItem<Company | null>(COMPANY_STORAGE_KEY, DEFAULT_COMPANY)
  }

  getSchedule(): WorkSchedule {
    return this.getStorageItem<WorkSchedule>(SCHEDULE_STORAGE_KEY, DEFAULT_SCHEDULE)
  }

  getActiveSessions(): ActiveSession[] {
    return this.getStorageItem<ActiveSession[]>(SESSIONS_STORAGE_KEY, DEFAULT_SESSIONS)
  }

  async signIn(credentials: LoginCredentials): Promise<AuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const email = credentials.email.trim().toLowerCase()
    const password = credentials.password

    // Format validation
    if (!email || !email.includes("@")) {
      return {
        success: false,
        error: "invalid_email",
        message: "Please enter a valid work email address.",
      }
    }

    // Special test case: account disabled
    if (email === "disabled@benwilhrm.com") {
      return {
        success: false,
        error: "account_disabled",
        message: "This account has been disabled. Please contact your organization administrator.",
      }
    }

    // Special test case: server error
    if (email === "error@benwilhrm.com") {
      return {
        success: false,
        error: "server_error",
        message: "Unable to connect to authentication services. Please try again later.",
      }
    }

    // 1. Check Accounts Store
    const accounts = this.getAccounts()
    const account = accounts.find((a) => a.email.toLowerCase() === email)
    const creds = this.getCredentials()

    if (account) {
      if (account.status === "disabled") {
        return {
          success: false,
          error: "account_disabled",
          message: "This account has been disabled. Please contact your organization administrator.",
        }
      }

      const expectedPassword = creds[email] || "password123"
      if (password !== expectedPassword) {
        return {
          success: false,
          error: "invalid_credentials",
          message: "Incorrect email or password. Please try again.",
        }
      }

      // Update lastLoginAt
      account.lastLoginAt = new Date().toISOString()
      account.updatedAt = new Date().toISOString()
      this.saveAccounts(accounts)

      // Lookup employee for full name and avatar
      interface SimpleEmployee {
        id: string
        fullName: string
        avatar?: string
      }
      const employees = this.getStorageItem<SimpleEmployee[]>("benwil_hrm_employees", [])
      const emp = employees.find((e) => e.id === account.employeeId)

      const company = this.getCompany()
      const user: User = {
        id: account.id,
        employeeId: account.employeeId,
        name: emp ? emp.fullName : (account.role === "admin" ? "Amara Whitfield" : email.split("@")[0].replace(".", " ")),
        email: account.email,
        avatar: emp?.avatar || "",
        role: account.role,
        roleId:
          account.roleId ||
          (account.role === "admin"
            ? "role_admin"
            : account.role === "manager"
            ? "role_manager"
            : account.role === "hr"
            ? "role_hr"
            : "role_employee"),
        companyId: company?.id ?? null,
        status: "active",
        accountStatus: account.status,
        mustChangePassword: account.mustChangePassword,
        lastLoginAt: account.lastLoginAt,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      }

      const session: AuthSession = {
        user,
        company,
        token: `mock_jwt_${Date.now()}`,
      }

      this.saveSession(session)
      return { success: true, session, isNewSetup: !company?.setupCompleted }
    }

    // 2. Case: First-time admin onboarding (setup incomplete)
    if (email === "newadmin@benwilhrm.com") {
      if (password !== "password123") {
        return {
          success: false,
          error: "invalid_credentials",
          message: "Incorrect email or password. Please try again.",
        }
      }

      const newUser: User = {
        id: "usr_new_02",
        employeeId: null,
        name: "Marcus Sterling",
        email: "newadmin@benwilhrm.com",
        role: "admin",
        roleId: "role_admin",
        companyId: null,
        status: "active",
        accountStatus: "active",
        mustChangePassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const session: AuthSession = {
        user: newUser,
        company: null,
        token: `mock_jwt_${Date.now()}`,
      }

      this.saveSession(session)
      return { success: true, session, isNewSetup: true }
    }

    // 3. Fallback for demo mode
    if (password === "password123") {
      const company = this.getCompany()
      const genericUser: User = {
        id: `usr_${Date.now()}`,
        employeeId: null,
        name: email.split("@")[0].replace(".", " "),
        email,
        role: "admin",
        roleId: "role_admin",
        companyId: company?.id ?? null,
        status: "active",
        accountStatus: "active",
        mustChangePassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const session: AuthSession = {
        user: genericUser,
        company,
        token: `mock_jwt_${Date.now()}`,
      }

      this.saveSession(session)
      return { success: true, session, isNewSetup: !company?.setupCompleted }
    }

    return {
      success: false,
      error: "invalid_credentials",
      message: "Incorrect email or password. Please try again.",
    }
  }

  async signOut(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      removeCookie(COOKIE_NAME)
    }
  }

  saveSession(session: AuthSession): void {
    this.setStorageItem(SESSION_STORAGE_KEY, session)
    const cookieData = JSON.stringify({
      token: session.token,
      setupCompleted: Boolean(session.company?.setupCompleted),
      mustChangePassword: Boolean(session.user?.mustChangePassword),
    })
    setCookie(COOKIE_NAME, cookieData, 7)
  }

  async sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    void email
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      success: true,
      message: "If an account exists for this email, we've sent instructions to reset your password.",
    }
  }

  async resetPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600))
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters long.",
      }
    }
    return {
      success: true,
      message: "Password updated successfully. You can now sign in.",
    }
  }

  async completeCompanySetup(payload: CompanySetupPayload): Promise<Company> {
    await new Promise((resolve) => setTimeout(resolve, 700))

    const newCompany: Company = {
      id: `comp_${Date.now()}`,
      name: payload.name,
      industry: payload.industry,
      country: payload.country,
      timezone: payload.timezone,
      currency: payload.currency,
      contactEmail: DEFAULT_USER.email,
      phone: "+1 (555) 019-2831",
      address: "Headquarters Office",
      setupCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newSchedule: WorkSchedule = {
      id: `sched_${Date.now()}`,
      companyId: newCompany.id,
      workingDays: payload.workingDays,
      startTime: payload.startTime,
      endTime: payload.endTime,
      breakStart: "13:00",
      breakEnd: "14:00",
      breakDuration: payload.breakDuration,
      updatedAt: new Date().toISOString(),
    }

    this.setStorageItem(COMPANY_STORAGE_KEY, newCompany)
    this.setStorageItem(SCHEDULE_STORAGE_KEY, newSchedule)

    const currentSession = this.getCurrentSession()
    if (currentSession) {
      const updatedSession: AuthSession = {
        ...currentSession,
        company: newCompany,
        user: {
          ...currentSession.user,
          companyId: newCompany.id,
        },
      }
      this.saveSession(updatedSession)
    }

    return newCompany
  }

  async updateCompany(updatedData: Partial<Company>): Promise<Company> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const current = this.getCompany() ?? DEFAULT_COMPANY
    const merged: Company = {
      ...current,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    }
    this.setStorageItem(COMPANY_STORAGE_KEY, merged)

    const currentSession = this.getCurrentSession()
    if (currentSession) {
      this.saveSession({
        ...currentSession,
        company: merged,
      })
    }

    return merged
  }

  async updateWorkSchedule(updatedSchedule: Partial<WorkSchedule>): Promise<WorkSchedule> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const current = this.getSchedule()
    const merged: WorkSchedule = {
      ...current,
      ...updatedSchedule,
      updatedAt: new Date().toISOString(),
    }
    this.setStorageItem(SCHEDULE_STORAGE_KEY, merged)
    return merged
  }

  async updateAccount(updatedData: Partial<User>): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const session = this.getCurrentSession()
    const current = session?.user ?? DEFAULT_USER
    const merged: User = {
      ...current,
      ...updatedData,
      updatedAt: new Date().toISOString(),
    }

    if (session) {
      this.saveSession({
        ...session,
        user: merged,
      })
    }

    return merged
  }

  async revokeOtherSessions(): Promise<ActiveSession[]> {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const currentSessions = this.getActiveSessions()
    const filtered = currentSessions.filter((s) => s.isCurrent)
    this.setStorageItem(SESSIONS_STORAGE_KEY, filtered)
    return filtered
  }
}

export const authService = new AuthService()
