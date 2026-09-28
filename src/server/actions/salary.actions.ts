"use server";

import { revalidatePath } from "next/cache";
import { setEmployeeSalary } from "@/server/dal/salaries";
import {
  createSalaryComponent,
  setSalaryComponentActive,
  assignSalaryComponent,
  removeSalaryComponent,
} from "@/server/dal/salary-components";
import type { SimpleFormState } from "@/server/actions/organization.actions";

export async function setEmployeeSalaryAction(
  employeeId: string,
  _prevState: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  const basicSalary = Number(formData.get("basicSalary"));
  const effectiveFrom = formData.get("effectiveFrom");

  if (!Number.isFinite(basicSalary) || basicSalary <= 0) return { error: "Enter a valid salary amount." };
  if (typeof effectiveFrom !== "string" || !effectiveFrom) return { error: "Effective date is required." };

  await setEmployeeSalary({ employeeId, basicSalary, effectiveFrom });
  revalidatePath(`/employees/${employeeId}`);
  return { success: true };
}

export async function createSalaryComponentAction(
  _prevState: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  const name = formData.get("name");
  const componentType = formData.get("componentType");
  const calculationType = formData.get("calculationType");
  const defaultAmount = Number(formData.get("defaultAmount") ?? 0);

  if (typeof name !== "string" || !name.trim()) return { error: "Name is required." };
  if (componentType !== "EARNING" && componentType !== "DEDUCTION") return { error: "Invalid type." };
  if (calculationType !== "FIXED" && calculationType !== "PERCENTAGE") return { error: "Invalid calculation." };

  await createSalaryComponent({
    name: name.trim(),
    componentType,
    calculationType,
    defaultAmount: Number.isFinite(defaultAmount) ? defaultAmount : 0,
  });
  revalidatePath("/settings/salary-components");
  return { success: true };
}

export async function toggleSalaryComponentAction(id: string, isActive: boolean) {
  await setSalaryComponentActive(id, isActive);
  revalidatePath("/settings/salary-components");
}

export async function assignSalaryComponentAction(
  employeeId: string,
  _prevState: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  const salaryComponentId = formData.get("salaryComponentId");
  const amount = Number(formData.get("amount"));
  const effectiveFrom = formData.get("effectiveFrom");

  if (typeof salaryComponentId !== "string" || !salaryComponentId) return { error: "Choose a component." };
  if (!Number.isFinite(amount)) return { error: "Enter a valid amount." };
  if (typeof effectiveFrom !== "string" || !effectiveFrom) return { error: "Effective date is required." };

  await assignSalaryComponent({ employeeId, salaryComponentId, amount, effectiveFrom });
  revalidatePath(`/employees/${employeeId}`);
  return { success: true };
}

export async function removeSalaryComponentAction(employeeId: string, id: string) {
  await removeSalaryComponent(id);
  revalidatePath(`/employees/${employeeId}`);
}
