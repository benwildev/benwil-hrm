"use client";

import { useState, useTransition } from "react";
import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetPayslipPaymentStatusAction } from "@/server/actions/payroll.actions";

interface ResetPaymentButtonProps {
  periodId: string;
  recordId: string;
}

export function ResetPaymentButton({ periodId, recordId }: ResetPaymentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        className="text-amber-700 border-amber-300 hover:bg-amber-50 hover:text-amber-800"
        onClick={() => {
          if (!confirm("Are you sure you want to reopen this payment? The status will revert to PENDING so payroll can be recalculated.")) {
            return;
          }
          setError(null);
          startTransition(async () => {
            try {
              await resetPayslipPaymentStatusAction(periodId, recordId);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to reset payment.");
            }
          });
        }}
      >
        <RotateCcwIcon className={`size-3.5 mr-1.5 ${isPending ? "animate-spin" : ""}`} />
        {isPending ? "Resetting..." : "Reopen Payment"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
