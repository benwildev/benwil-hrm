import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilIcon,
  MailIcon,
  PhoneIcon,
  Building2Icon,
  BriefcaseIcon,
  ClockIcon,
  UserCheckIcon,
  ShieldAlertIcon,
  KeyIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  GlobeIcon,
  UserIcon,
  SmartphoneIcon,
  BanknoteIcon,
  CreditCardIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentUploadForm } from "@/components/employees/document-upload-form";
import { DocumentList } from "@/components/employees/document-list";
import { SetSalaryDialog } from "@/components/employees/set-salary-dialog";
import { AssignComponentDialog } from "@/components/employees/assign-component-dialog";
import { RemoveComponentButton } from "@/components/employees/remove-component-button";
import { EditPaymentDetailsDialog } from "@/components/employees/edit-payment-details-dialog";
import { ChangeRoleDialog } from "@/components/employees/change-role-dialog";
import { ChangePasswordDialog } from "@/components/employees/change-password-dialog";
import { CreatePortalAccessDialog } from "@/components/employees/create-portal-access-dialog";
import { getEmployee } from "@/server/dal/employees";
import { listSalaryHistory } from "@/server/dal/salaries";
import { listRolesForAssignment } from "@/server/dal/roles";
import {
  listActiveSalaryComponents,
  listEmployeeSalaryComponents,
} from "@/server/dal/salary-components";
import { getSession } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function InfoItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-background/50 p-3 transition-colors hover:bg-muted/30">
      {Icon && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground truncate">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<
  string,
  { label: string; dotColor: string; badgeClass: string }
> = {
  ACTIVE: {
    label: "Active",
    dotColor: "bg-emerald-500 ring-emerald-500/20",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
  },
  ON_LEAVE: {
    label: "On Leave",
    dotColor: "bg-amber-500 ring-amber-500/20",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
  },
  RESIGNED: {
    label: "Resigned",
    dotColor: "bg-zinc-400 ring-zinc-400/20",
    badgeClass:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  },
  TERMINATED: {
    label: "Terminated",
    dotColor: "bg-rose-500 ring-rose-500/20",
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50",
  },
  INACTIVE: {
    label: "Inactive",
    dotColor: "bg-zinc-400 ring-zinc-400/20",
    badgeClass:
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
  },
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  const employee = await getEmployee(employeeId);
  const session = await getSession();
  const canManagePayroll =
    session?.user.permissions.includes(PERMISSIONS.PAYROLL_MANAGE) ?? false;
  const canManage =
    session?.user.permissions.includes(PERMISSIONS.EMPLOYEES_MANAGE) ?? false;

  const [salaryHistory, activeComponents, employeeComponents, roles] = await Promise.all([
    canManagePayroll ? listSalaryHistory(employeeId) : Promise.resolve([]),
    canManagePayroll ? listActiveSalaryComponents() : Promise.resolve([]),
    canManagePayroll ? listEmployeeSalaryComponents(employeeId) : Promise.resolve([]),
    canManage ? listRolesForAssignment() : Promise.resolve([]),
  ]);

  const statusInfo =
    STATUS_CONFIG[employee.employmentStatus] ?? STATUS_CONFIG.ACTIVE;
  const initials = getInitials(employee.fullName);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* Top Breadcrumb & Return Action */}
      <div className="flex items-center justify-between">
        <Link
          href="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Personnel Roster</span>
        </Link>
        {canManage && (
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={`/employees/${employee.id}/edit`} />}
            className="h-9 gap-2 rounded-xl bg-foreground px-4 text-xs font-semibold text-background shadow-sm hover:bg-foreground/90 transition-transform active:scale-98"
          >
            <PencilIcon className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Hero Profile Banner */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-b from-card to-card/60 p-6 shadow-xs backdrop-blur-xs">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            {employee.profilePhotoUrl ? (
              <img
                src={employee.profilePhotoUrl}
                alt={employee.fullName}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-md ring-4 ring-background border border-border/80"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-2xl font-bold text-white shadow-md ring-4 ring-background">
                {initials}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {employee.fullName}
                </h1>
                <span className="inline-flex items-center rounded-md border border-border/70 bg-muted/60 px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                  {employee.employeeCode}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusInfo.badgeClass}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ring-2 ${statusInfo.dotColor}`}
                  />
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {employee.designation && (
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <BriefcaseIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {employee.designation.name}
                  </span>
                )}
                {employee.department && (
                  <span className="flex items-center gap-1">
                    <Building2Icon className="h-3.5 w-3.5" />
                    {employee.department.name}
                  </span>
                )}
                {employee.workEmail && (
                  <span className="flex items-center gap-1">
                    <MailIcon className="h-3.5 w-3.5" />
                    {employee.workEmail}
                  </span>
                )}
                {employee.phone && (
                  <span className="flex items-center gap-1">
                    <PhoneIcon className="h-3.5 w-3.5" />
                    {employee.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="h-11 rounded-2xl border border-border/70 bg-muted/40 p-1">
          <TabsTrigger
            value="info"
            className="rounded-xl px-5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            Personnel Overview
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-xl px-5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
          >
            Documents ({employee.documents.length})
          </TabsTrigger>
          {canManagePayroll ? (
            <TabsTrigger
              value="salary"
              className="rounded-xl px-5 text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              Compensation &amp; Payroll
            </TabsTrigger>
          ) : null}
        </TabsList>

        {/* Tab 1: Info Overview */}
        <TabsContent value="info" className="space-y-6 outline-hidden">
          {/* Employment & Organization */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#162E51]/10 text-[#162E51]">
                <BriefcaseIcon className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                Employment &amp; Organization Structure
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                label="Department"
                value={employee.department?.name}
                icon={Building2Icon}
              />
              <InfoItem
                label="Designation"
                value={employee.designation?.name}
                icon={BriefcaseIcon}
              />
              <InfoItem
                label="Working Shift"
                value={employee.shift?.name}
                icon={ClockIcon}
              />
              <InfoItem
                label="Reporting Manager"
                value={employee.reportingManager?.fullName}
                icon={UserCheckIcon}
              />
              <InfoItem
                label="Joining Date"
                value={formatDate(employee.joiningDate)}
                icon={CalendarIcon}
              />
              <InfoItem
                label="Employment Type"
                value={employee.employmentType?.replace("_", " ")}
                icon={UserIcon}
              />
            </div>
          </div>

          {/* Contact Details & Residence */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MailIcon className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                Contact &amp; Residential Information
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                label="Work Email"
                value={employee.workEmail}
                icon={MailIcon}
              />
              <InfoItem
                label="Personal Email"
                value={employee.personalEmail}
                icon={MailIcon}
              />
              <InfoItem label="Primary Phone" value={employee.phone} icon={PhoneIcon} />
              <div className="sm:col-span-2 lg:col-span-3">
                <InfoItem
                  label="Present Residential Address"
                  value={employee.presentAddress}
                  icon={MapPinIcon}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <InfoItem
                  label="Permanent Address"
                  value={employee.permanentAddress || employee.presentAddress}
                  icon={MapPinIcon}
                />
              </div>
            </div>
          </div>

          {/* Personal Demographics */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <UserIcon className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                Personal Demographics
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Date of Birth"
                value={formatDate(employee.dateOfBirth)}
                icon={CalendarIcon}
              />
              <InfoItem label="Gender" value={employee.gender} icon={UserIcon} />
              <InfoItem
                label="Marital Status"
                value={employee.maritalStatus}
                icon={UserIcon}
              />
              <InfoItem
                label="Nationality"
                value={employee.nationality}
                icon={GlobeIcon}
              />
              <InfoItem
                label="Blood Group"
                value={employee.bloodGroup}
                icon={HeartIcon}
              />
            </div>
          </div>

          {/* Emergency Contact & Login Access Bento Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Emergency Contact */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <ShieldAlertIcon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  Emergency Contact
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoItem
                  label="Contact Person"
                  value={employee.emergencyContactName}
                  icon={UserIcon}
                />
                <InfoItem
                  label="Relationship"
                  value={employee.emergencyContactRelationship}
                  icon={UserIcon}
                />
                <InfoItem
                  label="Emergency Phone"
                  value={employee.emergencyContactPhone}
                  icon={PhoneIcon}
                />
              </div>
            </div>

            {/* System Portal Access */}
            <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <KeyIcon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  System Portal Access
                </h2>
              </div>
              <div>
                {employee.user ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <KeyIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground block">
                          {employee.user.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Role: {employee.user.role.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canManage && (
                        <>
                          <ChangeRoleDialog
                            userId={employee.user.id}
                            employeeId={employee.id}
                            employeeName={employee.fullName}
                            userEmail={employee.user.email}
                            currentRoleId={employee.user.roleId}
                            currentRoleName={employee.user.role.name}
                            roles={roles}
                          />
                          <ChangePasswordDialog
                            userId={employee.user.id}
                            employeeId={employee.id}
                            employeeName={employee.fullName}
                            userEmail={employee.user.email}
                          />
                        </>
                      )}
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Active Login
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3.5">
                    <span className="text-sm text-muted-foreground">
                      No system portal login configured for this employee.
                    </span>
                    {canManage && (
                      <CreatePortalAccessDialog
                        employeeId={employee.id}
                        employeeName={employee.fullName}
                        defaultEmail={employee.workEmail || employee.personalEmail || ""}
                        roles={roles}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Documents */}
        <TabsContent value="documents" className="space-y-6 outline-hidden">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Upload New Personnel Document
            </h2>
            <DocumentUploadForm employeeId={employee.id} />
          </div>
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Stored Personnel Documents
            </h2>
            <DocumentList
              employeeId={employee.id}
              documents={employee.documents}
            />
          </div>
        </TabsContent>

        {/* Tab 3: Salary / Compensation */}
        {canManagePayroll ? (
          <TabsContent value="salary" className="space-y-6 outline-hidden">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Base Salary History
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Historical record of agreed basic compensation tiers.
                  </p>
                </div>
                <SetSalaryDialog employeeId={employee.id} />
              </div>
              <div className="space-y-2">
                {salaryHistory.length === 0 ? (
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    No basic salary records currently on file for this personnel.
                  </div>
                ) : (
                  salaryHistory.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-3.5 text-sm"
                    >
                      <span className="font-semibold text-foreground">
                        ${Number(s.basicSalary).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Effective: {formatDate(s.effectiveFrom)} —{" "}
                        {s.effectiveTo ? formatDate(s.effectiveTo) : "Present"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Allowances &amp; Deductions
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Assigned recurring components for monthly payroll calculation.
                  </p>
                </div>
                <AssignComponentDialog
                  employeeId={employee.id}
                  components={activeComponents.map((c) => ({
                    id: c.id,
                    name: c.name,
                    componentType: c.componentType,
                  }))}
                />
              </div>
              <div className="space-y-2">
                {employeeComponents.length === 0 ? (
                  <div className="rounded-xl border border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                    No recurring allowances or deductions assigned yet.
                  </div>
                ) : (
                  employeeComponents.map((ec) => (
                    <div
                      key={ec.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-3.5 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">
                          {ec.salaryComponent.name}
                        </span>
                        <Badge variant="outline" className="text-xs font-normal">
                          {ec.salaryComponent.componentType}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          {ec.salaryComponent.calculationType === "PERCENTAGE"
                            ? `${ec.amount}%`
                            : `$${Number(ec.amount).toLocaleString()}`}
                        </span>
                      </div>
                      <RemoveComponentButton employeeId={employee.id} id={ec.id} />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Method & Bank Details */}
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Payment Method &amp; Bank Details
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Target account and disbursement destination for monthly payroll.
                  </p>
                </div>
                <EditPaymentDetailsDialog
                  employeeId={employee.id}
                  initialData={{
                    paymentMethod: employee.paymentMethod,
                    bankName: employee.bankName,
                    bankAccountName: employee.bankAccountName,
                    bankAccountNumber: employee.bankAccountNumber,
                    bankRoutingNumber: employee.bankRoutingNumber,
                    mobileBankingProvider: employee.mobileBankingProvider,
                    mobileBankingNumber: employee.mobileBankingNumber,
                  }}
                />
              </div>

              <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                {employee.paymentMethod === "BANK_TRANSFER" ? (
                  employee.bankAccountNumber ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Payment Method</span>
                        <span className="font-semibold text-foreground mt-0.5 inline-flex items-center gap-1.5">
                          <Building2Icon className="size-3.5 text-[#162E51]" /> Bank Transfer
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Bank Name</span>
                        <span className="font-medium text-foreground mt-0.5 block">{employee.bankName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Account Number</span>
                        <span className="font-mono font-semibold text-foreground mt-0.5 block">{employee.bankAccountNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Account Name / Routing</span>
                        <span className="font-medium text-foreground mt-0.5 block">
                          {employee.bankAccountName} {employee.bankRoutingNumber ? `(${employee.bankRoutingNumber})` : ""}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Bank Transfer selected, but no bank account number configured yet. Click &quot;Configure Payout&quot; to add details.
                    </p>
                  )
                ) : employee.paymentMethod === "MOBILE_BANKING" ? (
                  employee.mobileBankingNumber ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Payment Method</span>
                        <span className="font-semibold text-foreground mt-0.5 inline-flex items-center gap-1.5">
                          <SmartphoneIcon className="size-3.5 text-pink-600" /> Mobile Banking
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Provider</span>
                        <span className="font-medium text-foreground mt-0.5 block">{employee.mobileBankingProvider}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Wallet Number</span>
                        <span className="font-mono font-semibold text-foreground mt-0.5 block">{employee.mobileBankingNumber}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Mobile Banking selected, but no wallet number configured yet. Click &quot;Configure Payout&quot; to add details.
                    </p>
                  )
                ) : (
                  <div className="flex items-center gap-2 text-xs">
                    <BanknoteIcon className="size-4 text-emerald-600" />
                    <span className="font-medium text-foreground">
                      Disbursement mode: {employee.paymentMethod === "CASH" ? "Cash in Hand" : "Company Cheque"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}

