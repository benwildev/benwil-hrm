import { prisma } from "@/lib/prisma";

// Centralized writer for the AuditLog table. Every sensitive mutation in
// the app (employee changes, salary changes, attendance corrections, leave
// approval/rejection, payroll lifecycle transitions, role/permission
// changes, document upload/delete) should call this instead of writing to
// `prisma.auditLog` directly, so the redaction rule below is applied
// uniformly and every entry point stays consistent.

const REDACTED_KEYS = new Set([
  "password",
  "passwordhash",
  "newpassword",
  "currentpassword",
  "secret",
  "apikey",
  "token",
  "accesstoken",
  "refreshtoken",
]);

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = REDACTED_KEYS.has(k.toLowerCase()) ? "[REDACTED]" : redact(v);
    }
    return out;
  }
  return value;
}

export type AuditInput = {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldData?: unknown;
  newData?: unknown;
};

export async function logAudit(input: AuditInput) {
  let ipAddress: string | null = null;
  let userAgent: string | null = null;
  try {
    // Only resolvable inside a request-scoped context (Server Action, Route
    // Handler). Best-effort — audit logging must never break the caller.
    const { headers } = await import("next/headers");
    const h = await headers();
    userAgent = h.get("user-agent");
    ipAddress = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  } catch {
    // Not in a request context (e.g. called from a script) — fine, omit.
  }

  try {
    await prisma.auditLog.create({
      data: {
        userId: input.actorId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        oldData: input.oldData !== undefined ? (redact(input.oldData) as never) : undefined,
        newData: input.newData !== undefined ? (redact(input.newData) as never) : undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Never let an audit-log failure fail the underlying business
    // operation — log server-side and move on.
    console.error("Failed to write audit log entry:", input.action, error);
  }
}
