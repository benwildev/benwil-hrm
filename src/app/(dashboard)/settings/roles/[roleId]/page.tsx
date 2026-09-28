import Link from "next/link";
import { ArrowLeftIcon, ShieldIcon, LockIcon } from "lucide-react";
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
    <div className="mx-auto max-w-6xl w-full space-y-6 pb-24">
      {/* Navigation Breadcrumb */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/settings/roles" />}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          <span>Back to Roles</span>
        </Button>
      </div>

      {/* Role Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/70">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-400 shrink-0">
            <ShieldIcon className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {role.name}
              </h1>
              {role.isSystem ? (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <LockIcon className="size-3" />
                  System Role
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Custom Role
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {role.description || "Manage access levels and granular permissions for this role."}
            </p>
          </div>
        </div>
      </div>

      {/* Main CRUD Matrix Form */}
      <RolePermissionsForm
        roleId={role.id}
        roleName={role.name}
        permissions={permissions}
        initialSelected={role.permissions.map((rp) => rp.permissionId)}
        disabled={role.isSystem && role.name === "Admin"}
      />
    </div>
  );
}
