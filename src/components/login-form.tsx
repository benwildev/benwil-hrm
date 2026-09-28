"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { useAuth } from "@/features/auth/auth-context"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"main">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, isAuthenticated, user, company } = useAuth()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [rememberMe, setRememberMe] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "account_disabled") {
      return "This account has been disabled. Please contact your organization administrator."
    }
    return null
  })

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.mustChangePassword) {
        router.push("/change-password")
      } else if (company && !company.setupCompleted) {
        router.push("/setup")
      } else {
        const from = searchParams.get("from")
        router.push(from && from !== "/setup" && from !== "/change-password" ? from : "/dashboard")
      }
    }
  }, [isAuthenticated, user, company, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn({
        email,
        password,
        rememberMe,
      })

      if (result.success) {
        if (result.session.user.mustChangePassword) {
          router.push("/change-password")
        } else if (result.session.company && !result.session.company.setupCompleted) {
          router.push("/setup")
        } else {
          const from = searchParams.get("from")
          router.push(from && from !== "/setup" && from !== "/change-password" ? from : "/dashboard")
        }
      } else {
        setError(result.message)
        setIsLoading(false)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center ${className || ""}`}
      {...props}
    >
      <div className="py-4 px-4 md:px-8">
        <div className="grid items-center gap-6 max-w-6xl w-full lg:grid-cols-2">
          <div className="border border-slate-300 rounded-lg p-6 max-w-md mx-auto shadow-sm md:p-8 lg:mx-0 dark:border-neutral-700">
            <div className="mb-8">
              <h1 className="text-slate-900 text-3xl font-bold mb-4 dark:text-slate-50">
                Sign in
              </h1>
              <p className="text-slate-600 text-base leading-relaxed dark:text-slate-400">
                Sign in to your account to access your dashboard and manage your projects.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@readymadeui.com"
                  required
                  className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-800 dark:outline-neutral-700"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-800 dark:outline-neutral-700"
                />
              </div>

              <div className="flex items-start flex-wrap gap-2">
                <label className="flex items-center group has-[input:checked]:text-slate-900 cursor-pointer select-none">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  {/* Custom box */}
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded outline-1 outline-slate-300 dark:outline-neutral-700 bg-white dark:bg-neutral-800 group-has-[input:checked]:bg-blue-600 group-has-[input:checked]:outline-blue-600 group-focus-within:outline-2 group-focus-within:outline-blue-600"
                    aria-hidden="true"
                  >
                    {/* Checkmark */}
                    <svg
                      className="size-3 text-white opacity-0 group-has-[input:checked]:opacity-100"
                      viewBox="0 0 12 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 5l3 3 7-7" />
                    </svg>
                  </span>
                  <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                    Remember me
                  </span>
                </label>

                <Link
                  href="/forgot-password"
                  className="ml-auto text-sm font-medium text-blue-700 dark:text-blue-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-3.5 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <div className="text-slate-900 text-sm text-center dark:text-slate-50">
                Don&apos;t have an account?{" "}
                <Link
                  href="/setup"
                  className="text-blue-700 hover:underline ml-1 font-medium dark:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>

          <div className="w-full max-lg:w-4/5 mx-auto flex items-center justify-center">
            <Image
              src="/Hrm.png"
              width={800}
              height={563}
              className="w-full h-auto object-contain"
              alt="Benwil HRM illustration"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  )
}
