"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMyContactInfoAction } from "@/server/actions/profile.actions";
import { PhoneIcon, MailIcon, MapPinIcon, UserIcon, Loader2Icon, CheckCircle2Icon, AlertCircleIcon } from "lucide-react";

interface EditContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    phone?: string | null;
    personalEmail?: string | null;
    presentAddress?: string | null;
    emergencyContactName?: string | null;
    emergencyContactRelationship?: string | null;
    emergencyContactPhone?: string | null;
  };
}

export function EditContactDialog({
  open,
  onOpenChange,
  initialData,
}: EditContactDialogProps) {
  const [phone, setPhone] = useState(initialData.phone || "");
  const [personalEmail, setPersonalEmail] = useState(initialData.personalEmail || "");
  const [presentAddress, setPresentAddress] = useState(initialData.presentAddress || "");
  const [emergencyName, setEmergencyName] = useState(initialData.emergencyContactName || "");
  const [emergencyRel, setEmergencyRel] = useState(initialData.emergencyContactRelationship || "");
  const [emergencyPhone, setEmergencyPhone] = useState(initialData.emergencyContactPhone || "");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("personalEmail", personalEmail);
    formData.append("presentAddress", presentAddress);
    formData.append("emergencyContactName", emergencyName);
    formData.append("emergencyContactRelationship", emergencyRel);
    formData.append("emergencyContactPhone", emergencyPhone);

    startTransition(async () => {
      const res = await updateMyContactInfoAction(undefined, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess("Contact details updated successfully!");
        setTimeout(() => {
          onOpenChange(false);
          setSuccess(null);
        }, 1200);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-neutral-900">
            Edit Contact Details
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Keep your personal and emergency contact information current.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              <AlertCircleIcon className="size-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
              <CheckCircle2Icon className="size-4 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <PhoneIcon className="size-3.5" />
              Personal Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-neutral-700">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700-000000"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="personalEmail" className="text-xs font-semibold text-neutral-700">
                  Personal Email
                </Label>
                <Input
                  id="personalEmail"
                  type="email"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="presentAddress" className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                <MapPinIcon className="size-3 text-neutral-400" />
                Present Address
              </Label>
              <Input
                id="presentAddress"
                value={presentAddress}
                onChange={(e) => setPresentAddress(e.target.value)}
                placeholder="House, Street, Area, City"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
              <UserIcon className="size-3.5" />
              Emergency Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="emergencyName" className="text-xs font-semibold text-neutral-700">
                  Contact Person
                </Label>
                <Input
                  id="emergencyName"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Full Name"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergencyRel" className="text-xs font-semibold text-neutral-700">
                  Relationship
                </Label>
                <Input
                  id="emergencyRel"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  placeholder="Spouse, Sibling, Parent"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emergencyPhone" className="text-xs font-semibold text-neutral-700">
                  Emergency Phone
                </Label>
                <Input
                  id="emergencyPhone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+880 1..."
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-[#162E51] hover:bg-[#0D1C33] text-white"
            >
              {isPending ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
