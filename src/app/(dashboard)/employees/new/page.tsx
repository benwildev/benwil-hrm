import { EmployeeForm } from "@/components/employees/employee-form";
import { createEmployeeAction } from "@/server/actions/employees.actions";
import { listDepartments, listDesignations, listShifts } from "@/server/dal/organization";
import { listEmployeesForPicker } from "@/server/dal/employees";
import { listRolesForAssignment } from "@/server/dal/roles";

export default async function NewEmployeePage() {
  const [departments, designations, shifts, managers, roles] = await Promise.all([
    listDepartments(),
    listDesignations(),
    listShifts(),
    listEmployeesForPicker(),
    listRolesForAssignment(),
  ]);

  return (
    <EmployeeForm
      mode="create"
      action={createEmployeeAction}
      departments={departments}
      designations={designations}
      shifts={shifts}
      managers={managers.map((m) => ({ id: m.id, name: `${m.fullName} (${m.employeeCode})` }))}
      roles={roles}
    />
  );
}
