"use client";

import { useActionState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { uploadDocumentAction, type DocumentFormState } from "@/server/actions/documents.actions";

export function DocumentUploadForm({ employeeId }: { employeeId: string }) {
  const action = uploadDocumentAction.bind(null, employeeId);
  const [state, formAction, isPending] = useActionState<DocumentFormState, FormData>(
    action,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await formAction(formData);
        formRef.current?.reset();
      }}
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="documentType">Type</Label>
        <Input id="documentType" name="documentType" placeholder="ID, Contract, Certificate..." required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="documentName">Name</Label>
        <Input id="documentName" name="documentName" placeholder="National ID" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="file">File</Label>
        <Input id="file" name="file" type="file" required />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Uploading..." : "Upload"}
      </Button>
      {state?.error ? <p className="w-full text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
