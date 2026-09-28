import { describe, expect, it } from "vitest";
import { fingerprint } from "@/server/attendance/fingerprint";

describe("biometric event fingerprint (dedup key)", () => {
  it("is deterministic: the same event always produces the same fingerprint", () => {
    const punchTime = new Date("2026-01-15T09:03:12.000Z");
    const a = fingerprint("device-1", "1001", punchTime, "1001\t2026-01-15 09:03:12\t0\t1");
    const b = fingerprint("device-1", "1001", punchTime, "1001\t2026-01-15 09:03:12\t0\t1");
    expect(a).toBe(b);
  });

  it("produces a different fingerprint for a different employee", () => {
    const punchTime = new Date("2026-01-15T09:03:12.000Z");
    const a = fingerprint("device-1", "1001", punchTime, "raw");
    const b = fingerprint("device-1", "1002", punchTime, "raw");
    expect(a).not.toBe(b);
  });

  it("produces a different fingerprint for a different punch time", () => {
    const a = fingerprint("device-1", "1001", new Date("2026-01-15T09:03:12.000Z"), "raw");
    const b = fingerprint("device-1", "1001", new Date("2026-01-15T09:03:13.000Z"), "raw");
    expect(a).not.toBe(b);
  });

  it("produces a different fingerprint for a different device", () => {
    const punchTime = new Date("2026-01-15T09:03:12.000Z");
    const a = fingerprint("device-1", "1001", punchTime, "raw");
    const b = fingerprint("device-2", "1001", punchTime, "raw");
    expect(a).not.toBe(b);
  });
});
