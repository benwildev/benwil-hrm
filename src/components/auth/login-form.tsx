"use client";

import { useActionState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "@/server/actions/auth.actions";

const fieldClass =
  "h-11 rounded-lg border-[#E2E8F0] bg-white px-3.5 text-[#111827] placeholder:text-[#94A3B8] focus-visible:border-[#18315B] focus-visible:ring-[#18315B]/15";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/dashboard"} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="text-[#111827]">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-[#111827]">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass}
        />
      </div>

      {state?.error ? <p className="text-sm text-[#BC2025]">{state.error}</p> : null}

      <Button
        type="submit"
        disabled={isPending}
        className="group mt-1 h-11 justify-center gap-2 rounded-lg bg-[#18315B] text-white hover:bg-[#132548]"
      >
        {isPending ? "Signing in..." : "Sign in"}
        {!isPending ? (
          <ArrowRightIcon className="size-4 text-[#BC2025] transition-transform group-hover:translate-x-0.5" />
        ) : null}
      </Button>
    </form>
  );
}
