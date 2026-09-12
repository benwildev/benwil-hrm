import Link from "next/link";
import { ArrowLeftIcon, DownloadIcon, AlertCircleIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RunPayrollButton } from "@/components/payroll/run-payroll-button";
import { LockPayrollButton } from "@/components/payroll/lock-payroll-button";
import { redirect } from "next/navigation";
import { getPayrollPeriod } from "@/server/dal/payroll";
import { getSession } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function PayrollPeriodPage({
  params,
}: {
  params: Promise<{ periodId: string }>;
}) {
  const { periodId } = await params;
  const session = await getSession();
  const canViewAll =
    session?.user.roleName === "Admin" ||
    (session?.user.roleName !== "Employee" &&
      Boolean(session?.user.permissions.includes(PERMISSIONS.PAYROLL_VIEW_ALL)));
  const canRun =
    session?.user.roleName === "Admin" ||
    (session?.user.roleName !== "Employee" &&
      Boolean(session?.user.permissions.includes(PERMISSIONS.PAYROLL_RUN)));

  if (!canViewAll) {
    if (session?.user.employeeId) {
      const myRecord = await prisma.payrollRecord.findFirst({
        where: { payrollPeriodId: periodId, employeeId: session.user.employeeId },
        select: { id: true },
      });
      if (myRecord) {
        redirect(`/payroll/${periodId}/${myRecord.id}`);
      }
    }
    redirect("/payroll/my");
  }

  const period = await getPayrollPeriod(periodId);

  // Check for active employees who were excluded from this period because they have no salary structure.
  // System administrators without salaries are treated as platform operators and exempt from payroll.
  const activeEmployeesWithoutSalary = await prisma.employee.findMany({
    where: {
      deletedAt: null,
      employmentStatus: { in: ["ACTIVE", "ON_LEAVE"] },
      OR: [
        { user: null },
        { user: { role: { name: { not: "Admin" } } } },
      ],
      salaries: {
        none: {
          effectiveFrom: { lte: period.endDate },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: period.startDate } }],
        },
      },
    },
    select: { id: true, fullName: true, employeeCode: true },
  });

  const totalNet = period.records.reduce((sum, r) => sum + Number(r.netSalary), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/payroll" />}>
          <ArrowLeftIcon />
          Back to payroll
        </Button>
        <div className="flex items-center gap-2">
          {period.records.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<a href={`/api/export/payroll/${period.id}/bank-disbursement`} download />}
            >
              <DownloadIcon className="size-4" />
              <span>Export Bank File</span>
            </Button>
          ) : null}
          {canRun && period.status !== "LOCKED" ? (
            <RunPayrollButton periodId={period.id} isRerun={period.status === "COMPLETED"} />
          ) : null}
          {canRun && period.status === "COMPLETED" ? <LockPayrollButton periodId={period.id} /> : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">
          {MONTH_NAMES[period.month - 1]} {period.year}
        </h1>
        <Badge>{period.status}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {period.records.length} employees · Total net {totalNet.toFixed(2)}
      </p>

      {activeEmployeesWithoutSalary.length > 0 && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertCircleIcon className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">
              {activeEmployeesWithoutSalary.length} active employee{activeEmployeesWithoutSalary.length > 1 ? "s are" : " is"} missing from this payroll run
            </p>
            <p className="text-amber-800/90 leading-relaxed">
              The following employee(s) have no basic salary configured:{" "}
              {activeEmployeesWithoutSalary.map((e, idx) => (
                <span key={e.id}>
                  <Link href={`/employees/${e.id}`} className="font-medium underline hover:text-amber-950">
                    {e.fullName} ({e.employeeCode})
                  </Link>
                  {idx < activeEmployeesWithoutSalary.length - 1 ? ", " : ""}
                </span>
              ))}
              . Configure their basic salary under their profile, then click <strong>"Recalculate Payroll"</strong>.
            </p>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Basic</TableHead>
            <TableHead>Earnings</TableHead>
            <TableHead>Deductions</TableHead>
            <TableHead>Net</TableHead>
            <TableHead>Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {period.records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">
                <Link href={`/payroll/${period.id}/${record.id}`} className="hover:underline">
                  {record.employee.fullName}
                </Link>
                <span className="ml-2 text-xs text-muted-foreground">{record.employee.employeeCode}</span>
              </TableCell>
              <TableCell>{record.basicSalary.toString()}</TableCell>
              <TableCell>{record.totalEarnings.toString()}</TableCell>
              <TableCell>{record.totalDeductions.toString()}</TableCell>
              <TableCell className="font-medium">{record.netSalary.toString()}</TableCell>
              <TableCell>
                <Badge variant={record.paymentStatus === "PAID" ? "default" : "secondary"}>
                  {record.paymentStatus}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
