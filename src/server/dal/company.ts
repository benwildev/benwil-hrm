import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/dal/session";
import { PERMISSIONS } from "@/lib/permissions";
import { isValidOklch } from "@/lib/color";
import { cloudinary, isCloudinaryConfigured } from "@/server/storage/cloudinary-client";

const SINGLETON_ID = "singleton";

export async function getCompany() {
  const company = await prisma.company.findUnique({ where: { id: SINGLETON_ID } });
  if (company) return company;
  // Fallback defaults if seed hasn't run yet.
  return prisma.company.create({ data: { id: SINGLETON_ID } });
}

export type CompanyUpdateInput = Partial<{
  name: string;
  legalName: string | null;
  logoUrl: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  taxId: string | null;
  primaryColor: string;
  primaryForeground: string;
  accentColor: string;
  accentForeground: string;
  sidebarPrimary: string;
  sidebarAccent: string;
}>;

const COLOR_FIELDS = [
  "primaryColor",
  "primaryForeground",
  "accentColor",
  "accentForeground",
  "sidebarPrimary",
  "sidebarAccent",
] as const;

export async function updateCompany(data: CompanyUpdateInput) {
  await requirePermission(PERMISSIONS.COMPANY_MANAGE);

  for (const field of COLOR_FIELDS) {
    const value = data[field];
    if (value !== undefined && !isValidOklch(value)) {
      throw new Error(`Invalid color value for ${field}.`);
    }
  }

  return prisma.company.update({ where: { id: SINGLETON_ID }, data });
}

// The logo is meant to be publicly visible (sidebar, login screen), so it's
// stored as a normal public Cloudinary image and linked to directly —
// unlike employee documents, it doesn't need to go through the
// authenticated /api/files proxy.
export async function uploadCompanyLogo(data: Buffer): Promise<string> {
  await requirePermission(PERMISSIONS.COMPANY_MANAGE);

  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary isn't configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env first.",
    );
  }

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: "company/logo", resource_type: "image", overwrite: true, invalidate: true },
      (error, uploaded) => (error || !uploaded ? reject(error) : resolve(uploaded)),
    );
    stream.end(data);
  });

  await prisma.company.update({ where: { id: SINGLETON_ID }, data: { logoUrl: result.secure_url } });
  return result.secure_url;
}
