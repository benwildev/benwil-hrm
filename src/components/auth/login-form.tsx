"use client";

import React, { useActionState, useState } from "react";
import {
  ArrowRightIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react";
import { loginAction, type LoginState } from "@/server/actions/auth.actions";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleAutoFillDemo() {
    setEmail("admin@benwil.com");
    setPassword("Admin123!");
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/dashboard"} />

      {/* Email Field */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-xs font-semibold text-neutral-700"
        >
          Email address <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <MailIcon className="size-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. admin@benwil.com"
            className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#162E51]/20 focus:border-[#162E51] transition-all font-medium"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-xs font-semibold text-neutral-700"
          >
            Password <span className="text-[#C52227]">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-xs font-semibold text-[#162E51] hover:text-[#C52227] inline-flex items-center gap-1.5 cursor-pointer py-0.5 px-1.5 rounded-md hover:bg-[#F0F4F9] transition-colors"
          >
            {showPassword ? (
              <>
                <EyeOffIcon className="size-3.5 text-[#162E51]" />
                <span>Hide password</span>
              </>
            ) : (
              <>
                <EyeIcon className="size-3.5 text-[#162E51]" />
                <span>Show password</span>
              </>
            )}
          </button>
        </div>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
            <LockIcon className="size-4" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full h-11 pl-10 pr-11 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white focus:bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#162E51]/20 focus:border-[#162E51] transition-all [&::-ms-reveal]:hidden [&::-ms-clear]:hidden font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer z-10"
          >
            {showPassword ? (
              <EyeOffIcon className="size-4 text-[#162E51]" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Demo Helper Line */}
      <div className="flex items-center justify-between px-0.5 text-xs">
        <span className="text-[11px] text-neutral-400">
          Demo: <code className="font-mono text-neutral-600">Admin123!</code>
        </span>
        <button
          type="button"
          onClick={handleAutoFillDemo}
          className="text-xs font-bold text-[#162E51] hover:text-[#C52227] hover:underline cursor-pointer transition-colors inline-flex items-center gap-1"
        >
          <SparklesIcon className="size-3 text-[#C52227]" />
          Auto-fill credentials
        </button>
      </div>

      {/* Error Alert */}
      {state?.error ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs font-semibold text-rose-700 animate-in fade-in-0 slide-in-from-top-1">
          <AlertCircleIcon className="size-4 shrink-0 text-rose-600" />
          <span>{state.error}</span>
        </div>
      ) : null}

      {/* Submit Action */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full h-11 rounded-xl bg-[#162E51] hover:bg-[#0D1C33] text-white font-bold text-sm transition-all shadow-md shadow-[#162E51]/20 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60 active:scale-[0.99] mt-1"
      >
        <span>{isPending ? "Signing in..." : "Sign in to Workspace"}</span>
        {isPending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <ArrowRightIcon className="size-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        )}
      </button>
    </form>
  );
}


