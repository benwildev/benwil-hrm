import { NextResponse } from "next/server";
import { listEmployees } from "@/server/dal/employees";
import { toCsv } from "@/lib/csv";
import { ForbiddenError, UnauthenticatedError } from "@/server/dal/session";

export async function GET() {
  try {
    const employees = await listEmployees();

    // Mirrors the same safe directory projection shown on-screen — this
    // export must never carry more than the directory itself exposes (no
    // phone/personal email/login email/bank details).
    const rows = employees.map((e) => ({
      employeeCode: e.employeeCode,
      fullName: e.fullName,
      department: e.department?.name ?? "",
      designation: e.designation?.name ?? "",
      workEmail: e.workEmail ?? "",
      status: e.employmentStatus,
    }));
    const csv = toCsv(rows, [
      { key: "employeeCode", header: "Employee Code" },
      { key: "fullName", header: "Full Name" },
      { key: "department", header: "Department" },
      { key: "designation", header: "Designation" },
      { key: "workEmail", header: "Work Email" },
      { key: "status", header: "Status" },
    ]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="employees.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof UnauthenticatedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (error instanceof ForbiddenError) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    throw error;
  }
}
