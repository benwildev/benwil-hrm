import Link from "next/link";
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
import { NewPeriodDialog } from "@/components/payroll/new-period-dialog";
import { listPayrollPeriods } from "@/server/dal/payroll";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  PROCESSING: "secondary",
  COMPLETED: "default",
  LOCKED: "destructive",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function PayrollPage() {
  const periods = await listPayrollPeriods();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Payroll</h1>
          <p className="text-sm text-muted-foreground">Monthly payroll runs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/payroll/my" />}>
            My payslips
          </Button>
          <NewPeriodDialog />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Records</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.map((period) => (
            <TableRow key={period.id}>
              <TableCell className="font-medium">
                <Link href={`/payroll/${period.id}`} className="hover:underline">
                  {MONTH_NAMES[period.month - 1]} {period.year}
                </Link>
              </TableCell>
              <TableCell>{period._count.records}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[period.status] ?? "secondary"}>{period.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
