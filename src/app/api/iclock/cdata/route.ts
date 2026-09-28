import { prisma } from "@/lib/prisma";
import { parseAttLog } from "@/server/integrations/adms/parse";
import { ingestPunches } from "@/server/attendance/ingest";
import { verifyDeviceRequest } from "@/server/integrations/adms/device-auth";

// Endpoint a ZKTeco-style biometric terminal is pointed at (server address
// configured on the device itself, fixed path "/iclock/cdata"). See
// src/server/integrations/adms/parse.ts for the push format this expects.
//
// GET is the device's handshake/config poll; POST is the actual data push
// for whichever table the device names (we only care about ATTLOG —
// attendance punches — and ignore OPERLOG/USERINFO/FACE pushes).

async function findDevice(serial: string | null) {
  if (!serial) return null;
  return prisma.biometricDevice.findFirst({ where: { deviceIdentifier: serial } });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serial = searchParams.get("SN");
  const device = await findDevice(serial);

  if (!device) {
    return new Response("Unregistered device", { status: 401 });
  }
  const auth = verifyDeviceRequest(device, request);
  if (!auth.ok) {
    return new Response("Unauthorized device", { status: 401 });
  }

  await prisma.biometricDevice.update({ where: { id: device.id }, data: { lastSyncAt: new Date() } });

  const body = ["GET OPTION FROM: " + serial, "ATTLOGStamp=None", "OPERLOGStamp=None", "ErrorDelay=30", "Delay=30", "TransFlag=1111000000", "Realtime=1", "Encrypt=0"].join(
    "\r\n",
  );

  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const serial = searchParams.get("SN");
  const table = searchParams.get("table");
  const device = await findDevice(serial);

  if (!device) {
    return new Response("Unregistered device", { status: 401 });
  }
  const auth = verifyDeviceRequest(device, request);
  if (!auth.ok) {
    return new Response("Unauthorized device", { status: 401 });
  }

  if (table && table !== "ATTLOG") {
    // We don't process OPERLOG/USERINFO/FACE etc. — ack so the device
    // doesn't keep retrying, but do nothing with it.
    return new Response("OK", { headers: { "Content-Type": "text/plain" } });
  }

  const body = await request.text();
  const punches = parseAttLog(body);
  const result = await ingestPunches(punches, { deviceId: device.id });

  await prisma.biometricDevice.update({ where: { id: device.id }, data: { lastSyncAt: new Date() } });

  return new Response(`OK: ${result.matched + result.unmatched}`, {
    headers: { "Content-Type": "text/plain" },
  });
}
