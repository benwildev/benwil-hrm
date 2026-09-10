"use client";

import { useActionState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { importAttendanceCsvAction, type AttendanceFormState } from "@/server/actions/attendance.actions";

export function ImportCsvForm() {
  const [state, formAction, isPending] = useActionState<AttendanceFormState, FormData>(
    importAttendanceCsvAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="file">CSV file</Label>
        <Input id="file" name="file" type="file" accept=".csv,text/csv" required />
      </div>

      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state && "success" in state ? (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Importing..." : "Import"}
        </Button>
      </div>
    </form>
  );
}
