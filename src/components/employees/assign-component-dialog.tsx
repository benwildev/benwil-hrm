"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { assignSalaryComponentAction } from "@/server/actions/salary.actions";
import type { SimpleFormState } from "@/server/actions/organization.actions";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import { localDateInputValue } from "@/lib/utils";

export function AssignComponentDialog({
  employeeId,
  components,
}: {
  employeeId: string;
  components: { id: string; name: string; componentType: string }[];
}) {
  const action = assignSalaryComponentAction.bind(null, employeeId);
  const { open, setOpen, state, formAction, isPending } = useDialogFormAction<SimpleFormState>(
    action,
    (s) => Boolean(s && "success" in s),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <PlusIcon />
        Assign component
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Assign salary component</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="salaryComponentId">Component</Label>
            <NativeSelect id="salaryComponentId" name="salaryComponentId" required defaultValue="">
              <NativeSelectOption value="" disabled>
                Select a component
              </NativeSelectOption>
              {components.map((c) => (
                <NativeSelectOption key={c.id} value={c.id}>
                  {c.name} ({c.componentType})
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="effectiveFrom">Effective from</Label>
            <Input
              id="effectiveFrom"
              name="effectiveFrom"
              type="date"
              defaultValue={localDateInputValue()}
              required
            />
          </div>

          {state && "error" in state ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
