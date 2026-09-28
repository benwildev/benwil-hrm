import { SimpleLookupManager } from "@/components/settings/simple-lookup-manager";
import { listDepartments } from "@/server/dal/organization";
import { createDepartmentAction, deleteDepartmentAction } from "@/server/actions/organization.actions";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export default async function DepartmentsPage() {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  const departments = await listDepartments();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Departments</h1>
        <p className="text-sm text-muted-foreground">Organize employees into departments.</p>
      </div>
      <SimpleLookupManager
        items={departments}
        itemLabel="department"
        createAction={createDepartmentAction}
        deleteAction={deleteDepartmentAction}
      />
    </div>
  );
}
