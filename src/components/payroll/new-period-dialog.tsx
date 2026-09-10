"use client";

import { useActionState, useState } from "react";
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
import { createPayrollPeriodAction } from "@/server/actions/payroll.actions";
import type { SimpleFormState } from "@/server/actions/organization.actions";

export function NewPeriodDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<SimpleFormState, FormData>(
    createPayrollPeriodAction,
    undefined,
  );
  const now = new Date();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        New payroll period
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New payroll period</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" name="year" type="number" defaultValue={now.getFullYear()} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="month">Month</Label>
              <Input id="month" name="month" type="number" min={1} max={12} defaultValue={now.getMonth() + 1} required />
            </div>
          </div>

          {state && "error" in state ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
