"use client";

import { useState, useTransition } from "react";
import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runPayrollPeriodAction } from "@/server/actions/payroll.actions";

export function RunPayrollButton({ periodId }: { periodId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await runPayrollPeriodAction(periodId);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to run payroll.");
            }
          });
        }}
      >
        <PlayIcon />
        {isPending ? "Running..." : "Run payroll"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
