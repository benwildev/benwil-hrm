"use client";

import { PencilIcon } from "lucide-react";
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
import { setManualAttendanceAction } from "@/server/actions/attendance.actions";
import type { AttendanceFormState } from "@/server/actions/attendance.actions";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";

function toTimeInput(date: Date | null) {
  if (!date) return "";
  const d = new Date(date);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export function EditAttendanceDialog({
  employeeId,
  employeeName,
  date,
  checkIn,
  checkOut,
  status,
}: {
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: Date | null;
  checkOut: Date | null;
  status: string | null;
}) {
  const { open, setOpen, state, formAction, isPending } = useDialogFormAction<AttendanceFormState>(
    setManualAttendanceAction,
    (s) => Boolean(s && "success" in s),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <PencilIcon />
        <span className="sr-only">Edit attendance for {employeeName}</span>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="employeeId" value={employeeId} />
          <input type="hidden" name="date" value={date} />
          <DialogHeader>
            <DialogTitle>Edit attendance</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {employeeName} — {date}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="checkIn">Check in</Label>
              <Input id="checkIn" name="checkIn" type="time" defaultValue={toTimeInput(checkIn)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="checkOut">Check out</Label>
              <Input id="checkOut" name="checkOut" type="time" defaultValue={toTimeInput(checkOut)} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <NativeSelect id="status" name="status" defaultValue={status ?? "PRESENT"} required>
              <NativeSelectOption value="PRESENT">Present</NativeSelectOption>
              <NativeSelectOption value="LATE">Late</NativeSelectOption>
              <NativeSelectOption value="HALF_DAY">Half day</NativeSelectOption>
              <NativeSelectOption value="ABSENT">Absent</NativeSelectOption>
              <NativeSelectOption value="LEAVE">Leave</NativeSelectOption>
              <NativeSelectOption value="HOLIDAY">Holiday</NativeSelectOption>
              <NativeSelectOption value="WEEKEND">Weekend</NativeSelectOption>
            </NativeSelect>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Reason for change</Label>
            <Input id="reason" name="reason" placeholder="Missed punch, forgot device, ..." required />
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
