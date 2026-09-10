"use server";

import { revalidatePath } from "next/cache";
import { setLeaveAllocation } from "@/server/dal/leave-balances";
import type { SimpleFormState } from "@/server/actions/organization.actions";

export async function setLeaveAllocationAction(
  employeeId: string,
  _prevState: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  const leaveTypeId = formData.get("leaveTypeId");
  const year = Number(formData.get("year"));
  const allocatedDays = Number(formData.get("allocatedDays"));

  if (typeof leaveTypeId !== "string" || !leaveTypeId) return { error: "Missing leave type." };
  if (!Number.isFinite(year)) return { error: "Missing year." };
  if (!Number.isFinite(allocatedDays) || allocatedDays < 0) {
    return { error: "Allocated days must be a positive number." };
  }

  await setLeaveAllocation({ employeeId, leaveTypeId, year, allocatedDays });
  revalidatePath(`/leave/balances/${employeeId}`);
  return { success: true };
}
