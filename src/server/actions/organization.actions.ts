"use server";

import { revalidatePath } from "next/cache";
import {
  createDepartment,
  deleteDepartment,
  createDesignation,
  deleteDesignation,
  createShift,
  deleteShift,
  type ShiftInput,
} from "@/server/dal/organization";

export type SimpleFormState = { error: string } | { success: true } | undefined;

function parseNameForm(formData: FormData): { name: string; description?: string } | { error: string } {
  const name = formData.get("name");
  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "Name is required." };
  }
  const description = formData.get("description");
  return {
    name: name.trim(),
    description: typeof description === "string" && description.trim() ? description.trim() : undefined,
  };
}

export async function createDepartmentAction(
  _prevState: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  const parsed = parseNameForm(formData);
  if ("error" in parsed) return parsed;
  try {
    await createDepartment(parsed);
  } catch {
    return { error: "A department with that name already exists." };
  }
  revalidatePath("/settings/departments");
  return { success: true };
}

export async function deleteDepartmentAction(id: string) {
  await deleteDepartment(id);
  revalidatePath("/settings/departments");
}

export async function createDesignationAction(
  _prevState: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  const parsed = parseNameForm(formData);
  if ("error" in parsed) return parsed;
  try {
    await createDesignation(parsed);
  } catch {
    return { error: "A designation with that name already exists." };
  }
  revalidatePath("/settings/designations");
  return { success: true };
}

export async function deleteDesignationAction(id: string) {
  await deleteDesignation(id);
  revalidatePath("/settings/designations");
}

export async function createShiftAction(
  _prevState: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  const name = formData.get("name");
  const startTime = formData.get("startTime");
  const endTime = formData.get("endTime");
  const gracePeriodMinutes = Number(formData.get("gracePeriodMinutes") ?? 0);
  const breakMinutes = Number(formData.get("breakMinutes") ?? 0);
  const isOvernight = formData.get("isOvernight") === "on";

  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "Shift name is required." };
  }
  if (typeof startTime !== "string" || typeof endTime !== "string" || !startTime || !endTime) {
    return { error: "Start and end time are required." };
  }

  const input: ShiftInput = {
    name: name.trim(),
    startTime,
    endTime,
    gracePeriodMinutes: Number.isFinite(gracePeriodMinutes) ? gracePeriodMinutes : 0,
    breakMinutes: Number.isFinite(breakMinutes) ? breakMinutes : 0,
    isOvernight,
  };

  await createShift(input);
  revalidatePath("/settings/shifts");
  return { success: true };
}

export async function deleteShiftAction(id: string) {
  await deleteShift(id);
  revalidatePath("/settings/shifts");
}
