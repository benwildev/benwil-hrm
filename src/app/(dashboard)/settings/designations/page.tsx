import { SimpleLookupManager } from "@/components/settings/simple-lookup-manager";
import { listDesignations } from "@/server/dal/organization";
import { createDesignationAction, deleteDesignationAction } from "@/server/actions/organization.actions";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";

export default async function DesignationsPage() {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  const designations = await listDesignations();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Designations</h1>
        <p className="text-sm text-muted-foreground">Job titles employees can be assigned.</p>
      </div>
      <SimpleLookupManager
        items={designations}
        itemLabel="designation"
        createAction={createDesignationAction}
        deleteAction={deleteDesignationAction}
      />
    </div>
  );
}
