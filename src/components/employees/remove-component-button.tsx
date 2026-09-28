"use client";

import { useState, useTransition } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeSalaryComponentAction } from "@/server/actions/salary.actions";

export function RemoveComponentButton({ employeeId, id }: { employeeId: string; id: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await removeSalaryComponentAction(employeeId, id);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to remove.");
            }
          });
        }}
      >
        <XIcon />
        <span className="sr-only">Remove</span>
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
