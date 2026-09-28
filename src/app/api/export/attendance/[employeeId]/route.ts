import { NextResponse } from "next/server";
import { listAttendanceForEmployee } from "@/server/dal/attendance";
import { toCsv } from "@/lib/csv";
import { UnauthenticatedError } from "@/server/dal/session";
import { nowAsUtcNominal } from "@/server/attendance/calendar";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  const { employeeId } = await params;
  const { searchParams } = new URL(request.url);
  const now = nowAsUtcNominal();
  const year = Number(searchParams.get("year") ?? now.getUTCFullYear());
  const month = Number(searchParams.get("month") ?? now.getUTCMonth() + 1);

  try {
    const records = await listAttendanceForEmployee(employeeId, year, month);
    const rows = records.map((r) => ({
      date: r.attendanceDate.toISOString().slice(0, 10),
      checkIn: r.checkIn ? new Date(r.checkIn).toISOString().slice(11, 16) : "",
      checkOut: r.checkOut ? new Date(r.checkOut).toISOString().slice(11, 16) : "",
      lateMinutes: r.lateMinutes,
      earlyLeaveMinutes: r.earlyLeaveMinutes,
      overtimeMinutes: r.overtimeMinutes,
      status: r.status,
    }));
    const csv = toCsv(rows, [
      { key: "date", header: "Date" },
      { key: "checkIn", header: "Check In" },
      { key: "checkOut", header: "Check Out" },
      { key: "lateMinutes", header: "Late (min)" },
      { key: "earlyLeaveMinutes", header: "Early Leave (min)" },
      { key: "overtimeMinutes", header: "Overtime (min)" },
      { key: "status", header: "Status" },
    ]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance-${year}-${month}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof UnauthenticatedError) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error" }, { status: 403 });
  }
}
