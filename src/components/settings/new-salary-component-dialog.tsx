"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createSalaryComponentAction } from "@/server/actions/salary.actions";
import type { SimpleFormState } from "@/server/actions/organization.actions";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";

export function NewSalaryComponentDialog() {
  const { open, setOpen, state, formAction, isPending } = useDialogFormAction<SimpleFormState>(
    createSalaryComponentAction,
    (s) => Boolean(s && "success" in s),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        New component
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New salary component</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="component-name">Name</Label>
            <Input id="component-name" name="name" placeholder="House Rent Allowance" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="componentType">Type</Label>
              <NativeSelect id="componentType" name="componentType" defaultValue="EARNING" required>
                <NativeSelectOption value="EARNING">Earning</NativeSelectOption>
                <NativeSelectOption value="DEDUCTION">Deduction</NativeSelectOption>
              </NativeSelect>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="calculationType">Calculation</Label>
              <NativeSelect id="calculationType" name="calculationType" defaultValue="FIXED" required>
                <NativeSelectOption value="FIXED">Fixed amount</NativeSelectOption>
                <NativeSelectOption value="PERCENTAGE">% of basic salary</NativeSelectOption>
              </NativeSelect>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="defaultAmount">Default amount</Label>
            <Input id="defaultAmount" name="defaultAmount" type="number" min={0} step="0.01" defaultValue={0} />
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
