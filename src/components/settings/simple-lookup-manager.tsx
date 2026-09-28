"use client";

import { useState, useTransition } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { SimpleFormState } from "@/server/actions/organization.actions";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";

type Item = { id: string; name: string; description: string | null };

export function SimpleLookupManager({
  items,
  itemLabel,
  createAction,
  deleteAction,
}: {
  items: Item[];
  itemLabel: string;
  createAction: (prevState: SimpleFormState, formData: FormData) => Promise<SimpleFormState>;
  deleteAction: (id: string) => Promise<void>;
}) {
  const { open, setOpen, state, formAction, isPending } = useDialogFormAction<SimpleFormState>(
    createAction,
    (s) => Boolean(s && "success" in s),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <PlusIcon />
            New {itemLabel}
          </DialogTrigger>
          <DialogContent>
            <form action={formAction} className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>New {itemLabel}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${itemLabel}-name`}>Name</Label>
                <Input id={`${itemLabel}-name`} name="name" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor={`${itemLabel}-description`}>Description</Label>
                <Input id={`${itemLabel}-description`} name="description" />
              </div>
              {state && "error" in state ? (
                <p className="text-sm text-destructive">{state.error}</p>
              ) : null}
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-1" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <LookupRow key={item.id} item={item} deleteAction={deleteAction} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function LookupRow({ item, deleteAction }: { item: Item; deleteAction: (id: string) => Promise<void> }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell className="text-muted-foreground">{item.description ?? "—"}</TableCell>
      <TableCell>
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isPending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                try {
                  await deleteAction(item.id);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to delete.");
                }
              });
            }}
          >
            <Trash2Icon />
            <span className="sr-only">Delete {item.name}</span>
          </Button>
          {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </div>
      </TableCell>
    </TableRow>
  );
}
