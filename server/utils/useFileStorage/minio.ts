import type { StorageProvider, MinioStorageOptions } from "./types";
import * as Minio from "minio";

export class MinioStorageProvider implements StorageProvider {
  private client: Minio.Client;

  bucket: string;
  endPoint: string;
  port: number;
  region: string;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;

  basePath?: string;
  urlFormat?: string;

  constructor(options: MinioStorageOptions) {
    this.basePath = options.basePath || "/storage";
    this.urlFormat = options.urlFormat;

    this.endPoint = options.endPoint;
    this.port = options.port || 443;
    this.region = options.region;
    this.bucket = options.bucket;
    this.useSSL = options.useSSL || true;
    this.accessKey = options.accessKey;
    this.secretKey = options.secretKey;

    this.client = new Minio.Client({
      endPoint: this.endPoint,
      port: this.port,
      region: this.region,
      useSSL: this.useSSL,
      accessKey: this.accessKey,
      secretKey: this.secretKey,
      pathStyle: false,
    });
  }

  private getFilePath = (filename: string) => {
    if (!this.basePath) {
      return `${filename.slice(0, 2)}/${filename.slice(2, 4)}/${filename}`;
    }

    const basePath = this.basePath.replace(/^\/|\/$/g, "");

    return `${basePath}/${filename.slice(0, 2)}/${filename.slice(
      2,
      4
    )}/${filename}`;
  };

  async read(filename: string) {
    const stream = await this.client.getObject(
      this.bucket,
      this.getFilePath(filename)
    );

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  async exists(filename: string) {
    try {
      await this.client.statObject(this.bucket, this.getFilePath(filename));
      return true;
    } catch {
      return false;
    }
  }

  async save(buffer: Buffer, filename: string) {
    await this.client.putObject(
      this.bucket,
      this.getFilePath(filename),
      buffer
    );
    return this.getUrl(filename);
  }

  async getPath(filename: string) {
    return this.getFilePath(filename);
  }

  async getUrl(filename: string) {
    if (this.urlFormat) {
      return (this.urlFormat = this.urlFormat
        .replace("${bucket}", this.bucket)
        .replace("${region}", this.region)
        .replace("${filename}", this.getFilePath(filename)));
    } else {
      return await this.client.presignedUrl(
        "GET",
        this.bucket,
        this.getFilePath(filename)
      );
    }
  }

  async delete(filename: string) {
    await this.client.removeObject(this.bucket, this.getFilePath(filename));
  }
}
