"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, EyeIcon, EyeOffIcon, Loader2Icon, LockIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/lib/auth/auth-service"
import { cn } from "@/lib/utils"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const [isLoading, setIsLoading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Password strength calculation
  const strengthChecks = React.useMemo(() => {
    return {
      length: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }
  }, [password])

  const passedChecksCount = Object.values(strengthChecks).filter(Boolean).length

  const strengthLabel = React.useMemo(() => {
    if (password.length === 0) return { label: "Enter password", color: "bg-zinc-200" }
    if (passedChecksCount <= 1) return { label: "Weak", color: "bg-rose-500" }
    if (passedChecksCount === 2 || passedChecksCount === 3)
      return { label: "Moderate", color: "bg-amber-500" }
    return { label: "Strong", color: "bg-emerald-500" }
  }, [passedChecksCount, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.")
      return
    }

    setIsLoading(true)

    try {
      const result = await authService.resetPassword(password)
      if (result.success) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch {
      setError("Failed to update password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Top Back Link */}
      <div>
        <Link
          href="/login"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors group"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          <span>Back to sign in</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1.5 text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create new password
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Please enter a secure new password for your enterprise account.
        </p>
      </div>

      {/* Content */}
      {isSuccess ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300 space-y-1.5">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Password updated</span>
            </div>
            <p className="text-[11.5px] text-emerald-700 dark:text-emerald-400">
              Your credentials have been updated securely. Redirecting you to sign in...
            </p>
          </div>

          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            className="w-full h-10 text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg shadow-xs"
          >
            Sign In Now
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-foreground">
              New Password
            </Label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9 h-10 text-sm bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {showPassword ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            <div className="pt-1.5 space-y-1.5">
              <div className="flex items-center justify-between text-[10.5px]">
                <span className="text-muted-foreground">Password strength:</span>
                <span className="font-semibold text-foreground">{strengthLabel.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 h-1.5 w-full">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      passedChecksCount >= step
                        ? strengthLabel.color
                        : "bg-zinc-100 dark:bg-zinc-800"
                    )}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground pt-0.5">
                <span className={cn(strengthChecks.length ? "text-emerald-600 font-medium" : "")}>
                  ✓ 8+ characters
                </span>
                <span className={cn(strengthChecks.hasNumber ? "text-emerald-600 font-medium" : "")}>
                  ✓ Number (0-9)
                </span>
                <span className={cn(strengthChecks.hasUppercase ? "text-emerald-600 font-medium" : "")}>
                  ✓ Uppercase letter
                </span>
                <span className={cn(strengthChecks.hasSpecial ? "text-emerald-600 font-medium" : "")}>
                  ✓ Special character
                </span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
              Confirm New Password
            </Label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                disabled={isLoading}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-9 pr-9 h-10 text-sm bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                Passwords do not match.
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading || password.length < 8 || password !== confirmPassword}
            className="w-full h-10 text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              <>
                <LockIcon className="size-3.5" />
                <span>Reset Password</span>
              </>
            )}
          </Button>
        </form>
      )}

      {/* Footer */}
      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 hover:opacity-80"
        >
          Return to sign in
        </Link>
      </div>
    </div>
  )
}
