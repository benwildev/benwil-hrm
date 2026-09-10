"use server";

import { revalidatePath } from "next/cache";
import { createDevice, deleteDevice } from "@/server/dal/devices";

export type DeviceFormState = { error: string } | { success: true } | undefined;

export async function createDeviceAction(
  _prevState: DeviceFormState,
  formData: FormData,
): Promise<DeviceFormState> {
  const deviceName = formData.get("deviceName");
  const deviceIdentifier = formData.get("deviceIdentifier");
  const locationName = formData.get("locationName");

  if (typeof deviceName !== "string" || !deviceName.trim()) {
    return { error: "Device name is required." };
  }
  if (typeof deviceIdentifier !== "string" || !deviceIdentifier.trim()) {
    return { error: "Serial number is required." };
  }

  try {
    await createDevice({
      deviceName: deviceName.trim(),
      deviceIdentifier: deviceIdentifier.trim(),
      locationName: typeof locationName === "string" && locationName.trim() ? locationName.trim() : undefined,
    });
  } catch {
    return { error: "A device with that serial number already exists." };
  }

  revalidatePath("/attendance/devices");
  return { success: true };
}

export async function deleteDeviceAction(id: string) {
  await deleteDevice(id);
  revalidatePath("/attendance/devices");
}
