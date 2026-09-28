"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { authService, type AuthResult } from "@/lib/auth/auth-service"
import type {
  ActiveSession,
  Company,
  CompanySetupPayload,
  LoginCredentials,
  User,
  WorkSchedule,
} from "@/types/auth"

interface AuthContextType {
  user: User | null
  company: Company | null
  schedule: WorkSchedule | null
  sessions: ActiveSession[]
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (credentials: LoginCredentials) => Promise<AuthResult>
  signOut: () => Promise<void>
  completeCompanySetup: (payload: CompanySetupPayload) => Promise<Company>
  updateCompany: (payload: Partial<Company>) => Promise<Company>
  updateSchedule: (payload: Partial<WorkSchedule>) => Promise<WorkSchedule>
  updateAccount: (payload: Partial<User>) => Promise<User>
  revokeOtherSessions: () => Promise<void>
  changePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [user, setUser] = React.useState<User | null>(() => {
    if (typeof window === "undefined") return null
    const session = authService.getCurrentSession()
    return session?.user ?? null
  })

  const [company, setCompany] = React.useState<Company | null>(() => {
    if (typeof window === "undefined") return null
    const session = authService.getCurrentSession()
    return session?.company ?? null
  })

  const [schedule, setSchedule] = React.useState<WorkSchedule | null>(() => {
    if (typeof window === "undefined") return null
    return authService.getSchedule()
  })

  const [sessions, setSessions] = React.useState<ActiveSession[]>(() => {
    if (typeof window === "undefined") return []
    return authService.getActiveSessions()
  })

  const [isLoading] = React.useState(false)

  const signIn = React.useCallback(
    async (credentials: LoginCredentials): Promise<AuthResult> => {
      const result = await authService.signIn(credentials)
      if (result.success) {
        setUser(result.session.user)
        setCompany(result.session.company)
      }
      return result
    },
    []
  )

  const signOut = React.useCallback(async () => {
    await authService.signOut()
    setUser(null)
    setCompany(null)
    router.push("/login")
  }, [router])

  const completeCompanySetup = React.useCallback(
    async (payload: CompanySetupPayload): Promise<Company> => {
      const newCompany = await authService.completeCompanySetup(payload)
      setCompany(newCompany)
      if (user) {
        setUser({ ...user, companyId: newCompany.id })
      }
      setSchedule(authService.getSchedule())
      return newCompany
    },
    [user]
  )

  const updateCompany = React.useCallback(
    async (payload: Partial<Company>): Promise<Company> => {
      const updated = await authService.updateCompany(payload)
      setCompany(updated)
      return updated
    },
    []
  )

  const updateSchedule = React.useCallback(
    async (payload: Partial<WorkSchedule>): Promise<WorkSchedule> => {
      const updated = await authService.updateWorkSchedule(payload)
      setSchedule(updated)
      return updated
    },
    []
  )

  const updateAccount = React.useCallback(
    async (payload: Partial<User>): Promise<User> => {
      const updated = await authService.updateAccount(payload)
      setUser(updated)
      return updated
    },
    []
  )

  const revokeOtherSessions = React.useCallback(async () => {
    const remaining = await authService.revokeOtherSessions()
    setSessions(remaining)
  }, [])

  const changePassword = React.useCallback(
    async (newPassword: string): Promise<{ success: boolean; message: string }> => {
      const currentSession = authService.getCurrentSession()
      const targetId = user?.id || currentSession?.user.id
      if (!targetId) return { success: false, message: "No active session." }

      const res = await authService.changePassword(targetId, newPassword)
      if (res.success) {
        setUser((prev) =>
          prev ? { ...prev, mustChangePassword: false, accountStatus: "active" } : null
        )
      }
      return res
    },
    [user]
  )

  // Verify session validity on mount
  React.useEffect(() => {
    const sessionCheck = authService.validateCurrentSession()
    if (!sessionCheck.isValid) {
      setUser(null)
      setCompany(null)
    }
  }, [])

  const value = React.useMemo<AuthContextType>(
    () => ({
      user,
      company,
      schedule,
      sessions,
      isLoading,
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
      completeCompanySetup,
      updateCompany,
      updateSchedule,
      updateAccount,
      revokeOtherSessions,
      changePassword,
    }),
    [
      user,
      company,
      schedule,
      sessions,
      isLoading,
      signIn,
      signOut,
      completeCompanySetup,
      updateCompany,
      updateSchedule,
      updateAccount,
      revokeOtherSessions,
      changePassword,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
