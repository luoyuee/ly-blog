import type { StorageProvider, LocalStorageOptions } from "./types";
import path from "path";
import fs from "fs";

export class LocalStorageProvider implements StorageProvider {
  basePath: string;
  urlFormat: string;

  constructor(options: LocalStorageOptions) {
    this.basePath = options.basePath || "./static";
    this.urlFormat = options.urlFormat || "/static/${filename}";
  }

  private getFilePath = (filename: string) => {
    return path.join(
      this.basePath,
      `${filename.slice(0, 2)}/${filename.slice(2, 4)}/${filename}`
    );
  };

  async read(filename: string) {
    return await fs.promises.readFile(this.getFilePath(filename));
  }

  async exists(filename: string) {
    try {
      await fs.promises.access(this.getFilePath(filename));
      return true;
    } catch {
      return false;
    }
  }

  async save(buffer: Buffer, filename: string) {
    const filePath = this.getFilePath(filename);

    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
  }

  async getPath(filename: string) {
    return this.getFilePath(filename);
  }

  async getUrl(filename: string) {
    const hashPath = `${filename.slice(0, 2)}/${filename.slice(
      2,
      4
    )}/${filename}`;

    return this.urlFormat.replace("${filename}", hashPath);
  }

  async delete(filename: string) {
    await fs.promises.unlink(this.getFilePath(filename));
  }
}
