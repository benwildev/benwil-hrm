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
  UserPlusIcon,
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
import { createPortalAccessAction } from "@/server/actions/employees.actions";

interface RoleOption {
  id: string;
  name: string;
}

interface CreatePortalAccessDialogProps {
  employeeId: string;
  employeeName: string;
  defaultEmail: string;
  roles: RoleOption[];
}

export function CreatePortalAccessDialog({
  employeeId,
  employeeName,
  defaultEmail,
  roles,
}: CreatePortalAccessDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail);
  const [selectedRoleId, setSelectedRoleId] = useState(
    roles.find((r) => r.name === "Employee")?.id || roles[0]?.id || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

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
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter a valid login email.");
      return;
    }
    if (!selectedRoleId) {
      setError("Please select a role.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await createPortalAccessAction(employeeId, {
          email,
          roleId: selectedRoleId,
          password,
        });
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
        }, 1200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create portal access.");
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
        <UserPlusIcon className="size-3.5 text-neutral-500" />
        <span>Create Portal Login</span>
      </DialogTrigger>

      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader className="pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#162E51]/10 border border-[#162E51]/20 flex items-center justify-center text-[#162E51]">
              <KeyIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-900">
                Create Portal Access
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 mt-0.5">
                Enable self-service portal account for {employeeName}
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
              <span className="font-semibold">Portal account activated successfully!</span>
            </div>
          )}

          {/* Login Email */}
          <div className="space-y-1.5">
            <label htmlFor="portalEmail" className="text-xs font-bold text-neutral-700">
              Login Email <span className="text-[#C52227]">*</span>
            </label>
            <input
              id="portalEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. employee@company.com"
              required
              className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#162E51]/20 focus:border-[#162E51] transition-all"
            />
          </div>

          {/* System Role */}
          <div className="space-y-1.5">
            <label htmlFor="roleSelect" className="text-xs font-bold text-neutral-700">
              Assign Role <span className="text-[#C52227]">*</span>
            </label>
            <select
              id="roleSelect"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#162E51]/20 focus:border-[#162E51] transition-all font-medium cursor-pointer"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} {role.name === "Employee" ? "(Standard Self-Service)" : role.name === "Admin" ? "(Full Admin Access)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="portalPassword" className="text-xs font-bold text-neutral-700">
                Initial Password <span className="text-[#C52227]">*</span>
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
                id="portalPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Click Generate or enter password"
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
              disabled={isPending || !email || !password}
              className="bg-[#162E51] text-white hover:bg-[#162E51]/90 shadow-sm cursor-pointer"
            >
              {isPending ? "Creating Account..." : "Create Portal Login"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
