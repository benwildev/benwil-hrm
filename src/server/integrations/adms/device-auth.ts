import type { BiometricDevice } from "@/generated/prisma/client";

// Best-effort device authentication for the /api/iclock/* push endpoints.
// The ADMS protocol these terminals speak has no built-in auth beyond a
// device serial in the query string, which is guessable/enumerable, so this
// adds two OPTIONAL, independently-configurable layers on top of it:
//
//  - IP allowlist: enforced only if the device record has an ipAddress set.
//    Works with any real hardware/firmware unmodified, since it needs no
//    special configuration on the device itself beyond a static/known IP.
//  - Shared API key: enforced only if the device record has an apiKey set.
//    Requires the device (or an on-prem relay/proxy in front of it) to be
//    configurable with a `key`/`apikey` query parameter on its push URL —
//    not all terminal firmware supports this, hence it being optional
//    rather than mandatory.
//
// A device with neither configured is accepted on serial number alone,
// same as before — registering a device with at least one of these set is
// what actually closes the gap, and is called out in the admin UI.
export function getRequestIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

export function verifyDeviceRequest(
  device: Pick<BiometricDevice, "ipAddress" | "apiKey">,
  request: Request,
): { ok: true } | { ok: false; reason: string } {
  if (device.ipAddress) {
    const requestIp = getRequestIp(request);
    if (requestIp !== device.ipAddress) {
      return { ok: false, reason: "IP address does not match the registered device." };
    }
  }

  if (device.apiKey) {
    const { searchParams } = new URL(request.url);
    const providedKey = searchParams.get("key") ?? searchParams.get("apikey");
    if (providedKey !== device.apiKey) {
      return { ok: false, reason: "Missing or invalid device API key." };
    }
  }

  return { ok: true };
}
