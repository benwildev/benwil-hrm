import { LocalStorageProvider } from "@/server/storage/local.storage";
import { CloudinaryStorageProvider } from "@/server/storage/cloudinary.storage";
import { isCloudinaryConfigured } from "@/server/storage/cloudinary-client";
import type { StorageProvider } from "@/server/storage/storage.interface";

// Cloudinary when CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET are set in .env,
// otherwise local disk — swapping providers needs no changes to calling
// code, since everything depends on the StorageProvider interface.
export const storage: StorageProvider = isCloudinaryConfigured()
  ? new CloudinaryStorageProvider()
  : new LocalStorageProvider();

export function buildDocumentKey(employeeId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `employees/${employeeId}/${crypto.randomUUID()}-${safeName}`;
}
