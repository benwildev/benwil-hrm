import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewDeviceDialog } from "@/components/attendance/new-device-dialog";
import { DeleteDeviceButton } from "@/components/attendance/delete-device-button";
import { listDevices } from "@/server/dal/devices";

export default async function DevicesPage() {
  const devices = await listDevices();

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
          <h1 className="text-xl font-semibold">Biometric devices</h1>
          <p className="text-sm text-muted-foreground">
            Register a device here, then point it at this server so its punches sync automatically.
          </p>
        </div>
        <NewDeviceDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device setup</CardTitle>
          <CardDescription>
            On the device&apos;s network/server settings, set the server address to this app&apos;s URL and the
            path to <code className="rounded bg-muted px-1">/api/iclock</code> (e.g.{" "}
            <code className="rounded bg-muted px-1">https://yourdomain.com/iclock</code>). Enroll each
            employee&apos;s fingerprint using the numeric <strong>Biometric Device ID</strong> set on their
            profile (Employees → edit) as the device user ID/PIN — that&apos;s how punches get matched back
            to the right employee here.
          </CardDescription>
        </CardHeader>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Serial</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Last sync</TableHead>
            <TableHead className="w-1" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.id}>
              <TableCell className="font-medium">{device.deviceName}</TableCell>
              <TableCell className="text-muted-foreground">{device.deviceIdentifier}</TableCell>
              <TableCell>{device.locationName ?? "—"}</TableCell>
              <TableCell>
                {device.lastSyncAt ? new Date(device.lastSyncAt).toLocaleString() : "Never"}
              </TableCell>
              <TableCell>
                <DeleteDeviceButton id={device.id} name={device.deviceName} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
