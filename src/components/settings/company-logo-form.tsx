"use client";

import { useActionState, useRef } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  uploadCompanyLogoAction,
  type CompanyFormState,
} from "@/server/actions/company.actions";

export function CompanyLogoForm({ logoUrl }: { logoUrl: string | null }) {
  const [state, formAction, isPending] = useActionState<CompanyFormState, FormData>(
    uploadCompanyLogoAction,
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
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {logoUrl ? (
            <Image src={logoUrl} alt="Company logo" width={64} height={64} className="size-full object-contain" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="logo">Upload a new logo</Label>
          <Input id="logo" name="logo" type="file" accept="image/*" required />
        </div>
      </div>

      {state && "error" in state ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-sm text-muted-foreground">Saved.</p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Uploading..." : "Upload logo"}
        </Button>
      </div>
    </form>
  );
}
