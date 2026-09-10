"use server";

import { revalidatePath } from "next/cache";
import { applyForLeave, cancelLeaveRequest, reviewLeaveRequest } from "@/server/dal/leave-requests";

export type LeaveFormState = { error: string } | { success: true } | undefined;

export async function applyForLeaveAction(
  _prevState: LeaveFormState,
  formData: FormData,
): Promise<LeaveFormState> {
  const leaveTypeId = formData.get("leaveTypeId");
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");
  const reason = formData.get("reason");

  if (typeof leaveTypeId !== "string" || !leaveTypeId) return { error: "Please choose a leave type." };
  if (typeof startDate !== "string" || !startDate) return { error: "Start date is required." };
  if (typeof endDate !== "string" || !endDate) return { error: "End date is required." };

  try {
    await applyForLeave({
      leaveTypeId,
      startDate,
      endDate,
      reason: typeof reason === "string" && reason.trim() ? reason.trim() : undefined,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to submit leave request." };
  }

  revalidatePath("/leave");
  return { success: true };
}

export async function cancelLeaveRequestAction(requestId: string) {
  await cancelLeaveRequest(requestId);
  revalidatePath("/leave");
  revalidatePath("/attendance");
}

export async function approveLeaveRequestAction(requestId: string, reviewNote?: string) {
  await reviewLeaveRequest(requestId, "APPROVED", reviewNote);
  revalidatePath("/leave");
  revalidatePath("/attendance");
}

export async function rejectLeaveRequestAction(requestId: string, reviewNote?: string) {
  await reviewLeaveRequest(requestId, "REJECTED", reviewNote);
  revalidatePath("/leave");
}
