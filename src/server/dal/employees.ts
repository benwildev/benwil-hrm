import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import bcrypt from "bcryptjs";

export async function listEmployees() {
  await requirePermission(PERMISSIONS.EMPLOYEES_VIEW);
  return prisma.employee.findMany({
    where: { deletedAt: null },
    include: { department: true, designation: true, user: { select: { email: true } } },
    orderBy: { fullName: "asc" },
  });
}

export async function getEmployee(id: string) {
  await requirePermission(PERMISSIONS.EMPLOYEES_VIEW);
  return prisma.employee.findUniqueOrThrow({
    where: { id },
    include: {
      department: true,
      designation: true,
      shift: true,
      reportingManager: true,
      user: { select: { id: true, email: true, roleId: true, role: { select: { name: true } } } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function listEmployeesForPicker() {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  return prisma.employee.findMany({
    where: { deletedAt: null },
    select: { id: true, fullName: true, employeeCode: true },
    orderBy: { fullName: "asc" },
  });
}

export type EmployeeInput = {
  employeeCode: string;
  fullName: string;
  personalEmail?: string;
  workEmail?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  bloodGroup?: string;
  presentAddress?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  joiningDate: string;
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
  employmentStatus: "ACTIVE" | "ON_LEAVE" | "RESIGNED" | "TERMINATED" | "INACTIVE";
  departmentId?: string;
  designationId?: string;
  shiftId?: string;
  reportingManagerId?: string;
};

export type CreateEmployeeInput = EmployeeInput & {
  createLogin: boolean;
  loginEmail?: string;
  loginPassword?: string;
  roleId?: string;
};

function toDate(value?: string) {
  return value ? new Date(value) : undefined;
}

export async function createEmployee(input: CreateEmployeeInput) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);

  return prisma.$transaction(async (tx) => {
    let userId: string | undefined;

    if (input.createLogin) {
      if (!input.loginEmail || !input.loginPassword || !input.roleId) {
        throw new Error("Login email, password and role are required to create an account.");
      }
      const passwordHash = await bcrypt.hash(input.loginPassword, 12);
      const user = await tx.user.create({
        data: {
          email: input.loginEmail.toLowerCase(),
          passwordHash,
          roleId: input.roleId,
          status: "ACTIVE",
        },
      });
      userId = user.id;
    }

    return tx.employee.create({
      data: {
        employeeCode: input.employeeCode,
        fullName: input.fullName,
        personalEmail: input.personalEmail,
        workEmail: input.workEmail,
        phone: input.phone,
        dateOfBirth: toDate(input.dateOfBirth),
        gender: input.gender,
        maritalStatus: input.maritalStatus,
        nationality: input.nationality,
        bloodGroup: input.bloodGroup,
        presentAddress: input.presentAddress,
        permanentAddress: input.permanentAddress,
        emergencyContactName: input.emergencyContactName,
        emergencyContactRelationship: input.emergencyContactRelationship,
        emergencyContactPhone: input.emergencyContactPhone,
        joiningDate: new Date(input.joiningDate),
        employmentType: input.employmentType,
        employmentStatus: input.employmentStatus,
        departmentId: input.departmentId || undefined,
        designationId: input.designationId || undefined,
        shiftId: input.shiftId || undefined,
        reportingManagerId: input.reportingManagerId || undefined,
        userId,
      },
    });
  });
}

export async function updateEmployee(id: string, input: EmployeeInput) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  return prisma.employee.update({
    where: { id },
    data: {
      employeeCode: input.employeeCode,
      fullName: input.fullName,
      personalEmail: input.personalEmail,
      workEmail: input.workEmail,
      phone: input.phone,
      dateOfBirth: toDate(input.dateOfBirth),
      gender: input.gender,
      maritalStatus: input.maritalStatus,
      nationality: input.nationality,
      bloodGroup: input.bloodGroup,
      presentAddress: input.presentAddress,
      permanentAddress: input.permanentAddress,
      emergencyContactName: input.emergencyContactName,
      emergencyContactRelationship: input.emergencyContactRelationship,
      emergencyContactPhone: input.emergencyContactPhone,
      joiningDate: new Date(input.joiningDate),
      employmentType: input.employmentType,
      employmentStatus: input.employmentStatus,
      departmentId: input.departmentId || null,
      designationId: input.designationId || null,
      shiftId: input.shiftId || null,
      reportingManagerId: input.reportingManagerId || null,
    },
  });
}

export async function softDeleteEmployee(id: string) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  await prisma.employee.update({ where: { id }, data: { deletedAt: new Date() } });
}
