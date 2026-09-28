"use client";

import React, { useState } from "react";
import { FileTextIcon, PrinterIcon, EyeIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DownloadPayslipButton } from "@/components/payroll/pdf-payslip-downloader";
import { PayslipDocumentView, type PayslipRecordData, type CompanyData } from "./payslip-document-view";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface EmployeePayslipDialogProps {
  record: PayslipRecordData;
  company: CompanyData;
  triggerButtonText?: string;
  triggerButtonVariant?: "default" | "outline" | "secondary" | "ghost";
}

export function EmployeePayslipDialog({
  record,
  company,
  triggerButtonText = "View Payslip",
  triggerButtonVariant = "outline",
}: EmployeePayslipDialogProps) {
  const [open, setOpen] = useState(false);
  const elementId = `payslip-modal-doc-${record.id}`;
  const monthName = MONTH_NAMES[record.payrollPeriod.month - 1];
  const year = record.payrollPeriod.year;
  const fileName = `Payslip_${record.employee.employeeCode}_${monthName}_${year}.pdf`;

  const handlePrint = () => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; margin: 20px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; }
            @page { size: A4 portrait; margin: 10mm; }
          </style>
        </head>
        <body>
          ${el.outerHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant={triggerButtonVariant}
            size="sm"
            className="h-8 gap-1.5 rounded-lg text-xs font-semibold cursor-pointer"
          />
        }
      >
        <EyeIcon className="size-3.5" />
        <span>{triggerButtonText}</span>
      </DialogTrigger>

      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl flex flex-col max-h-[92vh]">
        <DialogHeader className="p-4 sm:p-5 border-b border-border/80 bg-neutral-50/80 dark:bg-neutral-900/80 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <FileTextIcon className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Salary Statement &middot; {monthName} {year}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Official employee payslip statement for {record.employee.fullName}
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              <PrinterIcon className="size-3.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <DownloadPayslipButton targetId={elementId} fileName={fileName} />
          </div>
        </DialogHeader>

        <div className="overflow-y-auto p-4 sm:p-6 bg-neutral-100/60 dark:bg-neutral-950/40 flex-1">
          <PayslipDocumentView
            record={record}
            company={company}
            elementId={elementId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
