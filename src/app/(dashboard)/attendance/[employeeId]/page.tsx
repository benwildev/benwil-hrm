import Link from "next/link";
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditAttendanceDialog } from "@/components/attendance/edit-attendance-dialog";
import { listAttendanceForEmployee } from "@/server/dal/attendance";
import { getHolidayChecker, isWeekend, nowAsUtcNominal } from "@/server/attendance/calendar";
import { prisma } from "@/lib/prisma";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  PRESENT: "default",
  LATE: "destructive",
  HALF_DAY: "secondary",
  ABSENT: "destructive",
  LEAVE: "secondary",
  HOLIDAY: "secondary",
  WEEKEND: "secondary",
};

function formatTime(date: Date | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(
    new Date(date),
  );
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

export default async function EmployeeAttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ employeeId: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { employeeId } = await params;
  const { year: yearParam, month: monthParam } = await searchParams;
  const now = nowAsUtcNominal();
  const year = yearParam ? Number(yearParam) : now.getUTCFullYear();
  const month = monthParam ? Number(monthParam) : now.getUTCMonth() + 1;

  const [employee, records, isHoliday] = await Promise.all([
    prisma.employee.findUniqueOrThrow({ where: { id: employeeId }, select: { id: true, fullName: true, employeeCode: true } }),
    listAttendanceForEmployee(employeeId, year, month),
    getHolidayChecker(),
  ]);

  const byDate = new Map(records.map((r) => [r.attendanceDate.toISOString().slice(0, 10), r]));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const present = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;

  const prevMonth = shiftMonth(year, month, -1);
  const nextMonth = shiftMonth(year, month, 1);
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/attendance" />}>
          <ArrowLeftIcon />
          Back to attendance
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{employee.fullName}</h1>
          <p className="text-sm text-muted-foreground">{employee.employeeCode} — {monthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/api/export/attendance/${employeeId}?year=${year}&month=${month}`} />}
          >
            <DownloadIcon />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            nativeButton={false}
            render={<Link href={`/attendance/${employeeId}?year=${prevMonth.year}&month=${prevMonth.month}`} />}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            nativeButton={false}
            render={<Link href={`/attendance/${employeeId}?year=${nextMonth.year}&month=${nextMonth.month}`} />}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Present</CardDescription>
            <CardTitle className="text-2xl">{present}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Late</CardDescription>
            <CardTitle className="text-2xl">{late}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Absent</CardDescription>
            <CardTitle className="text-2xl">{absent}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Check in</TableHead>
            <TableHead>Check out</TableHead>
            <TableHead>Late</TableHead>
            <TableHead>Overtime</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-1" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
            const day = new Date(`${dateStr}T00:00:00.000Z`);
            const record = byDate.get(dateStr) ?? null;
            const fallbackStatus = isHoliday(day) ? "HOLIDAY" : isWeekend(day) ? "WEEKEND" : "ABSENT";
            return (
              <TableRow key={dateStr}>
                <TableCell>{dateStr}</TableCell>
                <TableCell>{formatTime(record?.checkIn ?? null)}</TableCell>
                <TableCell>{formatTime(record?.checkOut ?? null)}</TableCell>
                <TableCell>{record && record.lateMinutes > 0 ? `${record.lateMinutes} min` : "—"}</TableCell>
                <TableCell>{record && record.overtimeMinutes > 0 ? `${record.overtimeMinutes} min` : "—"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[record?.status ?? fallbackStatus] ?? "secondary"}>
                    {(record?.status ?? fallbackStatus).replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <EditAttendanceDialog
                    employeeId={employeeId}
                    employeeName={employee.fullName}
                    date={dateStr}
                    checkIn={record?.checkIn ?? null}
                    checkOut={record?.checkOut ?? null}
                    status={record?.status ?? fallbackStatus}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
