import { EmployeeForm } from "@/components/employees/employee-form";
import { updateEmployeeAction } from "@/server/actions/employees.actions";
import { getEmployee, listEmployeesForPicker } from "@/server/dal/employees";
import { listDepartments, listDesignations, listShifts } from "@/server/dal/organization";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  const [employee, departments, designations, shifts, managers] = await Promise.all([
    getEmployee(employeeId),
    listDepartments(),
    listDesignations(),
    listShifts(),
    listEmployeesForPicker(),
  ]);

  const action = updateEmployeeAction.bind(null, employeeId);

  return (
    <EmployeeForm
      mode="edit"
        action={action}
        currentEmployeeId={employee.id}
        defaults={{
          employeeCode: employee.employeeCode,
          biometricUserId: employee.biometricUserId,
          fullName: employee.fullName,
          profilePhotoUrl: employee.profilePhotoUrl,
          personalEmail: employee.personalEmail,
          workEmail: employee.workEmail,
          phone: employee.phone,
          dateOfBirth: toDateInputValue(employee.dateOfBirth),
          gender: employee.gender,
          maritalStatus: employee.maritalStatus,
          nationality: employee.nationality,
          bloodGroup: employee.bloodGroup,
          presentAddress: employee.presentAddress,
          permanentAddress: employee.permanentAddress,
          emergencyContactName: employee.emergencyContactName,
          emergencyContactRelationship: employee.emergencyContactRelationship,
          emergencyContactPhone: employee.emergencyContactPhone,
          joiningDate: toDateInputValue(employee.joiningDate),
          employmentType: employee.employmentType,
          employmentStatus: employee.employmentStatus,
          departmentId: employee.departmentId,
          designationId: employee.designationId,
          shiftId: employee.shiftId,
          reportingManagerId: employee.reportingManagerId,
        }}
        departments={departments}
        designations={designations}
        shifts={shifts}
        managers={managers.map((m) => ({ id: m.id, name: `${m.fullName} (${m.employeeCode})` }))}
        roles={[]}
      />
  );
}
