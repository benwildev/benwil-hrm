import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportCsvForm } from "@/components/attendance/import-csv-form";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export default async function ImportAttendancePage() {
  await requirePermission(PERMISSIONS.DEVICES_MANAGE);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/attendance" />}>
          <ArrowLeftIcon />
          Back to attendance
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import punches from CSV</CardTitle>
          <CardDescription>
            For devices or exports that can&apos;t push directly. The file needs a header row with{" "}
            <code className="rounded bg-muted px-1">employeeCode</code> and{" "}
            <code className="rounded bg-muted px-1">punchTime</code> columns, e.g.:
            <pre className="mt-2 rounded-lg bg-muted p-3 text-xs">
{`employeeCode,punchTime
EMP-0001,2024-01-15 09:03:12
EMP-0001,2024-01-15 18:01:45`}
            </pre>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImportCsvForm />
        </CardContent>
      </Card>
    </div>
  );
}
