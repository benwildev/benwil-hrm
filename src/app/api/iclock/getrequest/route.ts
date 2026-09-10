import { prisma } from "@/lib/prisma";

// Devices poll this periodically for pending remote commands (e.g. reboot,
// user sync). We don't queue any commands yet, so always ack with nothing.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serial = searchParams.get("SN");

  if (serial) {
    await prisma.biometricDevice
      .updateMany({ where: { deviceIdentifier: serial }, data: { lastSyncAt: new Date() } })
      .catch(() => undefined);
  }

  return new Response("OK", { headers: { "Content-Type": "text/plain" } });
}
