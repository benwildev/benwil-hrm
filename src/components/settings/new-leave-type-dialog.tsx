"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createLeaveTypeAction } from "@/server/actions/leave-types.actions";
import type { SimpleFormState } from "@/server/actions/organization.actions";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";

export function NewLeaveTypeDialog() {
  const [isPaid, setIsPaid] = useState(true);
  const { open, setOpen, state, formAction, isPending } = useDialogFormAction<SimpleFormState>(
    createLeaveTypeAction,
    (s) => Boolean(s && "success" in s),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        New leave type
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New leave type</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="leave-type-name">Name</Label>
            <Input id="leave-type-name" name="name" placeholder="Annual Leave" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="leave-type-description">Description</Label>
            <Input id="leave-type-description" name="description" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="daysPerYear">Default days per year</Label>
            <Input id="daysPerYear" name="daysPerYear" type="number" min={0} step="0.5" defaultValue={0} />
          </div>
          <label className="flex items-center gap-2">
            <Checkbox checked={isPaid} onCheckedChange={(checked) => setIsPaid(checked === true)} />
            {isPaid ? <input type="hidden" name="isPaid" value="on" /> : null}
            <Label className="font-normal">Paid leave</Label>
          </label>

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
