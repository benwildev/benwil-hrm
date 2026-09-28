"use client";

import { useState, useTransition } from "react";
import { PlayIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runPayrollPeriodAction } from "@/server/actions/payroll.actions";

interface RunPayrollButtonProps {
  periodId: string;
  isRerun?: boolean;
}

export function RunPayrollButton({ periodId, isRerun = false }: RunPayrollButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={isRerun ? "outline" : "default"}
        size="sm"
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
        {isRerun ? (
          <RefreshCwIcon className={`size-3.5 mr-1.5 ${isPending ? "animate-spin" : ""}`} />
        ) : (
          <PlayIcon className="size-3.5 mr-1.5" />
        )}
        {isPending ? (isRerun ? "Recalculating..." : "Running...") : (isRerun ? "Recalculate Payroll" : "Run payroll")}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
