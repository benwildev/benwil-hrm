"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/features/auth/auth-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, company, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (isMounted && !isLoading) {
      if (!isAuthenticated) {
        router.push(`/login?from=${encodeURIComponent(pathname)}`)
      } else if (user?.status === "disabled" || user?.accountStatus === "disabled") {
        router.push("/login?error=account_disabled")
      } else if (user?.mustChangePassword && pathname !== "/change-password") {
        router.push("/change-password")
      } else if (!company?.setupCompleted && pathname !== "/setup" && !user?.mustChangePassword) {
        router.push("/setup")
      }
    }
  }, [isMounted, isAuthenticated, user, company, isLoading, pathname, router])

  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-zinc-100 dark:border-t-transparent" />
          <p className="text-xs font-medium text-muted-foreground">
            Initializing workspace...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
