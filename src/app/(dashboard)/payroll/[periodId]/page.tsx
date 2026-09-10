import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
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
import { getPayrollPeriod } from "@/server/dal/payroll";

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
  const period = await getPayrollPeriod(periodId);

  const totalNet = period.records.reduce((sum, r) => sum + Number(r.netSalary), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/payroll" />}>
          <ArrowLeftIcon />
          Back to payroll
        </Button>
        <div className="flex items-center gap-2">
          {period.status === "DRAFT" || period.status === "PROCESSING" ? (
            <RunPayrollButton periodId={period.id} />
          ) : null}
          {period.status === "COMPLETED" ? <LockPayrollButton periodId={period.id} /> : null}
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
