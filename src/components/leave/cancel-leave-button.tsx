"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cancelLeaveRequestAction } from "@/server/actions/leave-requests.actions";

export function CancelLeaveButton({ requestId }: { requestId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await cancelLeaveRequestAction(requestId);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to cancel.");
            }
          });
        }}
      >
        {isPending ? "Cancelling..." : "Cancel"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
