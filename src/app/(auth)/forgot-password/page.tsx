"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeftIcon, CheckCircle2Icon, Loader2Icon, MailIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/lib/auth/auth-service"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid work email address.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await authService.sendPasswordReset(email)
      setSubmitted(true)
    } catch {
      setError("An unexpected error occurred. Please try again.")
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
          <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to sign in</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-1.5 text-left">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {submitted ? "Check your email" : "Reset your password"}
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {submitted
            ? "We have dispatched a secure recovery link to your registered address."
            : "Enter your registered organization email and we'll send you recovery instructions."}
        </p>
      </div>

      {/* Content */}
      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/70 p-4 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Instructions dispatched</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-emerald-800 dark:text-emerald-400">
              If an active account exists for{" "}
              <strong className="font-semibold text-emerald-950 dark:text-emerald-200">
                {email}
              </strong>
              , instructions to reset your password have been sent. The link expires in 60 minutes.
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Didn’t receive the email? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-foreground underline underline-offset-4 hover:opacity-80 font-medium"
            >
              try another email address
            </button>
            .
          </p>

          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            className="w-full h-10 text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg shadow-xs"
          >
            Return to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-foreground">
              Work Email Address
            </Label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="amara@benwilhrm.com"
                autoComplete="email"
                value={email}
                disabled={isLoading}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError(null)
                }}
                className={cn(
                  "pl-9 h-10 text-sm bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100",
                  error && "border-rose-500 focus-visible:ring-rose-500/20"
                )}
              />
            </div>
            {error && (
              <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 text-xs font-semibold bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 rounded-lg transition-all shadow-xs flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" />
                <span>Dispatching reset link...</span>
              </>
            ) : (
              <>
                <MailIcon className="size-3.5" />
                <span>Send Reset Instructions</span>
              </>
            )}
          </Button>
        </form>
      )}

      {/* Footer Link */}
      <div className="pt-2 text-center">
        <p className="text-xs text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
