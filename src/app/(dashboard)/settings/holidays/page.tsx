import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NewHolidayDialog } from "@/components/settings/new-holiday-dialog";
import { DeleteHolidayButton } from "@/components/settings/delete-holiday-button";
import { listHolidays } from "@/server/dal/holidays";

export default async function HolidaysPage() {
  const holidays = await listHolidays();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Holidays</h1>
          <p className="text-sm text-muted-foreground">
            Company-wide holidays. Attendance is automatically marked as holiday on these dates.
          </p>
        </div>
        <NewHolidayDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Recurring</TableHead>
            <TableHead className="w-1" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {holidays.map((holiday) => (
            <TableRow key={holiday.id}>
              <TableCell className="font-medium">{holiday.name}</TableCell>
              <TableCell>{new Date(holiday.date).toISOString().slice(0, 10)}</TableCell>
              <TableCell>{holiday.isRecurringYearly ? <Badge variant="secondary">Yearly</Badge> : "—"}</TableCell>
              <TableCell>
                <DeleteHolidayButton id={holiday.id} name={holiday.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
