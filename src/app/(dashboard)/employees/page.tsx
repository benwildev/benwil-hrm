import Link from "next/link";
import { PlusIcon, DownloadIcon, PencilIcon } from "lucide-react";
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
import { DeleteEmployeeButton } from "@/components/employees/delete-employee-button";
import { listEmployees } from "@/server/dal/employees";
import { getSession } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  ON_LEAVE: "secondary",
  RESIGNED: "secondary",
  TERMINATED: "destructive",
  INACTIVE: "secondary",
};

export default async function EmployeesPage() {
  const [employees, session] = await Promise.all([listEmployees(), getSession()]);
  const canManage = session?.user.permissions.includes(PERMISSIONS.EMPLOYEES_MANAGE) ?? false;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Employees</h1>
          <p className="text-sm text-muted-foreground">{employees.length} employees</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" nativeButton={false} render={<a href="/api/export/employees" />}>
            <DownloadIcon />
            Export CSV
          </Button>
          <Button nativeButton={false} render={<Link href="/employees/new" />}>
            <PlusIcon />
            New employee
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Employee code</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Status</TableHead>
            {canManage ? <TableHead className="text-right">Actions</TableHead> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                <Link href={`/employees/${employee.id}`} className="hover:underline">
                  {employee.fullName}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{employee.employeeCode}</TableCell>
              <TableCell>{employee.department?.name ?? "—"}</TableCell>
              <TableCell>{employee.designation?.name ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[employee.employmentStatus] ?? "secondary"}>
                  {employee.employmentStatus.replace("_", " ")}
                </Badge>
              </TableCell>
              {canManage ? (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      nativeButton={false}
                      render={<Link href={`/employees/${employee.id}/edit`} />}
                    >
                      <PencilIcon />
                      <span className="sr-only">Edit {employee.fullName}</span>
                    </Button>
                    <DeleteEmployeeButton employeeId={employee.id} employeeName={employee.fullName} />
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
