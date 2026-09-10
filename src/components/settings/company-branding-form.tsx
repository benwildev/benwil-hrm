"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  updateCompanyBrandingAction,
  type CompanyFormState,
} from "@/server/actions/company.actions";
import { oklchToHex } from "@/lib/color";

export function CompanyBrandingForm({
  primaryColor,
  accentColor,
  sidebarPrimary,
}: {
  primaryColor: string;
  accentColor: string;
  sidebarPrimary: string;
}) {
  const [state, formAction, isPending] = useActionState<CompanyFormState, FormData>(
    updateCompanyBrandingAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="primaryHex">Primary color</Label>
          <input
            id="primaryHex"
            name="primaryHex"
            type="color"
            defaultValue={oklchToHex(primaryColor)}
            className="h-9 w-full cursor-pointer rounded-lg border border-input bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="accentHex">Accent color</Label>
          <input
            id="accentHex"
            name="accentHex"
            type="color"
            defaultValue={oklchToHex(accentColor)}
            className="h-9 w-full cursor-pointer rounded-lg border border-input bg-transparent"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sidebarHex">Sidebar color</Label>
          <input
            id="sidebarHex"
            name="sidebarHex"
            type="color"
            defaultValue={oklchToHex(sidebarPrimary)}
            className="h-9 w-full cursor-pointer rounded-lg border border-input bg-transparent"
          />
        </div>
      </div>

      {state && "error" in state ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-sm text-muted-foreground">Saved. Reload to see it everywhere.</p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save branding"}
        </Button>
      </div>
    </form>
  );
}
