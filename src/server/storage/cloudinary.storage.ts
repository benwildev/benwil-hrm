import { cloudinary } from "@/server/storage/cloudinary-client";
import type { StorageProvider, StoredFile } from "@/server/storage/storage.interface";

// Employee documents (ID proofs, contracts, etc.) stay behind our own
// authenticated /api/files proxy regardless of backend — never a raw public
// Cloudinary URL — so uploads always go up as resource_type "raw", whose
// delivery URL is a deterministic function of the public_id alone
// (https://res.cloudinary.com/<cloud>/raw/upload/<public_id>). That means
// download()/delete() need no side-stored metadata to reconstruct where a
// file lives; the key doubles as the Cloudinary public_id.
export class CloudinaryStorageProvider implements StorageProvider {
  async upload({ key, data }: { key: string; data: Buffer }): Promise<StoredFile> {
    await new Promise<void>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: key, resource_type: "raw", overwrite: true },
        (error) => (error ? reject(error) : resolve()),
      );
      stream.end(data);
    });

    return { key, url: `/api/files/${key}` };
  }

  async download(key: string): Promise<Buffer> {
    const url = cloudinary.url(key, { resource_type: "raw", secure: true });
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file from Cloudinary (${response.status}).`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  async delete(key: string): Promise<void> {
    await cloudinary.uploader.destroy(key, { resource_type: "raw" }).catch(() => undefined);
  }
}
