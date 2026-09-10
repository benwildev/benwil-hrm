import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RolePermissionsForm } from "@/components/settings/role-permissions-form";
import { getRole, listPermissions } from "@/server/dal/roles";

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ roleId: string }>;
}) {
  const { roleId } = await params;
  const [role, permissions] = await Promise.all([getRole(roleId), listPermissions()]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/settings/roles" />}>
          <ArrowLeftIcon />
          Back to roles
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">{role.name}</h1>
        {role.isSystem ? <Badge variant="secondary">System role</Badge> : null}
      </div>
      {role.description ? (
        <p className="-mt-2 text-sm text-muted-foreground">{role.description}</p>
      ) : null}

      <RolePermissionsForm
        roleId={role.id}
        permissions={permissions}
        initialSelected={role.permissions.map((rp) => rp.permissionId)}
        disabled={role.isSystem && role.name === "Admin"}
      />
    </div>
  );
}
