"use client";

import { useState } from "react";
import { PlusIcon, SunIcon, SunsetIcon, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<"FIRST_HALF" | "SECOND_HALF">("FIRST_HALF");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Apply for leave
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Apply for leave</DialogTitle>
          </DialogHeader>

          <input type="hidden" name="isHalfDay" value={isHalfDay ? "true" : "false"} />
          {isHalfDay ? (
            <input type="hidden" name="halfDaySession" value={halfDaySession} />
          ) : null}

          {/* Leave Type */}
          <div className="flex flex-col gap-1.5">
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

          {/* Full Day vs Half Day Segmented Control */}
          <div className="flex flex-col gap-1.5">
            <Label>Duration</Label>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 border border-border/60">
              <button
                type="button"
                onClick={() => setIsHalfDay(false)}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isHalfDay
                    ? "bg-background text-foreground shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarIcon className="size-3.5" />
                <span>Full Day</span>
              </button>
              <button
                type="button"
                onClick={() => setIsHalfDay(true)}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isHalfDay
                    ? "bg-background text-foreground shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Half Day</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1 border-primary/30 text-primary">
                  0.5 Day
                </Badge>
              </button>
            </div>
          </div>

          {/* Date Picker(s) */}
          {isHalfDay ? (
            <div className="flex flex-col gap-3 p-3 rounded-xl bg-muted/30 border border-border/60">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startDate">Leave Date</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Session</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHalfDaySession("FIRST_HALF")}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer text-left ${
                      halfDaySession === "FIRST_HALF"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/60 hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <SunIcon className="size-4 shrink-0 text-amber-500" />
                    <div>
                      <div className="font-semibold">First Half</div>
                      <div className="text-[10px] text-muted-foreground">Morning Session</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHalfDaySession("SECOND_HALF")}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer text-left ${
                      halfDaySession === "SECOND_HALF"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border/60 hover:bg-muted/40 text-foreground"
                    }`}
                  >
                    <SunsetIcon className="size-4 shrink-0 text-orange-500" />
                    <div>
                      <div className="font-semibold">Second Half</div>
                      <div className="text-[10px] text-muted-foreground">Afternoon Session</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startDate">Start date</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="endDate">End date</Label>
                <Input id="endDate" name="endDate" type="date" required />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Input id="reason" name="reason" placeholder="e.g. Doctor's appointment" />
          </div>

          {state && "error" in state ? (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? "Submitting..." : isHalfDay ? "Submit Half-Day Request (0.5 Day)" : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
