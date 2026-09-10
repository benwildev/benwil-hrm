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
import { applyForLeaveAction, type LeaveFormState } from "@/server/actions/leave-requests.actions";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";

export function ApplyLeaveDialog({ leaveTypes }: { leaveTypes: { id: string; name: string }[] }) {
  const { open, setOpen, state, formAction, isPending } = useDialogFormAction<LeaveFormState>(
    applyForLeaveAction,
    (s) => Boolean(s && "success" in s),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Apply for leave
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Apply for leave</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="leaveTypeId">Leave type</Label>
            <NativeSelect id="leaveTypeId" name="leaveTypeId" required defaultValue="">
              <NativeSelectOption value="" disabled>
                Select a leave type
              </NativeSelectOption>
              {leaveTypes.map((lt) => (
                <NativeSelectOption key={lt.id} value={lt.id}>{lt.name}</NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" name="reason" placeholder="Optional" />
          </div>

          {state && "error" in state ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
