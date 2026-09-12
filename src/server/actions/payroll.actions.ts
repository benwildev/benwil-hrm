"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createPayrollPeriod,
  runPayrollPeriod,
  lockPayrollPeriod,
  markPayslipPaid,
  disbursePayslip,
  adjustPayslip,
  resetPayslipPaymentStatus,
  type AdjustPayslipInput,
} from "@/server/dal/payroll";
import { notifyPayslipReleased, notifyBulkPayslipsReleased } from "@/server/email";
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
  notifyBulkPayslipsReleased(periodId).catch((err) => console.error("Bulk payslip email error:", err));
  revalidatePath("/payroll");
  revalidatePath(`/payroll/${periodId}`);
}

export async function markPayslipPaidAction(periodId: string, recordId: string) {
  await markPayslipPaid(recordId);
  notifyPayslipReleased(recordId).catch((err) => console.error("Payslip email error:", err));
  revalidatePath(`/payroll/${periodId}`);
  revalidatePath(`/payroll/${periodId}/${recordId}`);
}

export async function disbursePayslipAction(
  periodId: string,
  recordId: string,
  _prevState: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  const paymentMethod = formData.get("paymentMethod") as string;
  const paymentReference = formData.get("paymentReference") as string;
  const paymentNote = formData.get("paymentNote") as string;
  const paidAtStr = formData.get("paidAt") as string;

  if (!paymentMethod) {
    return { error: "Payment method is required." };
  }

  try {
    await disbursePayslip(recordId, {
      paymentMethod,
      paymentReference: paymentReference?.trim() || undefined,
      paymentNote: paymentNote?.trim() || undefined,
      paidAt: paidAtStr ? new Date(paidAtStr) : new Date(),
    });

    notifyPayslipReleased(recordId).catch((err) => console.error("Payslip email error:", err));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to disburse payment." };
  }

  revalidatePath(`/payroll/${periodId}`);
  revalidatePath(`/payroll/${periodId}/${recordId}`);
  return { success: true };
}

export async function adjustPayslipAction(
  periodId: string,
  recordId: string,
  input: AdjustPayslipInput,
) {
  await adjustPayslip(recordId, input);
  revalidatePath(`/payroll/${periodId}`);
  revalidatePath(`/payroll/${periodId}/${recordId}`);
}

export async function resetPayslipPaymentStatusAction(periodId: string, recordId: string) {
  await resetPayslipPaymentStatus(recordId);
  revalidatePath(`/payroll/${periodId}`);
  revalidatePath(`/payroll/${periodId}/${recordId}`);
}

