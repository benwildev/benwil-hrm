"use client";

import { useState, useTransition } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteHolidayAction } from "@/server/actions/holidays.actions";

export function DeleteHolidayButton({ id, name }: { id: string; name: string }) {
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
              await deleteHolidayAction(id);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to delete.");
            }
          });
        }}
      >
        <Trash2Icon />
        <span className="sr-only">Delete {name}</span>
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
