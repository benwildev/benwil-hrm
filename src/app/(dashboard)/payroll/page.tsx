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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewPeriodDialog } from "@/components/payroll/new-period-dialog";
import { getSession } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { listPayrollPeriods, listMyPayslips } from "@/server/dal/payroll";
import { getCompany } from "@/server/dal/company";
import { EmployeePayslipsTable } from "@/components/payroll/employee-payslips-table";

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
  const session = await getSession();
  const canViewAll =
    session?.user.roleName === "Admin" ||
    (session?.user.roleName !== "Employee" &&
      (session?.user.permissions.includes(PERMISSIONS.PAYROLL_VIEW_ALL) ||
       session?.user.permissions.includes(PERMISSIONS.PAYROLL_RUN) ||
       session?.user.permissions.includes(PERMISSIONS.PAYROLL_MANAGE)));
  const company = await getCompany();

  // If user is a regular employee, show their single unified payslips table under this one route (/payroll)
  if (!canViewAll) {
    const myPayslips = await listMyPayslips();
    return (
      <EmployeePayslipsTable
        records={JSON.parse(JSON.stringify(myPayslips))}
        company={JSON.parse(JSON.stringify(company))}
      />
    );
  }

  // Admin view: shows company payroll periods and personal payslips tab
  const [periods, myPayslips] = await Promise.all([
    listPayrollPeriods(),
    listMyPayslips(),
  ]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl w-full mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-neutral-200/70 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            Payroll
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Company payroll runs, salary calculations, and employee payslip statements.
          </p>
        </div>
        <NewPeriodDialog />
      </div>

      <Tabs defaultValue="runs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="runs">Payroll Runs ({periods.length})</TabsTrigger>
          <TabsTrigger value="my">My Personal Payslips ({myPayslips.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="runs" className="space-y-4">
          <div className="rounded-2xl border border-neutral-200/80 bg-white overflow-hidden shadow-2xs dark:bg-neutral-900 dark:border-neutral-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/70 hover:bg-neutral-50/70 dark:bg-neutral-900/60 text-xs uppercase tracking-wider font-semibold">
                  <TableHead className="font-bold py-3.5">Period</TableHead>
                  <TableHead className="font-bold">Records</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((period) => (
                  <TableRow key={period.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                    <TableCell className="font-semibold text-sm">
                      <Link href={`/payroll/${period.id}`} className="hover:underline text-neutral-900 dark:text-neutral-100">
                        {MONTH_NAMES[period.month - 1]} {period.year}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-600 dark:text-neutral-400">
                      {period._count.records} employee{period._count.records === 1 ? "" : "s"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[period.status] ?? "secondary"}>
                        {period.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/payroll/${period.id}`} />}>
                        Manage Run
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="my">
          <EmployeePayslipsTable
            records={JSON.parse(JSON.stringify(myPayslips))}
            company={JSON.parse(JSON.stringify(company))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
