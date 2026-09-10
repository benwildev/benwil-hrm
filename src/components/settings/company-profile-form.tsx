"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateCompanyProfileAction,
  type CompanyFormState,
} from "@/server/actions/company.actions";
import type { Company } from "@/generated/prisma/client";

const FIELDS: { name: keyof Company; label: string }[] = [
  { name: "name", label: "Company name" },
  { name: "legalName", label: "Legal name" },
  { name: "email", label: "Company email" },
  { name: "phone", label: "Phone" },
  { name: "addressLine", label: "Address" },
  { name: "city", label: "City" },
  { name: "state", label: "State / Province" },
  { name: "postalCode", label: "Postal code" },
  { name: "country", label: "Country" },
  { name: "taxId", label: "Tax ID" },
];

export function CompanyProfileForm({ company }: { company: Company }) {
  const [state, formAction, isPending] = useActionState<CompanyFormState, FormData>(
    updateCompanyProfileAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.name} className="flex flex-col gap-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              key={`${field.name}-${(company[field.name] as string | null) ?? ""}`}
              id={field.name}
              name={field.name}
              defaultValue={(company[field.name] as string | null) ?? ""}
              required={field.name === "name"}
            />
          </div>
        ))}
      </div>

      {state && "error" in state ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state && "success" in state ? (
        <p className="text-sm text-muted-foreground">Saved.</p>
      ) : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
