"use client";

import React, { useState, useTransition } from "react";
import {
  KeyIcon,
  EyeIcon,
  EyeOffIcon,
  SparklesIcon,
  CopyIcon,
  CheckIcon,
  AlertCircleIcon,
  LockIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { changeUserPasswordAction } from "@/server/actions/employees.actions";

interface ChangePasswordDialogProps {
  userId: string;
  employeeId: string;
  employeeName: string;
  userEmail: string;
}

function calculateStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "bg-neutral-200" };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: "Weak", color: "bg-rose-500" };
    case 2:
      return { score: 2, label: "Fair", color: "bg-amber-500" };
    case 3:
      return { score: 3, label: "Good", color: "bg-blue-600" };
    case 4:
    default:
      return { score: 4, label: "Strong & Secure", color: "bg-emerald-600" };
  }
}

export function ChangePasswordDialog({
  userId,
  employeeId,
  employeeName,
  userEmail,
}: ChangePasswordDialogProps) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const strength = calculateStrength(password);
  const isMatch = password && confirmPassword && password === confirmPassword;

  const handleGeneratePassword = () => {
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghjkmnpqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "!@#$%^&*";
    const all = uppercase + lowercase + numbers + symbols;

    let generated = "";
    generated += uppercase[Math.floor(Math.random() * uppercase.length)];
    generated += lowercase[Math.floor(Math.random() * lowercase.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < 12; i++) {
      generated += all[Math.floor(Math.random() * all.length)];
    }

    const shuffled = generated
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setPassword(shuffled);
    setConfirmPassword(shuffled);
    setShowPassword(true);
    setError(null);
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter a new password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await changeUserPasswordAction(userId, password, employeeId);
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
        }, 1200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to change password.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg text-xs font-semibold border-neutral-300 hover:bg-[#162E51]/5 hover:text-[#162E51] hover:border-[#162E51]/30 transition-all cursor-pointer"
          />
        }
      >
        <KeyIcon className="size-3.5 text-neutral-500" />
        <span>Change Password</span>
      </DialogTrigger>

      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader className="pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#162E51]/10 border border-[#162E51]/20 flex items-center justify-center text-[#162E51]">
              <LockIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-900">
                Change Portal Password
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 mt-0.5">
                Update login credentials for {employeeName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in-0">
              <AlertCircleIcon className="size-4 text-rose-600 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in-0">
              <CheckIcon className="size-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Password updated successfully!</span>
            </div>
          )}

          {/* Account Details Box */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Employee:</span>
              <span className="text-xs font-semibold text-neutral-900">{employeeName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Portal Username / Email:</span>
              <span className="text-xs font-bold text-[#162E51] font-mono">{userEmail}</span>
            </div>
          </div>

          {/* New Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="newPassword" className="text-xs font-bold text-neutral-700">
                New Password <span className="text-[#C52227]">*</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#162E51] hover:text-[#C52227] transition-colors cursor-pointer"
              >
                <SparklesIcon className="size-3 text-[#C52227]" />
                <span>Generate Password</span>
              </button>
            </div>

            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="w-full h-11 pl-3.5 pr-20 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 font-mono tracking-wide placeholder:tracking-normal placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#162E51]/20 focus:border-[#162E51] transition-all"
              />

              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {password && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                    title={isCopied ? "Copied!" : "Copy password"}
                  >
                    {isCopied ? (
                      <CheckIcon className="size-4 text-emerald-600" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="pt-1 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-medium text-neutral-500">
                  <span>Strength:</span>
                  <span className="font-bold text-neutral-800">{strength.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-colors ${
                        step <= strength.score ? strength.color : "bg-neutral-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-bold text-neutral-700">
              Confirm New Password <span className="text-[#C52227]">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password to confirm"
                className={`w-full h-11 pl-3.5 pr-10 rounded-xl border bg-white text-sm text-neutral-900 font-mono tracking-wide placeholder:tracking-normal placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                  isMatch
                    ? "border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500"
                    : confirmPassword && !isMatch
                    ? "border-rose-400 focus:ring-rose-400/20 focus:border-rose-400"
                    : "border-neutral-300 focus:ring-[#162E51]/20 focus:border-[#162E51]"
                }`}
              />
              {isMatch && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">
                  <CheckIcon className="size-4" />
                </div>
              )}
            </div>
            {confirmPassword && !isMatch && (
              <p className="text-[11px] text-rose-500 font-medium">Passwords do not match</p>
            )}
          </div>

          {/* Guidance Info */}
          <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/90 p-3 text-xs leading-relaxed text-neutral-600">
            <p>
              The employee will immediately use this new password for their portal login. Make sure to share the new password with the employee securely.
            </p>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !password || password !== confirmPassword}
              className="bg-[#162E51] text-white hover:bg-[#162E51]/90 shadow-sm cursor-pointer"
            >
              {isPending ? "Updating Password..." : "Save New Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
