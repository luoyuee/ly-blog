import type { StorageProvider, FileStorageOptions } from "./types";
import { LocalStorageProvider } from "./local";
import { MinioStorageProvider } from "./minio";
import crypto from "crypto";

export function useFileStorage() {
  let strategy: StorageProvider;

  // switch (options.type) {
  //   case "local":
  //     strategy = new LocalStorageProvider(options);
  //     break;
  //   case "minio":
  //     strategy = new MinioStorageProvider(options);
  //     break;
  //   default:
  //     throw new Error("Unsupported storage type");
  // }

  strategy = new LocalStorageProvider({
    type: "local",
    basePath: "./static",
  });

  const getHash = (buffer: Buffer) => {
    // 创建hash对象
    const hash = crypto.createHash("sha256");
    // 更新hash对象的内容
    hash.update(buffer);
    // 生成hash摘要（十六进制格式）
    const digestHex = hash.digest("hex");
    return digestHex;
  };

  const save = async (buffer: Buffer, ext: string): Promise<string> => {
    const hash = getHash(buffer);
    console.log("hash", hash);
    const filename = hash + (ext[0] !== "." ? "." + ext : ext);

    return await strategy.save(buffer, filename);
  };

  const read = async (filename: string): Promise<Buffer> => {
    return await strategy.read(filename);
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

  return { save, read, delete: remove, getHash, getPath, getUrl, exists };
}
