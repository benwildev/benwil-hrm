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
import { createHolidayAction } from "@/server/actions/holidays.actions";
import type { SimpleFormState } from "@/server/actions/organization.actions";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";

export function NewHolidayDialog() {
  const [recurring, setRecurring] = useState(false);
  const { open, setOpen, state, formAction, isPending } = useDialogFormAction<SimpleFormState>(
    createHolidayAction,
    (s) => Boolean(s && "success" in s),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        New holiday
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New holiday</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="holiday-name">Name</Label>
            <Input id="holiday-name" name="name" placeholder="New Year's Day" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="holiday-date">Date</Label>
            <Input id="holiday-date" name="date" type="date" required />
          </div>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={recurring}
              onCheckedChange={(checked) => setRecurring(checked === true)}
            />
            {recurring ? <input type="hidden" name="isRecurringYearly" value="on" /> : null}
            <Label className="font-normal">Repeats every year</Label>
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
