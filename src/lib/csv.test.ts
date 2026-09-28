import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("neutralizes spreadsheet formula injection prefixes", () => {
    const csv = toCsv(
      [{ name: "=cmd|'/c calc'!A1" }, { name: "+1+1" }, { name: "-1+1" }, { name: "@SUM(1+1)" }],
      [{ key: "name", header: "Name" }],
    );
    const rows = csv.split("\r\n").slice(1);
    for (const row of rows) {
      expect(row.startsWith("=")).toBe(false);
      expect(row.startsWith("+")).toBe(false);
      expect(row.startsWith("-")).toBe(false);
      expect(row.startsWith("@")).toBe(false);
    }
  });

  it("leaves ordinary values untouched", () => {
    const csv = toCsv([{ name: "Jane Doe" }], [{ key: "name", header: "Name" }]);
    expect(csv).toBe("Name\r\nJane Doe");
  });

  it("quotes and escapes values containing commas or quotes", () => {
    const csv = toCsv([{ name: 'Doe, "Jane"' }], [{ key: "name", header: "Name" }]);
    expect(csv).toBe('Name\r\n"Doe, ""Jane"""');
  });
});
