export interface StorageProvider {
  read(filename: string): Promise<Buffer>;
  exists(filename: string): Promise<boolean>;
  save(buffer: Buffer, hash: string): Promise<string>;
  getPath(filename: string): Promise<string>;
  getUrl(filename: string): Promise<string>;
  delete(filename: string): Promise<void>;
}

export interface LocalStorageOptions {
  type: "local";
  basePath?: string;
  urlFormat?: string;
}

export interface MinioStorageOptions {
  type: "minio";
  basePath?: string;
  urlFormat?: string;
  endPoint: string;
  port?: number;
  region: string;
  bucket: string;
  useSSL?: boolean;
  accessKey: string;
  secretKey: string;
}

export type FileStorageOptions = LocalStorageOptions | MinioStorageOptions;
