import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageProvider, StoredFile } from "@/server/storage/storage.interface";

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

function resolveSafePath(key: string) {
  const resolved = path.join(UPLOADS_ROOT, key);
  if (!resolved.startsWith(UPLOADS_ROOT)) {
    throw new Error("Invalid storage key.");
  }
  return resolved;
}

export class LocalStorageProvider implements StorageProvider {
  async upload({ key, data }: { key: string; data: Buffer }): Promise<StoredFile> {
    const filePath = resolveSafePath(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return { key, url: `/api/files/${key}` };
  }

  async download(key: string): Promise<Buffer> {
    return readFile(resolveSafePath(key));
  }

  async delete(key: string): Promise<void> {
    await unlink(resolveSafePath(key)).catch(() => undefined);
  }
}
