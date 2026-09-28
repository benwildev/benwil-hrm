import Link from "next/link";
import { ChevronRightIcon, LockIcon } from "lucide-react";
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
import { NewRoleDialog } from "@/components/settings/new-role-dialog";
import { DeleteRoleButton } from "@/components/settings/delete-role-button";
import { listRoles } from "@/server/dal/roles";

export default async function RolesPage() {
  const roles = await listRoles();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Roles &amp; permissions</h1>
          <p className="text-sm text-muted-foreground">
            Create roles and choose which permissions each one grants.
          </p>
        </div>
        <NewRoleDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Users</TableHead>
            <TableHead className="w-1" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{role.name}</span>
                  {role.isSystem ? (
                    <Badge variant="secondary">
                      <LockIcon className="size-3" />
                      System
                    </Badge>
                  ) : null}
                </div>
                {role.description ? (
                  <p className="text-xs text-muted-foreground">{role.description}</p>
                ) : null}
              </TableCell>
              <TableCell>{role.permissions.length}</TableCell>
              <TableCell>{role._count.users}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/settings/roles/${role.id}`} />}
                  >
                    <ChevronRightIcon />
                    <span className="sr-only">Edit {role.name}</span>
                  </Button>
                  {!role.isSystem ? (
                    <DeleteRoleButton roleId={role.id} roleName={role.name} />
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
