"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleLeaveTypeAction } from "@/server/actions/leave-types.actions";

export function LeaveTypeActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Checkbox
      checked={isActive}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          await toggleLeaveTypeAction(id, checked === true);
        });
      }}
    />
  );
}
