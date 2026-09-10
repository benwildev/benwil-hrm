"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markPayslipPaidAction } from "@/server/actions/payroll.actions";

export function MarkPaidButton({ periodId, recordId }: { periodId: string; recordId: string }) {
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
              await markPayslipPaidAction(periodId, recordId);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to update.");
            }
          });
        }}
      >
        {isPending ? "Saving..." : "Mark as paid"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
