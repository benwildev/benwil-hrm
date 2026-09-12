"use client";

import { useState, useTransition } from "react";
import { SlidersHorizontalIcon, SparklesIcon, CheckCircle2Icon } from "lucide-react";
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
import { adjustPayslipAction } from "@/server/actions/payroll.actions";

interface AdjustPayslipDialogProps {
  periodId: string;
  recordId: string;
  employeeName: string;
  currentBasic: number;
  currentAbsenceDeduction: number;
  currentLateDeduction?: number;
  currentTotalEarnings: number;
  currentTotalDeductions: number;
  currentNet: number;
}

export function AdjustPayslipDialog({
  periodId,
  recordId,
  employeeName,
  currentBasic,
  currentAbsenceDeduction,
  currentLateDeduction = 0,
  currentTotalEarnings,
  currentTotalDeductions,
  currentNet,
}: AdjustPayslipDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [absenceDeduction, setAbsenceDeduction] = useState<number>(currentAbsenceDeduction);
  const [lateDeduction, setLateDeduction] = useState<number>(currentLateDeduction);
  const [bonusAmount, setBonusAmount] = useState<number>(0);
  const [bonusName, setBonusName] = useState<string>("Special Bonus");
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [deductionName, setDeductionName] = useState<string>("Manual Deduction");
  const [adjustmentNote, setAdjustmentNote] = useState<string>("");

  // Calculate live preview
  const previewEarnings = currentTotalEarnings + (bonusAmount || 0);
  const otherDeductions = currentTotalDeductions - currentAbsenceDeduction - currentLateDeduction;
  const previewDeductions = otherDeductions + (absenceDeduction || 0) + (lateDeduction || 0) + (deductionAmount || 0);
  const previewNet = Math.max(0, previewEarnings - previewDeductions);

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        await adjustPayslipAction(periodId, recordId, {
          absenceDeduction,
          lateDeduction,
          bonusAmount: bonusAmount > 0 ? bonusAmount : undefined,
          bonusName: bonusAmount > 0 ? bonusName : undefined,
          deductionAmount: deductionAmount > 0 ? deductionAmount : undefined,
          deductionName: deductionAmount > 0 ? deductionName : undefined,
          adjustmentNote: adjustmentNote.trim() || undefined,
        });
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to adjust payslip.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5" />}>
        <SlidersHorizontalIcon className="size-3.5" />
        <span>Adjust Payslip</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[88vh] flex flex-col p-6">
        <DialogHeader className="shrink-0 pb-1">
          <DialogTitle>Adjust Payslip — {employeeName}</DialogTitle>
          <DialogDescription>
            Override absence deductions, forgive late arrivals, or add manual salary adjustments.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 -mr-1 my-1 grid gap-4 py-1 text-xs min-h-0">
          {/* Absence Deduction Override Card */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-950">Absence Deduction Override</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/60"
                onClick={() => setAbsenceDeduction(0)}
              >
                <SparklesIcon className="size-3 mr-1" />
                Waive Absence (Set to $0)
              </Button>
            </div>
            <p className="text-[11px] text-amber-800/80">
              Current calculated deduction: ${currentAbsenceDeduction.toLocaleString()}. You can reduce, increase, or set it to 0.
            </p>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={absenceDeduction}
                onChange={(e) => setAbsenceDeduction(Number(e.target.value) || 0)}
                className="h-9 bg-white"
              />
            </div>
          </div>

          {/* Late Attendance Deduction Override Card */}
          <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-orange-950">Late Attendance Deduction Override</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100/60"
                onClick={() => setLateDeduction(0)}
              >
                <SparklesIcon className="size-3 mr-1" />
                Waive Late Penalty (Set to $0)
              </Button>
            </div>
            <p className="text-[11px] text-orange-800/80">
              Current calculated late penalty: ${currentLateDeduction.toLocaleString()}. You can reduce, increase, or set it to 0.
            </p>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={lateDeduction}
                onChange={(e) => setLateDeduction(Number(e.target.value) || 0)}
                className="h-9 bg-white"
              />
            </div>
          </div>

          {/* Add Additional Earning / Bonus */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <span className="font-semibold text-slate-800">Add Bonus or Special Earning (Optional)</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px]">Item Name</Label>
                <Input
                  value={bonusName}
                  onChange={(e) => setBonusName(e.target.value)}
                  placeholder="e.g. Overtime, Spot Award"
                  className="h-9 bg-white mt-1"
                />
              </div>
              <div>
                <Label className="text-[11px]">Amount ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={bonusAmount || ""}
                  onChange={(e) => setBonusAmount(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="h-9 bg-white mt-1"
                />
              </div>
            </div>
          </div>

          {/* Add Manual Deduction */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <span className="font-semibold text-slate-800">Add Extra Deduction (Optional)</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px]">Item Name</Label>
                <Input
                  value={deductionName}
                  onChange={(e) => setDeductionName(e.target.value)}
                  placeholder="e.g. Salary Advance, Penalty"
                  className="h-9 bg-white mt-1"
                />
              </div>
              <div>
                <Label className="text-[11px]">Amount ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={deductionAmount || ""}
                  onChange={(e) => setDeductionAmount(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="h-9 bg-white mt-1"
                />
              </div>
            </div>
          </div>

          {/* Reason / Note */}
          <div className="grid gap-1.5">
            <Label className="text-[11px]">Adjustment Reason / Note</Label>
            <Input
              value={adjustmentNote}
              onChange={(e) => setAdjustmentNote(e.target.value)}
              placeholder="e.g. Waived by management due to approved remote work"
              className="h-9"
            />
          </div>

          {/* Live Recalculation Summary */}
          <div className="rounded-xl border border-slate-900/10 bg-slate-900 text-white p-3.5 flex items-center justify-between text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Recalculated Net Pay</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">${previewNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right text-[11px] text-slate-300">
              <p>Gross: ${previewEarnings.toLocaleString()}</p>
              <p>Deductions: -${previewDeductions.toLocaleString()}</p>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter className="shrink-0 -mx-6 -mb-6 mt-3 p-4 rounded-b-xl border-t bg-muted/50">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving changes..." : "Save Adjustments"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
