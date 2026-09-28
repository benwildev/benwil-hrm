"use server";

import { revalidatePath } from "next/cache";
import {
  setManualAttendance,
  importAttendanceCsv,
  selfCheckIn,
  selfCheckOut,
  type ManualAttendanceInput,
} from "@/server/dal/attendance";

export type AttendanceFormState =
  | { error: string }
  | { success: true; message?: string }
  | undefined;

export async function setManualAttendanceAction(
  _prevState: AttendanceFormState,
  formData: FormData,
): Promise<AttendanceFormState> {
  const employeeId = formData.get("employeeId");
  const date = formData.get("date");
  const checkIn = formData.get("checkIn");
  const checkOut = formData.get("checkOut");
  const status = formData.get("status");
  const reason = formData.get("reason");

  if (typeof employeeId !== "string" || !employeeId) return { error: "Missing employee." };
  if (typeof date !== "string" || !date) return { error: "Missing date." };
  if (typeof status !== "string" || !status) return { error: "Missing status." };
  if (typeof reason !== "string" || !reason.trim()) {
    return { error: "A reason is required for manual attendance edits." };
  }

  const input: ManualAttendanceInput = {
    employeeId,
    date,
    checkIn: typeof checkIn === "string" && checkIn ? checkIn : undefined,
    checkOut: typeof checkOut === "string" && checkOut ? checkOut : undefined,
    status: status as ManualAttendanceInput["status"],
    reason: reason.trim(),
  };

  try {
    await setManualAttendance(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to save attendance." };
  }

  revalidatePath("/attendance");
  revalidatePath(`/attendance/${employeeId}`);
  return { success: true };
}

export async function importAttendanceCsvAction(
  _prevState: AttendanceFormState,
  formData: FormData,
): Promise<AttendanceFormState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a CSV file to upload." };
  }

  const text = await file.text();

  try {
    const result = await importAttendanceCsv(text);
    revalidatePath("/attendance");
    return {
      success: true,
      message: `Imported ${result.matched} punches (${result.unmatched} unmatched to an employee code).`,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to import CSV." };
  }
}

export async function selfCheckInAction() {
  await selfCheckIn();
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
}

export async function selfCheckOutAction() {
  await selfCheckOut();
  revalidatePath("/dashboard");
  revalidatePath("/attendance");
}
