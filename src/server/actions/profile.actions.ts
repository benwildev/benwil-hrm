"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/server/dal/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/server/audit/audit";

export type ProfileFormState = {
  error?: string;
  success?: string;
} | undefined;

function str(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function updateMyContactInfoAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "You must be signed in to perform this action." };
  }

  // Find employee record linked to current user
  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });

  if (!employee) {
    return { error: "No employee profile found linked to your account." };
  }

  const phone = str(formData, "phone") || null;
  const personalEmail = str(formData, "personalEmail") || null;
  const presentAddress = str(formData, "presentAddress") || null;
  const emergencyContactName = str(formData, "emergencyContactName") || null;
  const emergencyContactRelationship = str(formData, "emergencyContactRelationship") || null;
  const emergencyContactPhone = str(formData, "emergencyContactPhone") || null;

  try {
    const oldData = {
      phone: employee.phone,
      personalEmail: employee.personalEmail,
      presentAddress: employee.presentAddress,
      emergencyContactName: employee.emergencyContactName,
      emergencyContactRelationship: employee.emergencyContactRelationship,
      emergencyContactPhone: employee.emergencyContactPhone,
    };

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        phone,
        personalEmail,
        presentAddress,
        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactPhone,
      },
    });

    await logAudit({
      actorId: session.user.id,
      action: "employee:self-contact:update",
      entityType: "Employee",
      entityId: employee.id,
      oldData,
      newData: {
        phone: updated.phone,
        personalEmail: updated.personalEmail,
        presentAddress: updated.presentAddress,
        emergencyContactName: updated.emergencyContactName,
        emergencyContactRelationship: updated.emergencyContactRelationship,
        emergencyContactPhone: updated.emergencyContactPhone,
      },
    });

    revalidatePath("/profile");
    revalidatePath(`/employees/${employee.id}`);
    return { success: "Contact information updated successfully." };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to update contact information.",
    };
  }
}
