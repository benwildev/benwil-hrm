"use server";

import { revalidatePath } from "next/cache";
import { updateCompany, uploadCompanyLogo } from "@/server/dal/company";
import { hexToOklch, contrastingForeground } from "@/lib/color";

export type CompanyFormState = { error: string } | { success: true } | undefined;

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) return null;
  return value.trim();
}

export async function updateCompanyProfileAction(
  _prevState: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const name = formData.get("name");
  if (typeof name !== "string" || name.trim().length === 0) {
    return { error: "Company name is required." };
  }

  try {
    await updateCompany({
      name: name.trim(),
      legalName: optionalString(formData, "legalName"),
      addressLine: optionalString(formData, "addressLine"),
      city: optionalString(formData, "city"),
      state: optionalString(formData, "state"),
      country: optionalString(formData, "country"),
      postalCode: optionalString(formData, "postalCode"),
      phone: optionalString(formData, "phone"),
      email: optionalString(formData, "email"),
      taxId: optionalString(formData, "taxId"),
      timezone: optionalString(formData, "timezone") ?? "UTC",
      weekendDays: optionalString(formData, "weekendDays") ?? "0,6",
      enableAbsenceDeduction: formData.get("enableAbsenceDeduction") === "true" || formData.get("enableAbsenceDeduction") === "on",
      absenceCalculationBasis: optionalString(formData, "absenceCalculationBasis") ?? "WORKING_DAYS",
      absenceDeductionRate: Number(formData.get("absenceDeductionRate") || 100),
      enableLateDeduction: formData.get("enableLateDeduction") === "true" || formData.get("enableLateDeduction") === "on",
      lateGraceCount: Math.max(0, parseInt(String(formData.get("lateGraceCount") || "0"), 10)),
      lateDeductionBasis: optionalString(formData, "lateDeductionBasis") ?? "ONE_DAY_PER_3_LATES",
      lateDeductionRate: Number(formData.get("lateDeductionRate") || 100),
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update company." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function uploadCompanyLogoAction(
  _prevState: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an image to upload." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Logo must be smaller than 5 MB." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Logo must be an image file." };
  }

  try {
    const data = Buffer.from(await file.arrayBuffer());
    await uploadCompanyLogo(data);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to upload logo." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateCompanyBrandingAction(
  _prevState: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const primaryHex = formData.get("primaryHex");
  const accentHex = formData.get("accentHex");
  const sidebarHex = formData.get("sidebarHex");

  if (
    typeof primaryHex !== "string" ||
    typeof accentHex !== "string" ||
    typeof sidebarHex !== "string"
  ) {
    return { error: "Invalid color values." };
  }

  const primaryColor = hexToOklch(primaryHex);
  const accentColor = hexToOklch(accentHex);
  const sidebarPrimary = hexToOklch(sidebarHex);

  try {
    await updateCompany({
      primaryColor,
      primaryForeground: contrastingForeground(primaryColor),
      accentColor,
      accentForeground: contrastingForeground(accentColor),
      sidebarPrimary,
      sidebarAccent: accentColor,
    });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update branding." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
