"use server";

import { revalidatePath } from "next/cache";
import { createHoliday, deleteHoliday } from "@/server/dal/holidays";
import type { SimpleFormState } from "@/server/actions/organization.actions";

export async function createHolidayAction(
  _prevState: SimpleFormState,
  formData: FormData,
): Promise<SimpleFormState> {
  const date = formData.get("date");
  const name = formData.get("name");
  const isRecurringYearly = formData.get("isRecurringYearly") === "on";

  if (typeof date !== "string" || !date) return { error: "Date is required." };
  if (typeof name !== "string" || !name.trim()) return { error: "Name is required." };

  await createHoliday({ date, name: name.trim(), isRecurringYearly });
  revalidatePath("/settings/holidays");
  return { success: true };
}

export async function deleteHolidayAction(id: string) {
  await deleteHoliday(id);
  revalidatePath("/settings/holidays");
}
