import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NewShiftDialog } from "@/components/settings/new-shift-dialog";
import { DeleteShiftButton } from "@/components/settings/delete-shift-button";
import { listShifts } from "@/server/dal/organization";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export default async function ShiftsPage() {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  const shifts = await listShifts();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Shifts</h1>
          <p className="text-sm text-muted-foreground">
            Work schedules employees can be assigned to, with a lateness grace period.
          </p>
        </div>
        <NewShiftDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Grace</TableHead>
            <TableHead>Break</TableHead>
            <TableHead className="w-1" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map((shift) => (
            <TableRow key={shift.id}>
              <TableCell className="font-medium">
                {shift.name}
                {shift.isOvernight ? (
                  <span className="ml-2 text-xs text-muted-foreground">(overnight)</span>
                ) : null}
              </TableCell>
              <TableCell>
                {formatTime(shift.startTime)} – {formatTime(shift.endTime)}
              </TableCell>
              <TableCell>{shift.gracePeriodMinutes} min</TableCell>
              <TableCell>{shift.breakMinutes} min</TableCell>
              <TableCell>
                <DeleteShiftButton id={shift.id} name={shift.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
