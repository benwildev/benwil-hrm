"use server";

import { revalidatePath } from "next/cache";
import { createDevice, deleteDevice } from "@/server/dal/devices";

export type DeviceFormState =
  | { error: string }
  | { success: true; apiKey: string }
  | undefined;

export async function createDeviceAction(
  _prevState: DeviceFormState,
  formData: FormData,
): Promise<DeviceFormState> {
  const deviceName = formData.get("deviceName");
  const deviceIdentifier = formData.get("deviceIdentifier");
  const locationName = formData.get("locationName");
  const ipAddress = formData.get("ipAddress");

  if (typeof deviceName !== "string" || !deviceName.trim()) {
    return { error: "Device name is required." };
  }
  if (typeof deviceIdentifier !== "string" || !deviceIdentifier.trim()) {
    return { error: "Serial number is required." };
  }

  try {
    const device = await createDevice({
      deviceName: deviceName.trim(),
      deviceIdentifier: deviceIdentifier.trim(),
      locationName: typeof locationName === "string" && locationName.trim() ? locationName.trim() : undefined,
      ipAddress: typeof ipAddress === "string" && ipAddress.trim() ? ipAddress.trim() : undefined,
    });
    revalidatePath("/attendance/devices");
    return { success: true, apiKey: device.apiKey! };
  } catch {
    return { error: "A device with that serial number already exists." };
  }
}

export async function deleteDeviceAction(id: string) {
  await deleteDevice(id);
  revalidatePath("/attendance/devices");
}
