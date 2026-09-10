"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleSalaryComponentAction } from "@/server/actions/salary.actions";

export function SalaryComponentActiveToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Checkbox
      checked={isActive}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          await toggleSalaryComponentAction(id, checked === true);
        });
      }}
    />
  );
}
