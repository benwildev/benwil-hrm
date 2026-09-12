"use client";

import React, { useState, useTransition } from "react";
import { ShieldIcon, KeyIcon, CheckIcon, AlertCircleIcon, ShieldCheckIcon } from "lucide-react";
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
import { changeUserRoleAction } from "@/server/actions/employees.actions";

interface RoleOption {
  id: string;
  name: string;
}

interface ChangeRoleDialogProps {
  userId: string;
  employeeId: string;
  employeeName: string;
  userEmail: string;
  currentRoleId: string;
  currentRoleName: string;
  roles: RoleOption[];
}

export function ChangeRoleDialog({
  userId,
  employeeId,
  employeeName,
  userEmail,
  currentRoleId,
  currentRoleName,
  roles,
}: ChangeRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(currentRoleId);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedRoleName = roles.find((r) => r.id === selectedRoleId)?.name || currentRoleName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;
    setError(null);

    startTransition(async () => {
      try {
        await changeUserRoleAction(userId, selectedRoleId, employeeId);
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update role.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg text-xs font-semibold border-neutral-300 hover:bg-neutral-100 hover:text-neutral-900 transition-all cursor-pointer"
          />
        }
      >
        <ShieldIcon className="size-3.5 text-neutral-500" />
        <span>Change Role</span>
      </DialogTrigger>

      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader className="pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <ShieldCheckIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-neutral-900">
                Change Portal Role
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 mt-0.5">
                Assign system permissions for {employeeName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircleIcon className="size-4 text-rose-600 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* User Details Preview */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Account Email:</span>
              <span className="text-xs font-semibold text-neutral-900">{userEmail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Current Role:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-200/80 text-neutral-800">
                {currentRoleName}
              </span>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label htmlFor="roleSelect" className="text-xs font-bold text-neutral-700">
              Select New Role <span className="text-rose-500">*</span>
            </label>
            <select
              id="roleSelect"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium cursor-pointer"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} {role.name === "Admin" ? "(Full System Access)" : role.name === "Employee" ? "(Standard Self-Service Portal)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Role Explanation Note */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3 text-xs leading-relaxed text-neutral-600">
            {selectedRoleName === "Employee" ? (
              <p>
                <strong className="text-neutral-900">Standard Employee:</strong> User can only access their private dashboard, punch attendance, submit leave requests, and view their own personal payslips. Company-wide payroll and other staff records remain strictly private.
              </p>
            ) : selectedRoleName === "Admin" ? (
              <p>
                <strong className="text-neutral-900">System Administrator:</strong> User has full company-wide access to employee directories, company settings, and running/reviewing all staff payroll.
              </p>
            ) : (
              <p>
                <strong className="text-neutral-900">{selectedRoleName}:</strong> Access is defined by the custom permissions configured under Settings &rarr; Roles.
              </p>
            )}
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
              disabled={isPending || selectedRoleId === currentRoleId}
              className="bg-neutral-900 text-white hover:bg-neutral-800"
            >
              {isPending ? "Updating..." : "Save Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
