import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { logAudit } from "@/server/audit/audit";

export async function listDevices() {
  await requirePermission(PERMISSIONS.DEVICES_MANAGE);
  return prisma.biometricDevice.findMany({ orderBy: { deviceName: "asc" } });
}

export async function createDevice(input: {
  deviceName: string;
  deviceIdentifier: string;
  locationName?: string;
  ipAddress?: string;
}) {
  const actor = await requirePermission(PERMISSIONS.DEVICES_MANAGE);

  // A shared secret the device (or an on-prem relay in front of it) can
  // present via a `key`/`apikey` query param on every push to
  // /api/iclock/*, on top of its serial number — see that route. Shown once
  // at creation time so the admin can configure it on the device/relay.
  const apiKey = randomBytes(24).toString("base64url");

  const device = await prisma.biometricDevice.create({
    data: {
      deviceName: input.deviceName,
      deviceIdentifier: input.deviceIdentifier,
      locationName: input.locationName,
      ipAddress: input.ipAddress || undefined,
      deviceType: "ADMS",
      apiKey,
    },
  });

  await logAudit({
    actorId: actor.id,
    action: "BIOMETRIC_DEVICE_REGISTERED",
    entityType: "BiometricDevice",
    entityId: device.id,
    newData: { deviceName: input.deviceName, deviceIdentifier: input.deviceIdentifier },
  });

  return device;
}

export async function deleteDevice(id: string) {
  const actor = await requirePermission(PERMISSIONS.DEVICES_MANAGE);
  const device = await prisma.biometricDevice.findUnique({ where: { id }, select: { deviceName: true } });
  await prisma.biometricDevice.delete({ where: { id } });
  await logAudit({
    actorId: actor.id,
    action: "BIOMETRIC_DEVICE_DELETED",
    entityType: "BiometricDevice",
    entityId: id,
    oldData: device ?? undefined,
  });
}
