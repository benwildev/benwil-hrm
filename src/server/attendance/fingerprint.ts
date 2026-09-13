import { createHash } from "node:crypto";

// Real ADMS terminals don't reliably provide their own unique event id — the
// push protocol only guarantees PIN + timestamp — so a deterministic
// fingerprint is derived from the stable attributes of the event itself
// (device, employee PIN, punch time, and the raw line as a tiebreaker).
// The same physical punch, even if the device retries/resends it after a
// network hiccup, always produces the same fingerprint — never a random
// one — so the `@@unique([deviceId, deviceEventId])` constraint on
// BiometricLog can actually deduplicate it. Kept dependency-free (no
// Prisma import) so it's trivially unit-testable.
export function fingerprint(deviceId: string, biometricUserId: string, punchTime: Date, raw: string): string {
  return createHash("sha256")
    .update(`${deviceId}|${biometricUserId}|${punchTime.toISOString()}|${raw}`)
    .digest("hex");
}
