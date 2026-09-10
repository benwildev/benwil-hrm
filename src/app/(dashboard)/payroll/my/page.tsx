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
import { listMyPayslips } from "@/server/dal/payroll";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function MyPayslipsPage() {
  const records = await listMyPayslips();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/payroll" />}>
          <ArrowLeftIcon />
          Back to payroll
        </Button>
      </div>

      <div>
        <h1 className="text-xl font-semibold">My payslips</h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Net pay</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">
                <Link href={`/payroll/${r.payrollPeriodId}/${r.id}`} className="hover:underline">
                  {MONTH_NAMES[r.payrollPeriod.month - 1]} {r.payrollPeriod.year}
                </Link>
              </TableCell>
              <TableCell>{r.netSalary.toString()}</TableCell>
              <TableCell>
                <Badge variant={r.paymentStatus === "PAID" ? "default" : "secondary"}>{r.paymentStatus}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
