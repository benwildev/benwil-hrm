import * as React from "react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
          Loading workspace...
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  )
}
