"use client";

import { useState } from "react";
import { BanknoteIcon, Building2Icon, SmartphoneIcon, CheckCircle2Icon } from "lucide-react";
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
import { disbursePayslipAction } from "@/server/actions/payroll.actions";
import type { SimpleFormState } from "@/server/actions/organization.actions";

interface DisbursePaymentDialogProps {
  periodId: string;
  recordId: string;
  employeeName: string;
  netSalary: string;
  employeePaymentDetails?: {
    paymentMethod: string;
    bankName?: string | null;
    bankAccountName?: string | null;
    bankAccountNumber?: string | null;
    bankRoutingNumber?: string | null;
    mobileBankingProvider?: string | null;
    mobileBankingNumber?: string | null;
  } | null;
}

export function DisbursePaymentDialog({
  periodId,
  recordId,
  employeeName,
  netSalary,
  employeePaymentDetails,
}: DisbursePaymentDialogProps) {
  const [method, setMethod] = useState<string>(
    employeePaymentDetails?.paymentMethod || "BANK_TRANSFER",
  );

  const actionWithIds = disbursePayslipAction.bind(null, periodId, recordId);
  const { open, setOpen, state, formAction, isPending } =
    useDialogFormAction<SimpleFormState>(
      actionWithIds,
      (s) => Boolean(s && "success" in s),
    );

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium" />}>
        <BanknoteIcon className="size-4" />
        <span>Disburse Payment</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[88vh] flex flex-col p-6">
        <form action={formAction} className="flex flex-col min-h-0 flex-1">
          <DialogHeader className="shrink-0 pb-1">
            <DialogTitle>Disburse Salary Payment</DialogTitle>
            <DialogDescription>
              Record salary disbursement for {employeeName}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-1 -mr-1 my-1 grid gap-4 py-1 text-xs min-h-0">
            {/* Amount Banner */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Net Amount Payable</p>
                <p className="text-2xl font-black text-emerald-950 mt-0.5">${Number(netSalary).toLocaleString()}</p>
              </div>
              <CheckCircle2Icon className="size-8 text-emerald-600 opacity-80" />
            </div>

            {/* Saved Payment Details Quick Card */}
            {employeePaymentDetails?.paymentMethod === "BANK_TRANSFER" && employeePaymentDetails.bankAccountNumber && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px]">
                  <Building2Icon className="size-3.5 text-[#162E51]" />
                  <span>Target Bank: {employeePaymentDetails.bankName}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  A/C: <span className="font-mono font-medium">{employeePaymentDetails.bankAccountNumber}</span> ({employeePaymentDetails.bankAccountName})
                </p>
                {employeePaymentDetails.bankRoutingNumber && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    Routing/Branch: {employeePaymentDetails.bankRoutingNumber}
                  </p>
                )}
              </div>
            )}

            {employeePaymentDetails?.paymentMethod === "MOBILE_BANKING" && employeePaymentDetails.mobileBankingNumber && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px]">
                  <SmartphoneIcon className="size-3.5 text-pink-600" />
                  <span>Wallet: {employeePaymentDetails.mobileBankingProvider}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Number: <span className="font-mono font-medium">{employeePaymentDetails.mobileBankingNumber}</span>
                </p>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="grid gap-1.5">
              <Label htmlFor="paymentMethod" className="text-xs">Payment Method Used</Label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="BANK_TRANSFER">Bank Transfer (Direct Deposit)</option>
                <option value="MOBILE_BANKING">Mobile Banking (bKash / Nagad / Rocket)</option>
                <option value="CASH">Cash in Hand</option>
                <option value="CHECK">Company Cheque</option>
              </select>
            </div>

            {/* Payout Date & Reference */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="paidAt" className="text-xs">Disbursement Date</Label>
                <Input
                  id="paidAt"
                  name="paidAt"
                  type="date"
                  defaultValue={todayStr}
                  required
                  className="h-9"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="paymentReference" className="text-xs">Transaction / Cheque #</Label>
                <Input
                  id="paymentReference"
                  name="paymentReference"
                  placeholder="e.g. TXN-89234"
                  className="h-9"
                />
              </div>
            </div>

            {/* Payment Note */}
            <div className="grid gap-1.5">
              <Label htmlFor="paymentNote" className="text-xs">Payment Note (Optional)</Label>
              <Input
                id="paymentNote"
                name="paymentNote"
                placeholder="e.g. Cleared via corporate online banking portal"
                className="h-9"
              />
            </div>

            {state && "error" in state ? (
              <p className="text-xs text-destructive">{state.error}</p>
            ) : null}
          </div>

          <DialogFooter className="shrink-0 -mx-6 -mb-6 mt-3 p-4 rounded-b-xl border-t bg-muted/50">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isPending ? "Recording payment..." : "Confirm Disbursement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
