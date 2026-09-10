"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createEmployee,
  updateEmployee,
  softDeleteEmployee,
  type CreateEmployeeInput,
  type EmployeeInput,
} from "@/server/dal/employees";

export type EmployeeFormState = { error: string } | undefined;

function str(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseEmployeeInput(formData: FormData): EmployeeInput | { error: string } {
  const employeeCode = str(formData, "employeeCode");
  const fullName = str(formData, "fullName");
  const joiningDate = str(formData, "joiningDate");
  const employmentStatus = str(formData, "employmentStatus") as EmployeeInput["employmentStatus"] | undefined;

  if (!employeeCode) return { error: "Employee code is required." };
  if (!fullName) return { error: "Full name is required." };
  if (!joiningDate) return { error: "Joining date is required." };
  if (!employmentStatus) return { error: "Employment status is required." };

  return {
    employeeCode,
    fullName,
    joiningDate,
    employmentStatus,
    employmentType: str(formData, "employmentType") as EmployeeInput["employmentType"],
    personalEmail: str(formData, "personalEmail"),
    workEmail: str(formData, "workEmail"),
    phone: str(formData, "phone"),
    dateOfBirth: str(formData, "dateOfBirth"),
    gender: str(formData, "gender"),
    maritalStatus: str(formData, "maritalStatus"),
    nationality: str(formData, "nationality"),
    bloodGroup: str(formData, "bloodGroup"),
    presentAddress: str(formData, "presentAddress"),
    permanentAddress: str(formData, "permanentAddress"),
    emergencyContactName: str(formData, "emergencyContactName"),
    emergencyContactRelationship: str(formData, "emergencyContactRelationship"),
    emergencyContactPhone: str(formData, "emergencyContactPhone"),
    departmentId: str(formData, "departmentId"),
    designationId: str(formData, "designationId"),
    shiftId: str(formData, "shiftId"),
    reportingManagerId: str(formData, "reportingManagerId"),
  };
}

export async function createEmployeeAction(
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const parsed = parseEmployeeInput(formData);
  if ("error" in parsed) return parsed;

  const createLogin = formData.get("createLogin") === "on";
  const input: CreateEmployeeInput = {
    ...parsed,
    createLogin,
    loginEmail: str(formData, "loginEmail"),
    loginPassword: str(formData, "loginPassword"),
    roleId: str(formData, "roleId"),
  };

  let employeeId: string;
  try {
    const employee = await createEmployee(input);
    employeeId = employee.id;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to create employee." };
  }

  revalidatePath("/employees");
  redirect(`/employees/${employeeId}`);
}

export async function updateEmployeeAction(
  employeeId: string,
  _prevState: EmployeeFormState,
  formData: FormData,
): Promise<EmployeeFormState> {
  const parsed = parseEmployeeInput(formData);
  if ("error" in parsed) return parsed;

  try {
    await updateEmployee(employeeId, parsed);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update employee." };
  }

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  redirect(`/employees/${employeeId}`);
}

export async function deleteEmployeeAction(employeeId: string) {
  await softDeleteEmployee(employeeId);
  revalidatePath("/employees");
}
