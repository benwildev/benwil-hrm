import { prisma } from "@/lib/prisma";
import { verifyDeviceRequest } from "@/server/integrations/adms/device-auth";

// Devices poll this periodically for pending remote commands (e.g. reboot,
// user sync). We don't queue any commands yet, so always ack with nothing.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serial = searchParams.get("SN");

  if (serial) {
    const device = await prisma.biometricDevice.findFirst({ where: { deviceIdentifier: serial } });
    if (device) {
      const auth = verifyDeviceRequest(device, request);
      if (!auth.ok) {
        return new Response("Unauthorized device", { status: 401 });
      }
      await prisma.biometricDevice
        .update({ where: { id: device.id }, data: { lastSyncAt: new Date() } })
        .catch(() => undefined);
    }
  }

  return new Response("OK", { headers: { "Content-Type": "text/plain" } });
}
