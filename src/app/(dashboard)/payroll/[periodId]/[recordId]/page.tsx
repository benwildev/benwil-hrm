import Link from "next/link";
import { ArrowLeftIcon, Building2Icon, CheckCircle2Icon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/payroll/print-button";
import { DownloadPayslipButton } from "@/components/payroll/pdf-payslip-downloader";
import { AdjustPayslipDialog } from "@/components/payroll/adjust-payslip-dialog";
import { DisbursePaymentDialog } from "@/components/payroll/disburse-payment-dialog";
import { ResetPaymentButton } from "@/components/payroll/reset-payment-button";
import { getPayrollRecord } from "@/server/dal/payroll";
import { getCompany } from "@/server/dal/company";
import { getSession } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function PayslipPage({
  params,
}: {
  params: Promise<{ periodId: string; recordId: string }>;
}) {
  const { periodId, recordId } = await params;
  const [record, company, session] = await Promise.all([
    getPayrollRecord(recordId),
    getCompany(),
    getSession(),
  ]);

  const canManage =
    session?.user.roleName === "Admin" ||
    (session?.user.roleName !== "Employee" &&
      Boolean(session?.user.permissions.includes(PERMISSIONS.PAYROLL_RUN)));
  const canViewAll =
    session?.user.roleName === "Admin" ||
    (session?.user.roleName !== "Employee" &&
      Boolean(session?.user.permissions.includes(PERMISSIONS.PAYROLL_VIEW_ALL)));
  const earnings = record.items.filter((i) => i.type === "EARNING");
  const deductions = record.items.filter((i) => i.type === "DEDUCTION");
  const monthName = MONTH_NAMES[record.payrollPeriod.month - 1];
  const year = record.payrollPeriod.year;
  const payslipNumber = record.payslip?.payslipNumber ?? `PAY-${year}${String(record.payrollPeriod.month).padStart(2, "0")}-${record.employee.employeeCode}`;

  const fullAddress = [company.addressLine, company.city, company.state, company.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={canViewAll ? `/payroll/${periodId}` : "/payroll"} />}
        >
          <ArrowLeftIcon className="size-4" />
          <span>{canViewAll ? "Back to Payroll Run" : "Back to Payslips"}</span>
        </Button>

        <div className="flex items-center gap-2">
          <DownloadPayslipButton
            targetId="branded-payslip-document"
            fileName={`Payslip_${record.employee.employeeCode}_${monthName}_${year}.pdf`}
          />
          <PrintButton />
          {canManage && record.payrollPeriod.status !== "LOCKED" && record.paymentStatus !== "PAID" ? (
            <AdjustPayslipDialog
              periodId={periodId}
              recordId={record.id}
              employeeName={record.employee.fullName}
              currentBasic={Number(record.basicSalary)}
              currentAbsenceDeduction={
                Number(record.items.find((i) => i.name === "Absence Deduction")?.amount || 0)
              }
              currentLateDeduction={
                Number(record.items.find((i) => i.name === "Late Attendance Deduction")?.amount || 0)
              }
              currentTotalEarnings={Number(record.totalEarnings)}
              currentTotalDeductions={Number(record.totalDeductions)}
              currentNet={Number(record.netSalary)}
            />
          ) : null}
          {canManage && record.paymentStatus !== "PAID" ? (
            <DisbursePaymentDialog
              periodId={periodId}
              recordId={record.id}
              employeeName={record.employee.fullName}
              netSalary={record.netSalary.toString()}
              employeePaymentDetails={{
                paymentMethod: record.employee.paymentMethod,
                bankName: record.employee.bankName,
                bankAccountName: record.employee.bankAccountName,
                bankAccountNumber: record.employee.bankAccountNumber,
                bankRoutingNumber: record.employee.bankRoutingNumber,
                mobileBankingProvider: record.employee.mobileBankingProvider,
                mobileBankingNumber: record.employee.mobileBankingNumber,
              }}
            />
          ) : null}
          {canManage && record.paymentStatus === "PAID" && record.payrollPeriod.status !== "LOCKED" ? (
            <ResetPaymentButton periodId={periodId} recordId={record.id} />
          ) : null}
        </div>
      </div>

      {/* Branded Executive Payslip Document */}
      <div
        id="branded-payslip-document"
        className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm print:border-none print:p-0 print:shadow-none"
        style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-start gap-4">
            {company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logoUrl}
                alt={company.name}
                crossOrigin="anonymous"
                className="h-14 w-auto max-w-[160px] object-contain rounded-md"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-lg shadow-sm">
                <Building2Icon className="size-7 text-slate-200" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                {company.name}
              </h2>
              {company.legalName && company.legalName !== company.name && (
                <p className="text-xs text-slate-500 font-medium">{company.legalName}</p>
              )}
              {fullAddress && (
                <p className="text-xs text-slate-500 mt-1 max-w-xs">{fullAddress}</p>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                {company.email && <span>Email: {company.email}</span>}
                {company.phone && <span>Tel: {company.phone}</span>}
                {company.taxId && <span>Tax ID: {company.taxId}</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
            <span className="inline-block px-2.5 py-1 rounded text-[11px] font-bold tracking-wider uppercase bg-slate-100 text-slate-800">
              Salary Statement
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">
              {monthName} {year}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Ref: <span className="font-semibold text-slate-700">{payslipNumber}</span>
            </p>
            <div className="mt-2">
              <Badge
                variant={record.paymentStatus === "PAID" ? "default" : "secondary"}
                className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
              >
                {record.paymentStatus === "PAID" ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2Icon className="size-3 text-emerald-300" /> Paid
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="size-3 text-amber-500" /> Pending
                  </span>
                )}
              </Badge>
            </div>
          </div>
        </div>

        {/* Employee Profile Metadata Grid */}
        <div className="my-6 rounded-xl bg-slate-50 p-5 border border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Employee Name</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{record.employee.fullName}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Employee ID</p>
              <p className="text-sm font-semibold font-mono text-slate-900 mt-0.5">{record.employee.employeeCode}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Department</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{record.employee.department?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Designation</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{record.employee.designation?.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Work Email</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5 truncate">{record.employee.workEmail ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Joining Date</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">
                {record.employee.joiningDate ? new Date(record.employee.joiningDate).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Pay Period</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">
                01 {monthName.slice(0, 3)} - {new Date(year, record.payrollPeriod.month, 0).getDate()} {monthName.slice(0, 3)} {year}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Payment Method</p>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">
                {record.paymentMethod
                  ? record.paymentMethod === "BANK_TRANSFER"
                    ? `Bank Transfer ${record.employee.bankName ? `(${record.employee.bankName})` : ""}`
                    : record.paymentMethod === "MOBILE_BANKING"
                      ? `Mobile Banking ${record.employee.mobileBankingProvider ? `(${record.employee.mobileBankingProvider})` : ""}`
                      : record.paymentMethod === "CASH"
                        ? "Cash in Hand"
                        : "Company Cheque"
                  : record.employee.paymentMethod === "BANK_TRANSFER"
                    ? `Bank Transfer ${record.employee.bankName ? `(${record.employee.bankName})` : ""}`
                    : record.employee.paymentMethod === "MOBILE_BANKING"
                      ? `Mobile Banking ${record.employee.mobileBankingProvider ? `(${record.employee.mobileBankingProvider})` : ""}`
                      : record.employee.paymentMethod === "CASH"
                        ? "Cash in Hand"
                        : "Company Cheque"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium uppercase tracking-wider text-[10px]">Disbursement Status</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">
                {record.paidAt ? (
                  <span>
                    Paid on {new Date(record.paidAt).toLocaleDateString()}
                    {record.paymentReference ? ` · Ref: ${record.paymentReference}` : ""}
                  </span>
                ) : (
                  "Pending Disbursement"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Salary Breakdown (Earnings & Deductions) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-6">
          {/* Earnings */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Earnings</h3>
              <span className="text-xs text-slate-500 font-semibold">Amount</span>
            </div>
            <div className="flex flex-col divide-y divide-slate-100 min-h-[140px]">
              {earnings.map((item) => (
                <div key={item.id} className="py-2.5 flex items-start justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-800">{item.name}</span>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <span className="font-semibold text-slate-900">{item.amount.toString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-900 bg-slate-50/80 px-3 py-2 rounded-lg">
              <span>Total Gross Earnings</span>
              <span>{record.totalEarnings.toString()}</span>
            </div>
          </div>

          {/* Deductions */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Deductions</h3>
              <span className="text-xs text-slate-500 font-semibold">Amount</span>
            </div>
            <div className="flex flex-col divide-y divide-slate-100 min-h-[140px]">
              {deductions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 italic">
                  No deductions applied for this period.
                </div>
              ) : (
                deductions.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-start justify-between text-xs">
                    <div>
                      <span className="font-medium text-slate-800">{item.name}</span>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      )}
                    </div>
                    <span className="font-semibold text-rose-600">-{item.amount.toString()}</span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-auto pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-900 bg-slate-50/80 px-3 py-2 rounded-lg">
              <span>Total Deductions</span>
              <span className="text-rose-600">-{record.totalDeductions.toString()}</span>
            </div>
          </div>
        </div>

        {/* Net Salary Highlight Box */}
        <div className="my-6 rounded-xl bg-slate-900 text-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Net Payable Amount</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Gross Earnings ({record.totalEarnings.toString()}) minus Deductions ({record.totalDeductions.toString()})
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {record.netSalary.toString()}
            </span>
          </div>
        </div>

        {/* Legal & Sign-Off Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-slate-500">
          <div>
            <p className="font-medium text-slate-600">
              This is a system-generated official payslip issued by {company.name}.
            </p>
            <p className="mt-0.5">
              Verified & issued electronically. Confidential and intended solely for the designated recipient.
            </p>
          </div>
          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6">
            <div className="h-8 border-b border-dashed border-slate-300 w-36 mb-1"></div>
            <p className="font-semibold text-slate-700">Authorized Signatory</p>
            <p className="text-[10px] text-slate-400">HR & Payroll Department</p>
          </div>
        </div>
      </div>
    </div>
  );
}
