import type { StorageProvider, FileStorageOptions, BinaryLike } from "./types";
import type { ReadStream } from "fs";
import type Stream from "stream";
import { LocalStorageProvider } from "./local";
import { MinioStorageProvider } from "./minio";
import config from "@@/server/config";
import crypto from "crypto";

export function useFileStorage(options?: FileStorageOptions) {
  let strategy: StorageProvider;

  if (!options) {
    strategy = new LocalStorageProvider({
      type: "local",
      basePath: config.FILE_PATH
    });
  } else {
    switch (options.type) {
      case "local":
        strategy = new LocalStorageProvider(options);
        break;
      case "minio":
        strategy = new MinioStorageProvider(options);
        break;
      default:
        throw new Error("Unsupported storage type");
    }
  }

  /**
   * 将多种二进制数据类型统一转换为 Buffer
   */
  const toBuffer = (data: BinaryLike): Buffer => {
    if (Buffer.isBuffer(data)) {
      return data;
    }

    if (ArrayBuffer.isView(data)) {
      return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    }

    return Buffer.from(data);
  };

  /**
   * 根据内容生成 SHA256 哈希值
   */
  const getHash = (data: BinaryLike): string => {
    const buffer = toBuffer(data);

    const hash = crypto.createHash("sha256");

    hash.update(buffer);

    const digestHex = hash.digest("hex");

    return digestHex;
  };

  const getSize = (data: BinaryLike): number => {
    const buffer = toBuffer(data);

    return buffer.byteLength;
  };

  /**
   * 保存文件内容并返回文件名
   */
  const save = async (data: BinaryLike, ext: string): Promise<string> => {
    const buffer = toBuffer(data);

    const hash = getHash(buffer);

    const filename = hash + (ext[0] !== "." ? "." + ext : ext);

    return await strategy.save(buffer, filename);
  };

  const read = async (filename: string): Promise<Buffer> => {
    return await strategy.read(filename);
  };

  const createReadStream = async (filename: string): Promise<Stream.Readable | ReadStream> => {
    return await strategy.createReadStream(filename);
  };

  const remove = async (filename: string): Promise<void> => {
    await strategy.delete(filename);
  };

  const getPath = async (filename: string): Promise<string> => {
    return await strategy.getPath(filename);
  };

  const getUrl = async (filename: string): Promise<string> => {
    return await strategy.getUrl(filename);
  };

  const exists = async (filename: string): Promise<boolean> => {
    return await strategy.exists(filename);
  };

  return {
    save,
    read,
    createReadStream,
    delete: remove,
    getHash,
    getPath,
    getSize,
    getUrl,
    exists
  };
}
