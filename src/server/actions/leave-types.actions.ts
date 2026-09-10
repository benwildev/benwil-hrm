"use server";

import { revalidatePath } from "next/cache";
import { createLeaveType, setLeaveTypeActive } from "@/server/dal/leave-types";
import type { SimpleFormState } from "@/server/actions/organization.actions";

export async function createLeaveTypeAction(
  _prevState: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  const name = formData.get("name");
  const description = formData.get("description");
  const daysPerYear = Number(formData.get("daysPerYear") ?? 0);
  const isPaid = formData.get("isPaid") === "on";

  if (typeof name !== "string" || !name.trim()) return { error: "Name is required." };
  if (!Number.isFinite(daysPerYear) || daysPerYear < 0) return { error: "Days per year must be a positive number." };

  try {
    await createLeaveType({
      name: name.trim(),
      description: typeof description === "string" && description.trim() ? description.trim() : undefined,
      daysPerYear,
      isPaid,
    });
  } catch {
    return { error: "A leave type with that name already exists." };
  }

  revalidatePath("/settings/leave-types");
  return { success: true };
}

export async function toggleLeaveTypeAction(id: string, isActive: boolean) {
  await setLeaveTypeActive(id, isActive);
  revalidatePath("/settings/leave-types");
}
