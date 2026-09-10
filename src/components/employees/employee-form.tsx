"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EmployeeFormState } from "@/server/actions/employees.actions";

type Option = { id: string; name: string };

type EmployeeDefaults = {
  employeeCode?: string;
  fullName?: string;
  personalEmail?: string | null;
  workEmail?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  bloodGroup?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
  joiningDate?: string;
  employmentType?: string | null;
  employmentStatus?: string;
  departmentId?: string | null;
  designationId?: string | null;
  shiftId?: string | null;
  reportingManagerId?: string | null;
};

export function EmployeeForm({
  mode,
  action,
  defaults,
  departments,
  designations,
  shifts,
  managers,
  roles,
  currentEmployeeId,
}: {
  mode: "create" | "edit";
  action: (prevState: EmployeeFormState, formData: FormData) => Promise<EmployeeFormState>;
  defaults?: EmployeeDefaults;
  departments: Option[];
  designations: Option[];
  shifts: Option[];
  managers: Option[];
  roles: Option[];
  currentEmployeeId?: string;
}) {
  const [state, formAction, isPending] = useActionState<EmployeeFormState, FormData>(
    action,
    undefined,
  );
  const [createLogin, setCreateLogin] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Employee code" htmlFor="employeeCode">
            <Input id="employeeCode" name="employeeCode" defaultValue={defaults?.employeeCode} required />
          </Field>
          <Field label="Full name" htmlFor="fullName">
            <Input id="fullName" name="fullName" defaultValue={defaults?.fullName} required />
          </Field>
          <Field label="Date of birth" htmlFor="dateOfBirth">
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={defaults?.dateOfBirth ?? ""}
            />
          </Field>
          <Field label="Gender" htmlFor="gender">
            <Input id="gender" name="gender" defaultValue={defaults?.gender ?? ""} />
          </Field>
          <Field label="Marital status" htmlFor="maritalStatus">
            <Input id="maritalStatus" name="maritalStatus" defaultValue={defaults?.maritalStatus ?? ""} />
          </Field>
          <Field label="Nationality" htmlFor="nationality">
            <Input id="nationality" name="nationality" defaultValue={defaults?.nationality ?? ""} />
          </Field>
          <Field label="Blood group" htmlFor="bloodGroup">
            <Input id="bloodGroup" name="bloodGroup" defaultValue={defaults?.bloodGroup ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Personal email" htmlFor="personalEmail">
            <Input id="personalEmail" name="personalEmail" type="email" defaultValue={defaults?.personalEmail ?? ""} />
          </Field>
          <Field label="Work email" htmlFor="workEmail">
            <Input id="workEmail" name="workEmail" type="email" defaultValue={defaults?.workEmail ?? ""} />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" defaultValue={defaults?.phone ?? ""} />
          </Field>
          <div />
          <Field label="Present address" htmlFor="presentAddress" full>
            <Input id="presentAddress" name="presentAddress" defaultValue={defaults?.presentAddress ?? ""} />
          </Field>
          <Field label="Permanent address" htmlFor="permanentAddress" full>
            <Input id="permanentAddress" name="permanentAddress" defaultValue={defaults?.permanentAddress ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Name" htmlFor="emergencyContactName">
            <Input id="emergencyContactName" name="emergencyContactName" defaultValue={defaults?.emergencyContactName ?? ""} />
          </Field>
          <Field label="Relationship" htmlFor="emergencyContactRelationship">
            <Input
              id="emergencyContactRelationship"
              name="emergencyContactRelationship"
              defaultValue={defaults?.emergencyContactRelationship ?? ""}
            />
          </Field>
          <Field label="Phone" htmlFor="emergencyContactPhone">
            <Input id="emergencyContactPhone" name="emergencyContactPhone" defaultValue={defaults?.emergencyContactPhone ?? ""} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employment</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Joining date" htmlFor="joiningDate">
            <Input id="joiningDate" name="joiningDate" type="date" defaultValue={defaults?.joiningDate ?? ""} required />
          </Field>
          <Field label="Employment status" htmlFor="employmentStatus">
            <NativeSelect id="employmentStatus" name="employmentStatus" defaultValue={defaults?.employmentStatus ?? "ACTIVE"} required>
              <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
              <NativeSelectOption value="ON_LEAVE">On leave</NativeSelectOption>
              <NativeSelectOption value="RESIGNED">Resigned</NativeSelectOption>
              <NativeSelectOption value="TERMINATED">Terminated</NativeSelectOption>
              <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field label="Employment type" htmlFor="employmentType">
            <NativeSelect id="employmentType" name="employmentType" defaultValue={defaults?.employmentType ?? ""}>
              <NativeSelectOption value="">—</NativeSelectOption>
              <NativeSelectOption value="FULL_TIME">Full-time</NativeSelectOption>
              <NativeSelectOption value="PART_TIME">Part-time</NativeSelectOption>
              <NativeSelectOption value="CONTRACT">Contract</NativeSelectOption>
              <NativeSelectOption value="INTERN">Intern</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field label="Department" htmlFor="departmentId">
            <NativeSelect id="departmentId" name="departmentId" defaultValue={defaults?.departmentId ?? ""}>
              <NativeSelectOption value="">—</NativeSelectOption>
              {departments.map((d) => (
                <NativeSelectOption key={d.id} value={d.id}>{d.name}</NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Designation" htmlFor="designationId">
            <NativeSelect id="designationId" name="designationId" defaultValue={defaults?.designationId ?? ""}>
              <NativeSelectOption value="">—</NativeSelectOption>
              {designations.map((d) => (
                <NativeSelectOption key={d.id} value={d.id}>{d.name}</NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Shift" htmlFor="shiftId">
            <NativeSelect id="shiftId" name="shiftId" defaultValue={defaults?.shiftId ?? ""}>
              <NativeSelectOption value="">—</NativeSelectOption>
              {shifts.map((s) => (
                <NativeSelectOption key={s.id} value={s.id}>{s.name}</NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Reporting manager" htmlFor="reportingManagerId">
            <NativeSelect id="reportingManagerId" name="reportingManagerId" defaultValue={defaults?.reportingManagerId ?? ""}>
              <NativeSelectOption value="">—</NativeSelectOption>
              {managers
                .filter((m) => m.id !== currentEmployeeId)
                .map((m) => (
                  <NativeSelectOption key={m.id} value={m.id}>{m.name}</NativeSelectOption>
                ))}
            </NativeSelect>
          </Field>
        </CardContent>
      </Card>

      {mode === "create" ? (
        <Card>
          <CardHeader>
            <CardTitle>Login access</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={createLogin}
                onCheckedChange={(checked) => setCreateLogin(checked === true)}
              />
              {createLogin ? <input type="hidden" name="createLogin" value="on" /> : null}
              <Label className="font-normal">Create a system login for this employee</Label>
            </label>
            {createLogin ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Login email" htmlFor="loginEmail">
                  <Input id="loginEmail" name="loginEmail" type="email" required={createLogin} />
                </Field>
                <Field label="Temporary password" htmlFor="loginPassword">
                  <Input id="loginPassword" name="loginPassword" type="password" required={createLogin} />
                </Field>
                <Field label="Role" htmlFor="roleId">
                  <NativeSelect id="roleId" name="roleId" required={createLogin} defaultValue="">
                    <NativeSelectOption value="" disabled>
                      Select a role
                    </NativeSelectOption>
                    {roles.map((r) => (
                      <NativeSelectOption key={r.id} value={r.id}>{r.name}</NativeSelectOption>
                    ))}
                  </NativeSelect>
                </Field>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : mode === "create" ? "Create employee" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
  full,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2 ${full ? "sm:col-span-2" : ""}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
