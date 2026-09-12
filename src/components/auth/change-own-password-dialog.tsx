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
  ShieldCheckIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { changeOwnPasswordAction } from "@/server/actions/auth.actions";

interface ChangeOwnPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

export function ChangeOwnPasswordDialog({
  open,
  onOpenChange,
  userEmail,
}: ChangeOwnPasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;

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

    setNewPassword(shuffled);
    setConfirmPassword(shuffled);
    setShowNew(true);
    setError(null);
  };

  const handleCopy = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClose = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await changeOwnPasswordAction(currentPassword, newPassword);
        setSuccess(true);
        setTimeout(() => {
          handleClose(false);
        }, 1200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to change password.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader className="pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#162E51]/10 border border-[#162E51]/20 flex items-center justify-center text-[#162E51]">
              <ShieldCheckIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-900">
                Change Your Password
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 mt-0.5">
                Update login credentials for {userEmail}
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
              <span className="font-semibold">Password changed successfully!</span>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <label htmlFor="currentPassword" className="text-xs font-bold text-neutral-700">
              Current Password <span className="text-[#C52227]">*</span>
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
                className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#162E51]/20 focus:border-[#162E51] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors cursor-pointer"
              >
                {showCurrent ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="ownNewPassword" className="text-xs font-bold text-neutral-700">
                New Password <span className="text-[#C52227]">*</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#162E51] hover:text-[#C52227] transition-colors cursor-pointer"
              >
                <SparklesIcon className="size-3 text-[#C52227]" />
                <span>Generate Secure</span>
              </button>
            </div>

            <div className="relative">
              <input
                id="ownNewPassword"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                required
                className="w-full h-11 pl-3.5 pr-20 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 font-mono tracking-wide placeholder:tracking-normal placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#162E51]/20 focus:border-[#162E51] transition-all"
              />

              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                {newPassword && (
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
                  onClick={() => setShowNew((prev) => !prev)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label htmlFor="ownConfirmPassword" className="text-xs font-bold text-neutral-700">
              Confirm New Password <span className="text-[#C52227]">*</span>
            </label>
            <div className="relative">
              <input
                id="ownConfirmPassword"
                type={showNew ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
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
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleClose(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}
              className="bg-[#162E51] text-white hover:bg-[#162E51]/90 shadow-sm cursor-pointer"
            >
              {isPending ? "Changing Password..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
