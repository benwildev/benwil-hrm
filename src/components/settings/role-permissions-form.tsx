"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateRolePermissionsAction } from "@/server/actions/roles.actions";

type Permission = { id: string; key: string; group: string; description: string | null };

export function RolePermissionsForm({
  roleId,
  permissions,
  initialSelected,
  disabled,
}: {
  roleId: string;
  permissions: Permission[];
  initialSelected: string[];
  disabled?: boolean;
}) {
  const [selected, setSelected] = useState(new Set(initialSelected));
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const groups = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.group] ??= []).push(p);
    return acc;
  }, {});

  function toggle(id: string) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">{group}</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((permission) => (
              <label
                key={permission.id}
                className="flex items-start gap-2 rounded-lg border border-transparent p-2 hover:border-border"
              >
                <Checkbox
                  checked={selected.has(permission.id)}
                  onCheckedChange={() => toggle(permission.id)}
                  disabled={disabled}
                  className="mt-0.5"
                />
                <div className="flex flex-col">
                  <Label className="font-normal">{permission.key}</Label>
                  {permission.description ? (
                    <span className="text-xs text-muted-foreground">{permission.description}</span>
                  ) : null}
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      {!disabled ? (
        <div className="flex items-center gap-3">
          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await updateRolePermissionsAction(roleId, Array.from(selected));
                setSaved(true);
              });
            }}
          >
            {isPending ? "Saving..." : "Save permissions"}
          </Button>
          {saved && !isPending ? (
            <span className="text-sm text-muted-foreground">Saved.</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
