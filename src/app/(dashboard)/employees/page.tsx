import Link from "next/link";
import { PlusIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listEmployees } from "@/server/dal/employees";
import { listDepartments } from "@/server/dal/organization";
import { getSession } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { EmployeeDirectoryView } from "@/components/employees/employee-directory-view";

export default async function EmployeesPage() {
  const [employees, departments, session] = await Promise.all([
    listEmployees(),
    listDepartments(),
    getSession(),
  ]);

  const canManage = session?.user.permissions.includes(PERMISSIONS.EMPLOYEES_MANAGE) ?? false;

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Top Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>Workforce</span>
            <span>/</span>
            <span className="text-foreground">Personnel Roster</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Employees
            </h1>
            <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/50 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {employees.length} Total
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage personnel directory, department structures, roles, and profiles.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href="/api/export/employees" />}
            className="h-9 gap-2 rounded-xl border-border/80 bg-background/80 px-3.5 text-xs font-medium shadow-2xs hover:bg-muted/60"
          >
            <DownloadIcon className="h-3.5 w-3.5 text-muted-foreground" />
            Export CSV
          </Button>
          {canManage ? (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/employees/new" />}
              className="h-9 gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background shadow-sm hover:bg-foreground/90 transition-transform active:scale-98"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add Employee
            </Button>
          ) : null}
        </div>
      </div>

      {/* Main Interactive Directory Component */}
      <EmployeeDirectoryView
        employees={employees}
        departments={departments}
        canManage={canManage}
      />
    </div>
  );
}
