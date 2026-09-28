"use client"

import * as React from "react"
import { CheckCircle2Icon, EyeIcon, EyeOffIcon, KeyRoundIcon, ShieldAlertIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/features/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, changePassword } = useAuth()

  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)

  // Route security checks
  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login")
      } else if (!user.mustChangePassword) {
        router.push("/dashboard")
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  // Password criteria checks
  const hasMinLength = newPassword.length >= 8
  const hasNumber = /\d/.test(newPassword)
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword)
  const hasMixedCase = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)

  const strengthScore = [hasMinLength, hasNumber, hasSymbol, hasMixedCase].filter(Boolean).length

  const strengthLabel = React.useMemo(() => {
    if (!newPassword) return { text: "None", color: "bg-muted text-muted-foreground", width: "w-0" }
    if (strengthScore <= 1) return { text: "Weak", color: "bg-rose-500", width: "w-1/4" }
    if (strengthScore === 2) return { text: "Fair", color: "bg-amber-500", width: "w-2/4" }
    if (strengthScore === 3) return { text: "Good", color: "bg-blue-500", width: "w-3/4" }
    return { text: "Strong", color: "bg-emerald-500", width: "w-full" }
  }, [newPassword, strengthScore])

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!hasMinLength) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please verify your confirmation password.")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await changePassword(newPassword)
      if (res.success) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 800)
      } else {
        setError(res.message)
        setIsSubmitting(false)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <div className="size-6 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-zinc-100" />
          <span>Securing session...</span>
        </div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-zinc-50/50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        {/* Brand identity */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm">
            <KeyRoundIcon className="size-5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-foreground">Benwil HRM</span>
            <span className="block text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Security Verification
            </span>
          </div>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create your password
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              For security, you need to create a new personal password before continuing to your workspace.
            </p>
          </div>

          {/* User badge */}
          <div className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/30 p-3 text-xs">
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
              First Login
            </span>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <ShieldAlertIcon className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="size-4 shrink-0" />
              <span>Password updated successfully! Loading dashboard...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>New Password</span>
                {newPassword && (
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Strength: <strong className="text-foreground">{strengthLabel.text}</strong>
                  </span>
                )}
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="pr-10 text-xs"
                  required
                  autoFocus
                  disabled={isSubmitting || isSuccess}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>

              {/* Strength Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted mt-2">
                <div
                  className={`h-full transition-all duration-300 ${strengthLabel.color} ${strengthLabel.width}`}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-semibold text-foreground flex items-center justify-between"
              >
                <span>Confirm New Password</span>
                {confirmPassword && (
                  <span
                    className={`text-[10px] font-medium ${
                      passwordsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                    }`}
                  >
                    {passwordsMatch ? "Passwords match" : "Does not match"}
                  </span>
                )}
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="pr-10 text-xs"
                  required
                  disabled={isSubmitting || isSuccess}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Criteria Checklist */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1.5 text-[11px] text-muted-foreground">
              <p className="font-semibold text-foreground mb-1 text-xs">Password Requirements:</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${hasMinLength ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  <span>8+ characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${hasNumber ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  <span>At least one number</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasSymbol ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${hasSymbol ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  <span>Special character</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMixedCase ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${hasMixedCase ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                  <span>Upper & lowercase</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isSuccess || !hasMinLength || !passwordsMatch}
              className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 font-semibold text-xs h-10 shadow-xs"
            >
              {isSubmitting ? "Setting New Password..." : "Continue to Dashboard"}
            </Button>
          </form>
        </div>

        {/* Security assurance */}
        <p className="text-center text-[11px] text-muted-foreground">
          Protected by Benwil HRM single-tenant access security protocol.
        </p>
      </div>
    </main>
  )
}
