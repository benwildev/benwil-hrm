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
import { createShiftAction } from "@/server/actions/organization.actions";
import type { SimpleFormState } from "@/server/actions/organization.actions";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";

export function NewShiftDialog() {
  const [overnight, setOvernight] = useState(false);
  const { open, setOpen, state, formAction, isPending } = useDialogFormAction<SimpleFormState>(
    createShiftAction,
    (s) => Boolean(s && "success" in s),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        New shift
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New shift</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="shift-name">Name</Label>
            <Input id="shift-name" name="name" placeholder="General Shift" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="startTime">Start time</Label>
              <Input id="startTime" name="startTime" type="time" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="endTime">End time</Label>
              <Input id="endTime" name="endTime" type="time" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="gracePeriodMinutes">Grace period (min)</Label>
              <Input
                id="gracePeriodMinutes"
                name="gracePeriodMinutes"
                type="number"
                min={0}
                defaultValue={0}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="breakMinutes">Break (min)</Label>
              <Input id="breakMinutes" name="breakMinutes" type="number" min={0} defaultValue={0} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="requiredWorkMinutes">Required work minutes (optional)</Label>
            <Input
              id="requiredWorkMinutes"
              name="requiredWorkMinutes"
              type="number"
              min={0}
              placeholder="e.g. 520 for 8h40m"
            />
            <p className="text-xs text-muted-foreground">
              When set, lateness is judged by total hours worked vs. this target (an employee who
              arrives late but stays late enough to still hit this total is on time), instead of
              by arrival time alone.
            </p>
          </div>

          <label className="flex items-center gap-2">
            <Checkbox
              checked={overnight}
              onCheckedChange={(checked) => setOvernight(checked === true)}
            />
            {overnight ? <input type="hidden" name="isOvernight" value="on" /> : null}
            <Label className="font-normal">Overnight shift (ends the next day)</Label>
          </label>

          {state && "error" in state ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create shift"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
