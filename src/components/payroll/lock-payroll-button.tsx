"use client";

import { useState, useTransition } from "react";
import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lockPayrollPeriodAction } from "@/server/actions/payroll.actions";

export function LockPayrollButton({ periodId }: { periodId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await lockPayrollPeriodAction(periodId);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to lock.");
            }
          });
        }}
      >
        <LockIcon />
        {isPending ? "Locking..." : "Lock"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
