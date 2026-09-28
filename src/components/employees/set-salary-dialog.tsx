"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { setEmployeeSalaryAction } from "@/server/actions/salary.actions";
import type { SimpleFormState } from "@/server/actions/organization.actions";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import { localDateInputValue } from "@/lib/utils";

export function SetSalaryDialog({ employeeId }: { employeeId: string }) {
  const action = setEmployeeSalaryAction.bind(null, employeeId);
  const { open, setOpen, state, formAction, isPending } = useDialogFormAction<SimpleFormState>(
    action,
    (s) => Boolean(s && "success" in s),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        Update salary
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Update basic salary</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="basicSalary">Basic salary</Label>
            <Input id="basicSalary" name="basicSalary" type="number" min={0} step="0.01" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="effectiveFrom">Effective from</Label>
            <Input
              id="effectiveFrom"
              name="effectiveFrom"
              type="date"
              defaultValue={localDateInputValue()}
              required
            />
          </div>

          {state && "error" in state ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
