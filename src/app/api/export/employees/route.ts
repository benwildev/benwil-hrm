import { NextResponse } from "next/server";
import { listEmployees } from "@/server/dal/employees";
import { toCsv } from "@/lib/csv";
import { ForbiddenError, UnauthenticatedError } from "@/server/dal/session";

export async function GET() {
  try {
    const employees = await listEmployees();

    // Flatten department/designation names into the export, since they're
    // nested relations on the DAL result, not top-level fields.
    const rows = employees.map((e) => ({
      employeeCode: e.employeeCode,
      fullName: e.fullName,
      department: e.department?.name ?? "",
      designation: e.designation?.name ?? "",
      workEmail: e.workEmail ?? "",
      phone: e.phone ?? "",
      status: e.employmentStatus,
      loginEmail: e.user?.email ?? "",
    }));
    const csv = toCsv(rows, [
      { key: "employeeCode", header: "Employee Code" },
      { key: "fullName", header: "Full Name" },
      { key: "department", header: "Department" },
      { key: "designation", header: "Designation" },
      { key: "workEmail", header: "Work Email" },
      { key: "phone", header: "Phone" },
      { key: "status", header: "Status" },
      { key: "loginEmail", header: "Login Email" },
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
