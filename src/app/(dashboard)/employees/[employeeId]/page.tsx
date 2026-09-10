import Link from "next/link";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUploadForm } from "@/components/employees/document-upload-form";
import { DocumentList } from "@/components/employees/document-list";
import { SetSalaryDialog } from "@/components/employees/set-salary-dialog";
import { AssignComponentDialog } from "@/components/employees/assign-component-dialog";
import { RemoveComponentButton } from "@/components/employees/remove-component-button";
import { getEmployee } from "@/server/dal/employees";
import { listSalaryHistory } from "@/server/dal/salaries";
import { listActiveSalaryComponents, listEmployeeSalaryComponents } from "@/server/dal/salary-components";
import { getSession } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value ?? "—"}</span>
    </div>
  );
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  const employee = await getEmployee(employeeId);
  const session = await getSession();
  const canManagePayroll = session?.user.permissions.includes(PERMISSIONS.PAYROLL_MANAGE) ?? false;

  const [salaryHistory, activeComponents, employeeComponents] = canManagePayroll
    ? await Promise.all([
        listSalaryHistory(employeeId),
        listActiveSalaryComponents(),
        listEmployeeSalaryComponents(employeeId),
      ])
    : [[], [], []];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/employees" />}>
          <ArrowLeftIcon />
          Back to employees
        </Button>
        <Button nativeButton={false} render={<Link href={`/employees/${employee.id}/edit`} />}>
          <PencilIcon />
          Edit
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">{employee.fullName}</h1>
        <Badge variant="secondary">{employee.employeeCode}</Badge>
        <Badge>{employee.employmentStatus.replace("_", " ")}</Badge>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="documents">Documents ({employee.documents.length})</TabsTrigger>
          {canManagePayroll ? <TabsTrigger value="salary">Salary</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="info" className="flex flex-col gap-4 pt-4">
          <Card>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InfoRow label="Department" value={employee.department?.name} />
              <InfoRow label="Designation" value={employee.designation?.name} />
              <InfoRow label="Shift" value={employee.shift?.name} />
              <InfoRow label="Reporting manager" value={employee.reportingManager?.fullName} />
              <InfoRow label="Joining date" value={formatDate(employee.joiningDate)} />
              <InfoRow label="Employment type" value={employee.employmentType?.replace("_", " ")} />
              <InfoRow label="Personal email" value={employee.personalEmail} />
              <InfoRow label="Work email" value={employee.workEmail} />
              <InfoRow label="Phone" value={employee.phone} />
              <InfoRow label="Date of birth" value={formatDate(employee.dateOfBirth)} />
              <InfoRow label="Gender" value={employee.gender} />
              <InfoRow label="Marital status" value={employee.maritalStatus} />
              <InfoRow label="Nationality" value={employee.nationality} />
              <InfoRow label="Blood group" value={employee.bloodGroup} />
              <InfoRow label="Present address" value={employee.presentAddress} />
              <InfoRow label="Permanent address" value={employee.permanentAddress} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InfoRow label="Emergency contact" value={employee.emergencyContactName} />
              <InfoRow label="Relationship" value={employee.emergencyContactRelationship} />
              <InfoRow label="Phone" value={employee.emergencyContactPhone} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <InfoRow
                label="System login"
                value={employee.user ? `${employee.user.email} (${employee.user.role.name})` : "No login"}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="flex flex-col gap-4 pt-4">
          <DocumentUploadForm employeeId={employee.id} />
          <DocumentList employeeId={employee.id} documents={employee.documents} />
        </TabsContent>

        {canManagePayroll ? (
          <TabsContent value="salary" className="flex flex-col gap-4 pt-4">
            <Card>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Salary history</h3>
                  <SetSalaryDialog employeeId={employee.id} />
                </div>
                <div className="flex flex-col gap-2">
                  {salaryHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No salary on file yet.</p>
                  ) : (
                    salaryHistory.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                        <span>{s.basicSalary.toString()}</span>
                        <span className="text-muted-foreground">
                          {formatDate(s.effectiveFrom)} — {s.effectiveTo ? formatDate(s.effectiveTo) : "present"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Allowances &amp; deductions</h3>
                  <AssignComponentDialog
                    employeeId={employee.id}
                    components={activeComponents.map((c) => ({
                      id: c.id,
                      name: c.name,
                      componentType: c.componentType,
                    }))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {employeeComponents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No components assigned.</p>
                  ) : (
                    employeeComponents.map((ec) => (
                      <div key={ec.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                        <div>
                          <span className="font-medium">{ec.salaryComponent.name}</span>
                          <span className="ml-2 text-muted-foreground">
                            {ec.amount.toString()}
                            {ec.salaryComponent.calculationType === "PERCENTAGE" ? "%" : ""} ·{" "}
                            {ec.salaryComponent.componentType}
                          </span>
                        </div>
                        <RemoveComponentButton employeeId={employee.id} id={ec.id} />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
