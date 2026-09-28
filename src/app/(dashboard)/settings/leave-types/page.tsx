import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NewLeaveTypeDialog } from "@/components/settings/new-leave-type-dialog";
import { LeaveTypeActiveToggle } from "@/components/settings/leave-type-active-toggle";
import { listAllLeaveTypes } from "@/server/dal/leave-types";

export default async function LeaveTypesPage() {
  const leaveTypes = await listAllLeaveTypes();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Leave types</h1>
          <p className="text-sm text-muted-foreground">
            Types of leave employees can apply for, with a default yearly allocation.
          </p>
        </div>
        <NewLeaveTypeDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Days/year</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveTypes.map((leaveType) => (
            <TableRow key={leaveType.id}>
              <TableCell className="font-medium">
                {leaveType.name}
                {leaveType.description ? (
                  <p className="text-xs font-normal text-muted-foreground">{leaveType.description}</p>
                ) : null}
              </TableCell>
              <TableCell>{leaveType.daysPerYear?.toString() ?? "—"}</TableCell>
              <TableCell>
                {leaveType.isPaid ? <Badge variant="secondary">Paid</Badge> : <Badge variant="secondary">Unpaid</Badge>}
              </TableCell>
              <TableCell>
                <LeaveTypeActiveToggle id={leaveType.id} isActive={leaveType.isActive} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
