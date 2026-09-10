"use client";

import { PlusIcon } from "lucide-react";
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
  const { open, setOpen, state, formAction, isPending } = useDialogFormAction<DeviceFormState>(
    createDeviceAction,
    (s) => Boolean(s && "success" in s),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Register device
      </DialogTrigger>
      <DialogContent>
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

          {state && "error" in state ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Registering..." : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
