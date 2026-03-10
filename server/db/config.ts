import type { IServerConfig, IServerConfigStorage } from "#shared/types/config";
import type { JsonObject } from "@prisma/client/runtime/client";
import { isArray, isObject } from "@@/shared/utils/typed";
import { useStorage } from "#imports";
import { prisma } from "./index";
import { z } from "zod";

export const isJsonObject = (value: any): value is JsonObject => {
  return !!value && isObject(value) && !isArray(value);
};

/**
 * 获取服务端配置（server config）。
 *
 * - 默认会优先读取缓存（useStorage: "config:server"），命中则直接返回
 * - 当传入 { cache: false } 时跳过缓存，强制从数据库读取最新配置
 * - 无论是否使用缓存，只要成功从数据库读取到配置，都会写回缓存以便后续复用
 */
export const getServerConfig = async (options?: { cache?: boolean }): Promise<IServerConfig> => {
  if (options?.cache !== false) {
    const cache = await useStorage().getItem("config:server");

    if (cache) {
      return cache as IServerConfig;
    }
  }

  const config = await prisma.config.findFirst({
    where: {
      name: "server"
    }
  });

  if (!config) {
    return Promise.reject("Server configuration is missing.");
  }

  if (!isJsonObject(config.data)) {
    return Promise.reject("Server configuration error.");
  }

  await useStorage().setItem("config:server", config.data);

  return config.data as unknown as IServerConfig;
};

export const getStorageConfig = async (): Promise<Required<IServerConfigStorage>> => {
  const config = await getServerConfig();

  if (!config.storage) {
    return Promise.reject("Storage configuration is missing.");
  }

  const schame = z.object({
    type: z.enum(["local", "minio"]),
    base_path: z.string(),
    end_point: z.string(),
    url_format: z.string(),
    port: z.number(),
    region: z.string(),
    bucket: z.string(),
    use_ssl: z.boolean(),
    access_key: z.string(),
    secret_key: z.string()
  });

  const { error, data } = schame.safeParse(config.storage);

  if (error) {
    return Promise.reject("Invalid storage configuration format.");
  }

  return data as Required<IServerConfigStorage>;
};
