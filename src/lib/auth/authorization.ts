"use client"

import { useMemo } from "react"
import { useAuth } from "@/features/auth/auth-context"
import { rolesService } from "@/lib/services/roles-service"
import type { DataScope, Role } from "@/types/roles"
import type { UserRole, EmployeeAccount, User } from "@/types/auth"

export function getRoleForSubject(subject: { roleId?: string; role?: UserRole } | null): Role | null {
  if (!subject) return null

  if (subject.roleId) {
    const role = rolesService.getRole(subject.roleId)
    if (role) return role
  }

  // Fallback by user role enum
  if (subject.role === "admin") return rolesService.getRole("role_admin")
  if (subject.role === "hr") return rolesService.getRole("role_hr")
  if (subject.role === "manager") return rolesService.getRole("role_manager")
  return rolesService.getRole("role_employee")
}

export function hasPermission(
  subject: { roleId?: string; role?: UserRole } | null,
  permissionId: string
): boolean {
  if (!subject) return false

  // Administrator role always has all permissions
  if (subject.role === "admin" || subject.roleId === "role_admin") {
    return true
  }

  const role = getRoleForSubject(subject)
  if (!role) return false

  return role.permissions.includes(permissionId)
}

export function hasAnyPermission(
  subject: { roleId?: string; role?: UserRole } | null,
  permissionIds: string[]
): boolean {
  if (!subject) return false
  if (subject.role === "admin" || subject.roleId === "role_admin") return true
  return permissionIds.some((p) => hasPermission(subject, p))
}

export function hasAllPermissions(
  subject: { roleId?: string; role?: UserRole } | null,
  permissionIds: string[]
): boolean {
  if (!subject) return false
  if (subject.role === "admin" || subject.roleId === "role_admin") return true
  return permissionIds.every((p) => hasPermission(subject, p))
}

export function getDataScope(subject: { roleId?: string; role?: UserRole } | null): DataScope {
  if (!subject) return "self"
  if (subject.role === "admin" || subject.roleId === "role_admin") return "all"

  const role = getRoleForSubject(subject)
  return role ? role.dataScope : "self"
}

export function useAuthorization() {
  const { user } = useAuth()

  const currentRole = useMemo(() => {
    return getRoleForSubject(user)
  }, [user])

  const userPermissions = useMemo(() => {
    if (!user) return new Set<string>()
    if (user.role === "admin" || user.roleId === "role_admin") {
      return new Set<string>(["*"])
    }
    return new Set<string>(currentRole?.permissions || [])
  }, [user, currentRole])

  const checkPermission = useMemo(() => {
    return (permissionId: string) => {
      if (!user) return false
      if (userPermissions.has("*")) return true
      return userPermissions.has(permissionId)
    }
  }, [user, userPermissions])

  const checkAnyPermission = useMemo(() => {
    return (permissionIds: string[]) => {
      if (!user) return false
      if (userPermissions.has("*")) return true
      return permissionIds.some((p) => userPermissions.has(p))
    }
  }, [user, userPermissions])

  const checkAllPermissions = useMemo(() => {
    return (permissionIds: string[]) => {
      if (!user) return false
      if (userPermissions.has("*")) return true
      return permissionIds.every((p) => userPermissions.has(p))
    }
  }, [user, userPermissions])

  const scope: DataScope = useMemo(() => {
    return getDataScope(user)
  }, [user])

  const isAdmin = user?.role === "admin" || user?.roleId === "role_admin"

  return {
    user,
    role: currentRole,
    dataScope: scope,
    isAdmin,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    canManageRoles: checkPermission("settings.manage_roles"),
  }
}
