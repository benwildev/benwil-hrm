import { describe, expect, it } from "vitest";
import { assertStrongPassword } from "@/server/auth/password-policy";

describe("assertStrongPassword", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(() => assertStrongPassword("Ab1")).toThrow();
  });

  it("rejects passwords with no digit", () => {
    expect(() => assertStrongPassword("abcdefgh")).toThrow();
  });

  it("rejects passwords with no letter", () => {
    expect(() => assertStrongPassword("12345678")).toThrow();
  });

  it("accepts a password meeting the minimum bar", () => {
    expect(() => assertStrongPassword("Password1")).not.toThrow();
  });
});
