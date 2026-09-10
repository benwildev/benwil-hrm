import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, UploadIcon, RadioTowerIcon } from "lucide-react";
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
import { EditAttendanceDialog } from "@/components/attendance/edit-attendance-dialog";
import { listAttendanceForDate } from "@/server/dal/attendance";
import { defaultStatusForDate, nowAsUtcNominal } from "@/server/attendance/calendar";

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

function shiftDate(dateStr: string, deltaDays: number) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? nowAsUtcNominal().toISOString().slice(0, 10);
  const dayDate = new Date(`${date}T00:00:00.000Z`);
  const [rows, fallbackStatus] = await Promise.all([
    listAttendanceForDate(dayDate),
    defaultStatusForDate(dayDate),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Attendance</h1>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" nativeButton={false} render={<Link href={`/attendance?date=${shiftDate(date, -1)}`} />}>
            <ChevronLeftIcon />
          </Button>
          <Button variant="outline" size="icon-sm" nativeButton={false} render={<Link href={`/attendance?date=${shiftDate(date, 1)}`} />}>
            <ChevronRightIcon />
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/attendance/import" />}>
            <UploadIcon />
            Import CSV
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/attendance/devices" />}>
            <RadioTowerIcon />
            Devices
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Check in</TableHead>
            <TableHead>Check out</TableHead>
            <TableHead>Late</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-1" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ employee, record }) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                <Link href={`/attendance/${employee.id}`} className="hover:underline">
                  {employee.fullName}
                </Link>
                <span className="ml-2 text-xs text-muted-foreground">{employee.employeeCode}</span>
              </TableCell>
              <TableCell className="text-muted-foreground">{employee.department?.name ?? "—"}</TableCell>
              <TableCell>{formatTime(record?.checkIn ?? null)}</TableCell>
              <TableCell>{formatTime(record?.checkOut ?? null)}</TableCell>
              <TableCell>{record && record.lateMinutes > 0 ? `${record.lateMinutes} min` : "—"}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[record?.status ?? fallbackStatus] ?? "secondary"}>
                  {(record?.status ?? fallbackStatus).replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                <EditAttendanceDialog
                  employeeId={employee.id}
                  employeeName={employee.fullName}
                  date={date}
                  checkIn={record?.checkIn ?? null}
                  checkOut={record?.checkOut ?? null}
                  status={record?.status ?? fallbackStatus}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
