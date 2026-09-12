import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { cloudinary, isCloudinaryConfigured } from "@/server/storage/cloudinary-client";
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
  profilePhotoUrl?: string | null;
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
        profilePhotoUrl: input.profilePhotoUrl || null,
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
      profilePhotoUrl: input.profilePhotoUrl !== undefined ? input.profilePhotoUrl : undefined,
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

export async function uploadEmployeePhoto(
  data: Buffer,
  identifier = "avatar"
): Promise<string> {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);

  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary isn't configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env first."
    );
  }

  const publicId = `employees/${identifier}_${Date.now()}`;
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "benwil_hrm/employees",
        public_id: publicId,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
        ],
      },
      (error, uploaded) => (error || !uploaded ? reject(error) : resolve(uploaded))
    );
    stream.end(data);
  });

  return result.secure_url;
}

export async function softDeleteEmployee(id: string) {
  await requirePermission(PERMISSIONS.EMPLOYEES_MANAGE);
  return prisma.$transaction(async (tx) => {
    const employee = await tx.employee.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (employee?.userId) {
      await tx.user.update({
        where: { id: employee.userId },
        data: { status: "INACTIVE" },
      });
    }
    return tx.employee.update({
      where: { id },
      data: { deletedAt: new Date(), employmentStatus: "TERMINATED" },
    });
  });
}

export type EmployeePaymentDetailsInput = {
  paymentMethod: string;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankRoutingNumber?: string | null;
  mobileBankingProvider?: string | null;
  mobileBankingNumber?: string | null;
};

export async function updateEmployeePaymentDetails(id: string, input: EmployeePaymentDetailsInput) {
  await requirePermission(PERMISSIONS.PAYROLL_MANAGE);
  return prisma.employee.update({
    where: { id },
    data: {
      paymentMethod: input.paymentMethod,
      bankName: input.bankName ?? null,
      bankAccountName: input.bankAccountName ?? null,
      bankAccountNumber: input.bankAccountNumber ?? null,
      bankRoutingNumber: input.bankRoutingNumber ?? null,
      mobileBankingProvider: input.mobileBankingProvider ?? null,
      mobileBankingNumber: input.mobileBankingNumber ?? null,
    },
  });
}

