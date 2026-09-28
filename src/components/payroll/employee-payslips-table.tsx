"use client";

import React from "react";
import {
  WalletIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
  CalendarDaysIcon,
  CreditCardIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmployeePayslipDialog } from "./employee-payslip-dialog";
import { DownloadPayslipButton } from "./pdf-payslip-downloader";
import { PayslipDocumentView, type PayslipRecordData, type CompanyData } from "./payslip-document-view";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface EmployeePayslipsTableProps {
  records: PayslipRecordData[];
  company: CompanyData;
}

export function EmployeePayslipsTable({ records, company }: EmployeePayslipsTableProps) {
  const totalPayslips = records.length;
  const latestRecord = records[0];
  const paidCount = records.filter((r) => r.paymentStatus === "PAID").length;

  return (
    <div className="flex flex-col gap-6 max-w-6xl w-full mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-neutral-200/70 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            My Payslips
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Official monthly salary statements, earnings breakdown, and disbursement records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Verified Portal Access
          </span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs dark:bg-neutral-900 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center dark:bg-blue-950/50 dark:border-blue-800/60 dark:text-blue-400">
              <FileTextIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Statements</p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-0.5 tabular-nums">
                {totalPayslips}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-neutral-400">Lifetime</span>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs dark:bg-neutral-900 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-400">
              <WalletIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Latest Net Salary</p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-0.5 tabular-nums">
                {latestRecord ? `৳${Number(latestRecord.netSalary.toString()).toLocaleString()}` : "—"}
              </p>
            </div>
          </div>
          {latestRecord && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {MONTH_NAMES[latestRecord.payrollPeriod.month - 1].slice(0, 3)} {latestRecord.payrollPeriod.year}
            </span>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs dark:bg-neutral-900 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center dark:bg-amber-950/50 dark:border-amber-800/60 dark:text-amber-400">
              <CheckCircle2Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Disbursed Cycles</p>
              <p className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 mt-0.5 tabular-nums">
                {paidCount} <span className="text-xs font-normal text-neutral-400">/ {totalPayslips}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-neutral-400">Completed</span>
        </div>
      </div>

      {/* Main Single Comprehensive Table */}
      <div className="rounded-2xl border border-neutral-200/80 bg-white overflow-hidden shadow-2xs dark:bg-neutral-900 dark:border-neutral-800">
        <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="size-4 text-neutral-500" />
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Salary Disbursement History
            </h2>
          </div>
          <span className="text-xs text-neutral-400 font-medium">
            {records.length} record{records.length === 1 ? "" : "s"} found
          </span>
        </div>

        {records.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="size-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
              <FileTextIcon className="size-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">No payslips issued yet</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm">
              Your payslips will appear here once the HR payroll cycle for your pay period has been generated.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/70 hover:bg-neutral-50/70 dark:bg-neutral-900/60 text-xs uppercase tracking-wider font-semibold">
                  <TableHead className="font-bold py-3.5">Pay Period</TableHead>
                  <TableHead className="font-bold">Basic Pay</TableHead>
                  <TableHead className="font-bold">Earnings</TableHead>
                  <TableHead className="font-bold">Deductions</TableHead>
                  <TableHead className="font-bold">Net Salary</TableHead>
                  <TableHead className="font-bold">Payment Method</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => {
                  const monthName = MONTH_NAMES[r.payrollPeriod.month - 1];
                  const year = r.payrollPeriod.year;
                  const basic = Number(r.basicSalary.toString());
                  const earnings = Number(r.totalEarnings.toString());
                  const deductions = Number(r.totalDeductions.toString());
                  const net = Number(r.netSalary.toString());
                  const extraEarnings = Math.max(0, earnings - basic);

                  const paymentMethodDisplay =
                    r.paymentMethod === "BANK_TRANSFER"
                      ? "Bank Transfer"
                      : r.paymentMethod === "MOBILE_BANKING"
                        ? "Mobile Banking"
                        : r.paymentMethod === "CASH"
                          ? "Cash"
                          : r.paymentMethod || "Bank Transfer";

                  const directDownloadId = `table-row-payslip-${r.id}`;

                  return (
                    <TableRow key={r.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors">
                      {/* Period */}
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                            {monthName} {year}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            {r.payslip?.payslipNumber ?? `Ref: PAY-${year}${String(r.payrollPeriod.month).padStart(2, "0")}`}
                          </span>
                        </div>
                      </TableCell>

                      {/* Basic Pay */}
                      <TableCell className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        ৳{basic.toLocaleString()}
                      </TableCell>

                      {/* Earnings */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            ৳{earnings.toLocaleString()}
                          </span>
                          {extraEarnings > 0 && (
                            <span className="text-[10px] text-emerald-600 font-medium">
                              +৳{extraEarnings.toLocaleString()} allowances
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Deductions */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-semibold text-rose-600">
                            {deductions > 0 ? `-৳${deductions.toLocaleString()}` : "৳0"}
                          </span>
                          {deductions === 0 && (
                            <span className="text-[10px] text-neutral-400">None</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Net Salary */}
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-mono text-xs font-extrabold shadow-2xs">
                          ৳{net.toLocaleString()}
                        </span>
                      </TableCell>

                      {/* Payment Method */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                          <CreditCardIcon className="size-3.5 text-neutral-400 shrink-0" />
                          <span>{paymentMethodDisplay}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant={r.paymentStatus === "PAID" ? "default" : "secondary"}
                          className="px-2 py-0.5 text-[11px] font-semibold gap-1"
                        >
                          {r.paymentStatus === "PAID" ? (
                            <>
                              <CheckCircle2Icon className="size-3 text-emerald-400" />
                              <span>Paid</span>
                            </>
                          ) : (
                            <>
                              <ClockIcon className="size-3 text-amber-500" />
                              <span>Pending</span>
                            </>
                          )}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <EmployeePayslipDialog
                            record={r}
                            company={company}
                            triggerButtonText="View Payslip"
                          />
                          <DownloadPayslipButton
                            targetId={directDownloadId}
                            fileName={`Payslip_${r.employee.employeeCode}_${monthName}_${year}.pdf`}
                          />
                        </div>

                        {/* Hidden rendered document in DOM for the direct row download button */}
                        <div className="sr-only" aria-hidden="true">
                          <PayslipDocumentView
                            record={r}
                            company={company}
                            elementId={directDownloadId}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
