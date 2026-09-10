import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export async function listDevices() {
  await requirePermission(PERMISSIONS.DEVICES_MANAGE);
  return prisma.biometricDevice.findMany({ orderBy: { deviceName: "asc" } });
}

export async function createDevice(input: {
  deviceName: string;
  deviceIdentifier: string;
  locationName?: string;
}) {
  await requirePermission(PERMISSIONS.DEVICES_MANAGE);
  return prisma.biometricDevice.create({
    data: {
      deviceName: input.deviceName,
      deviceIdentifier: input.deviceIdentifier,
      locationName: input.locationName,
      deviceType: "ADMS",
    },
  });
}

export async function deleteDevice(id: string) {
  await requirePermission(PERMISSIONS.DEVICES_MANAGE);
  await prisma.biometricDevice.delete({ where: { id } });
}
