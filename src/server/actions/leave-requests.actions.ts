"use server";

import { revalidatePath } from "next/cache";
import { applyForLeave, cancelLeaveRequest, reviewLeaveRequest } from "@/server/dal/leave-requests";
import { notifyLeaveRequested, notifyLeaveDecision } from "@/server/email";

export type LeaveFormState = { error: string } | { success: true } | undefined;

export async function applyForLeaveAction(
  _prevState: LeaveFormState,
  formData: FormData,
): Promise<LeaveFormState> {
  const leaveTypeId = formData.get("leaveTypeId");
  const startDate = formData.get("startDate");
  const isHalfDay = formData.get("isHalfDay") === "true" || formData.get("isHalfDay") === "on";
  const endDate = isHalfDay ? startDate : formData.get("endDate");
  const halfDaySession = (formData.get("halfDaySession") as "FIRST_HALF" | "SECOND_HALF" | null) || undefined;
  const reason = formData.get("reason");

  if (typeof leaveTypeId !== "string" || !leaveTypeId) return { error: "Please choose a leave type." };
  if (typeof startDate !== "string" || !startDate) return { error: "Start date is required." };
  if (!isHalfDay && (typeof endDate !== "string" || !endDate)) return { error: "End date is required." };

  try {
    const created = await applyForLeave({
      leaveTypeId,
      startDate,
      endDate: typeof endDate === "string" ? endDate : startDate,
      isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession : undefined,
      reason: typeof reason === "string" && reason.trim() ? reason.trim() : undefined,
    });
    notifyLeaveRequested(created.id).catch((err) => console.error("Leave notification error:", err));
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
  notifyLeaveDecision(requestId).catch((err) => console.error("Leave approval email error:", err));
  revalidatePath("/leave");
  revalidatePath("/attendance");
}

export async function rejectLeaveRequestAction(requestId: string, reviewNote?: string) {
  await reviewLeaveRequest(requestId, "REJECTED", reviewNote);
  notifyLeaveDecision(requestId).catch((err) => console.error("Leave rejection email error:", err));
  revalidatePath("/leave");
}

