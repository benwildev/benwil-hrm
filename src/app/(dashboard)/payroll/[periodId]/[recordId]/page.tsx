import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PrintButton } from "@/components/payroll/print-button";
import { MarkPaidButton } from "@/components/payroll/mark-paid-button";
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

  const canManage = session?.user.permissions.includes(PERMISSIONS.PAYROLL_RUN) ?? false;
  const earnings = record.items.filter((i) => i.type === "EARNING");
  const deductions = record.items.filter((i) => i.type === "DEDUCTION");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href={`/payroll/${periodId}`} />}>
          <ArrowLeftIcon />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <PrintButton />
          {canManage && record.paymentStatus !== "PAID" ? (
            <MarkPaidButton periodId={periodId} recordId={record.id} />
          ) : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Payslip — {MONTH_NAMES[record.payrollPeriod.month - 1]} {record.payrollPeriod.year}
              </p>
            </div>
            <Badge variant={record.paymentStatus === "PAID" ? "default" : "secondary"}>
              {record.paymentStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Employee</p>
              <p>{record.employee.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Employee code</p>
              <p>{record.employee.employeeCode}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payslip #</p>
              <p>{record.payslip?.payslipNumber ?? "—"}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Earnings</h3>
              {earnings.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span>{item.name}</span>
                  <span>{item.amount.toString()}</span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Total earnings</span>
                <span>{record.totalEarnings.toString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Deductions</h3>
              {deductions.length === 0 ? (
                <p className="text-sm text-muted-foreground">None</p>
              ) : (
                deductions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.name}</span>
                    <span>{item.amount.toString()}</span>
                  </div>
                ))
              )}
              <Separator />
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Total deductions</span>
                <span>{record.totalDeductions.toString()}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Net pay</span>
            <span>{record.netSalary.toString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
