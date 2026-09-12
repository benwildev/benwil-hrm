"use client";

import { useState } from "react";
import { CreditCardIcon, Building2Icon, SmartphoneIcon, BanknoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDialogFormAction } from "@/hooks/use-dialog-form-action";
import { updateEmployeePaymentDetailsAction, type EmployeeFormState } from "@/server/actions/employees.actions";

interface EditPaymentDetailsDialogProps {
  employeeId: string;
  initialData?: {
    paymentMethod: string;
    bankName?: string | null;
    bankAccountName?: string | null;
    bankAccountNumber?: string | null;
    bankRoutingNumber?: string | null;
    mobileBankingProvider?: string | null;
    mobileBankingNumber?: string | null;
  } | null;
}

export function EditPaymentDetailsDialog({ employeeId, initialData }: EditPaymentDetailsDialogProps) {
  const [method, setMethod] = useState<string>(initialData?.paymentMethod || "BANK_TRANSFER");
  const actionWithId = updateEmployeePaymentDetailsAction.bind(null, employeeId);
  const { open, setOpen, state, formAction, isPending } =
    useDialogFormAction<EmployeeFormState>(
      actionWithId,
      (s) => !s,
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5" />}>
        <CreditCardIcon className="size-3.5" />
        <span>Configure Payout</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Employee Payment &amp; Bank Details</DialogTitle>
            <DialogDescription>
              Specify how this employee receives salary disbursements.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Payment Method Selector */}
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="BANK_TRANSFER">Bank Transfer (Direct Deposit)</option>
                <option value="MOBILE_BANKING">Mobile Banking (bKash / Nagad / Rocket)</option>
                <option value="CASH">Cash in Hand</option>
                <option value="CHECK">Company Cheque</option>
              </select>
            </div>

            {/* Bank Transfer Details */}
            {method === "BANK_TRANSFER" && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Building2Icon className="size-4 text-[#162E51]" />
                  <span>Bank Account Information</span>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bankName" className="text-xs">Bank Name</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    defaultValue={initialData?.bankName || ""}
                    placeholder="e.g. Chase, Bank of America, HSBC"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="bankAccountName" className="text-xs">Account Holder Name</Label>
                    <Input
                      id="bankAccountName"
                      name="bankAccountName"
                      defaultValue={initialData?.bankAccountName || ""}
                      placeholder="e.g. Monsur Ahmed"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bankAccountNumber" className="text-xs">Account Number / IBAN</Label>
                    <Input
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      defaultValue={initialData?.bankAccountNumber || ""}
                      placeholder="e.g. 1234567890"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bankRoutingNumber" className="text-xs">Routing / Swift / Branch Code</Label>
                  <Input
                    id="bankRoutingNumber"
                    name="bankRoutingNumber"
                    defaultValue={initialData?.bankRoutingNumber || ""}
                    placeholder="e.g. 021000021 or SWIFT"
                  />
                </div>
              </div>
            )}

            {/* Mobile Banking Details */}
            {method === "MOBILE_BANKING" && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <SmartphoneIcon className="size-4 text-pink-600" />
                  <span>Mobile Wallet Information</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="mobileBankingProvider" className="text-xs">Provider</Label>
                    <Input
                      id="mobileBankingProvider"
                      name="mobileBankingProvider"
                      defaultValue={initialData?.mobileBankingProvider || "bKash"}
                      placeholder="e.g. bKash, Nagad, Rocket"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="mobileBankingNumber" className="text-xs">Wallet Account Number</Label>
                    <Input
                      id="mobileBankingNumber"
                      name="mobileBankingNumber"
                      defaultValue={initialData?.mobileBankingNumber || ""}
                      placeholder="e.g. +8801700000000"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cash / Check Notes */}
            {(method === "CASH" || method === "CHECK") && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-600 flex items-center gap-2">
                <BanknoteIcon className="size-4 text-emerald-600 shrink-0" />
                <span>
                  {method === "CASH"
                    ? "Salary will be marked for direct cash payout at the finance counter."
                    : "Salary will be disbursed via physical corporate bank cheque."}
                </span>
              </div>
            )}

            {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Payout Details"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
