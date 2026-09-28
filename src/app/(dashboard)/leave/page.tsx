import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplyLeaveDialog } from "@/components/leave/apply-leave-dialog";
import { ReviewLeaveButtons } from "@/components/leave/review-leave-buttons";
import { CancelLeaveButton } from "@/components/leave/cancel-leave-button";
import { listLeaveTypes } from "@/server/dal/leave-types";
import { listMyLeaveRequests, listPendingLeaveRequests } from "@/server/dal/leave-requests";
import { listBalancesForEmployee } from "@/server/dal/leave-balances";
import { getSession } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { nowAsUtcNominal } from "@/server/attendance/calendar";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  CANCELLED: "secondary",
};

function formatDate(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

export default async function LeavePage() {
  const session = await getSession();
  const user = session!.user;
  const canApprove = user.permissions.includes(PERMISSIONS.LEAVE_APPROVE);
  const currentYear = nowAsUtcNominal().getUTCFullYear();

  const [leaveTypes, myRequests, balances, pending] = await Promise.all([
    listLeaveTypes(),
    listMyLeaveRequests(),
    user.employeeId ? listBalancesForEmployee(user.employeeId, currentYear) : Promise.resolve([]),
    canApprove ? listPendingLeaveRequests() : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Leave</h1>
          <p className="text-sm text-muted-foreground">
            {currentYear} leave balance and requests.
          </p>
        </div>
        {user.employeeId ? (
          <ApplyLeaveDialog leaveTypes={leaveTypes.map((lt) => ({ id: lt.id, name: lt.name }))} />
        ) : null}
      </div>

      {balances.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {balances.map((b) => (
            <Card key={b.leaveType.id}>
              <CardHeader>
                <CardDescription>{b.leaveType.name}</CardDescription>
                <CardTitle className="text-2xl">{b.remainingDays.toString()}</CardTitle>
                <CardDescription>
                  of {b.allocatedDays.toString()} days remaining
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : null}

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">My requests</TabsTrigger>
          {canApprove ? <TabsTrigger value="approvals">Approvals ({pending.length})</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="mine" className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-1" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {myRequests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.leaveType.name}</TableCell>
                  <TableCell>
                    {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </TableCell>
                  <TableCell>{r.totalDays.toString()}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.status] ?? "secondary"}>{r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {r.status === "PENDING" ? <CancelLeaveButton requestId={r.id} /> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {canApprove ? (
          <TabsContent value="approvals" className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="w-1" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.employee.fullName}
                      <span className="ml-2 text-xs text-muted-foreground">{r.employee.employeeCode}</span>
                    </TableCell>
                    <TableCell>{r.leaveType.name}</TableCell>
                    <TableCell>
                      {formatDate(r.startDate)} – {formatDate(r.endDate)}
                    </TableCell>
                    <TableCell>{r.totalDays.toString()}</TableCell>
                    <TableCell className="max-w-48 truncate text-muted-foreground">{r.reason ?? "—"}</TableCell>
                    <TableCell>
                      <ReviewLeaveButtons requestId={r.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
