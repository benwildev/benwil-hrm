export type StoredFile = {
  key: string;
  url: string;
};

export interface StorageProvider {
  upload(params: { key: string; data: Buffer }): Promise<StoredFile>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}
