"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createPayrollPeriod, runPayrollPeriod, lockPayrollPeriod, markPayslipPaid } from "@/server/dal/payroll";
import type { SimpleFormState } from "@/server/actions/organization.actions";

export async function createPayrollPeriodAction(
  _prevState: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return { error: "Enter a valid year and month." };
  }

  let periodId: string;
  try {
    const period = await createPayrollPeriod(year, month);
    periodId = period.id;
  } catch {
    return { error: "A payroll period for that month already exists." };
  }

  revalidatePath("/payroll");
  redirect(`/payroll/${periodId}`);
}

export async function runPayrollPeriodAction(periodId: string) {
  await runPayrollPeriod(periodId);
  revalidatePath("/payroll");
  revalidatePath(`/payroll/${periodId}`);
}

export async function lockPayrollPeriodAction(periodId: string) {
  await lockPayrollPeriod(periodId);
  revalidatePath("/payroll");
  revalidatePath(`/payroll/${periodId}`);
}

export async function markPayslipPaidAction(periodId: string, recordId: string) {
  await markPayslipPaid(recordId);
  revalidatePath(`/payroll/${periodId}`);
}
