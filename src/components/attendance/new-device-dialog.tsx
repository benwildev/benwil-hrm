"use client";

import { useState } from "react";
import { PlusIcon, CopyIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createDeviceAction, type DeviceFormState } from "@/server/actions/devices.actions";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";

export function NewDeviceDialog() {
  const [copied, setCopied] = useState(false);
  // Never auto-close on success — the generated API key is shown exactly
  // once and must be copied before the dialog goes away.
  const { open, setOpen, state, formAction, isPending } = useDialogFormAction<DeviceFormState>(
    createDeviceAction,
    () => false,
  );

  const succeeded = state && "success" in state;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setCopied(false);
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Register device
      </DialogTrigger>
      <DialogContent>
        {succeeded ? (
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Device registered</DialogTitle>
              <DialogDescription>
                Copy this API key now — it won&apos;t be shown again. Configure it on the device
                (or the on-prem relay in front of it) as a <code>key</code> query parameter on its
                push URL, and set the device&apos;s IP address on this record for an additional
                layer of protection.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
              <code className="flex-1 break-all text-xs">{state.apiKey}</code>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(state.apiKey);
                  setCopied(true);
                }}
              >
                {copied ? <CheckIcon className="text-emerald-600" /> : <CopyIcon />}
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" onClick={() => setOpen(false)}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Register a biometric device</DialogTitle>
              <DialogDescription>
                Use the serial number printed on the device, or the one shown in its network settings menu.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="deviceName">Name</Label>
              <Input id="deviceName" name="deviceName" placeholder="Main entrance" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="deviceIdentifier">Serial number</Label>
              <Input id="deviceIdentifier" name="deviceIdentifier" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="locationName">Location</Label>
              <Input id="locationName" name="locationName" placeholder="Head office" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ipAddress">Device IP address (optional, recommended)</Label>
              <Input id="ipAddress" name="ipAddress" placeholder="192.168.1.50" />
            </div>

            {state && "error" in state ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : null}

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Registering..." : "Register"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
