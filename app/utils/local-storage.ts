import {
  del as deleteIDBKeyval,
  get as getIDBKeyval,
  keys as keysIDBKeyval,
  set as setIDBKeyval
} from "idb-keyval";

/**
 * 命令式本地存储工具：与 composable `useLocalStorage` 共享同一套降级策略，但不引入响应式开销。
 *
 * 适合在工具函数、模块顶层、Pinia action 等无 setup 上下文的场景下读写持久化数据。
 *
 * 后端选择：
 * - 优先使用 IndexedDB（容量更大、适合复杂对象）
 * - 不支持时降级到 localStorage
 *
 * 数据要求：仅支持 JSON-compatible 值，复杂对象（含函数、Symbol、循环引用等）不在范围内。
 */

export type LocalStorageOptions = {
  /**
   * 强制指定后端。默认按环境能力自动选择。
   */
  driver?: "auto" | "indexeddb" | "localstorage";
  /**
   * 自定义错误处理；不传则输出到 console.error。
   */
  onError?: (error: unknown) => void;
};

type LocalStorageDriver = "indexeddb" | "localstorage";

/**
 * 检查当前环境是否能使用 IndexedDB。
 *
 * SSR 或测试环境中可能不存在 `window`，因此访问前需要先做环境判断。
 */
const isIndexedDBSupported = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return typeof window.indexedDB !== "undefined";
};

/**
 * 检查当前环境是否能使用 localStorage。
 */
const isLocalStorageSupported = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return typeof window.localStorage !== "undefined";
  } catch {
    // Safari 隐私模式等场景访问 localStorage 会直接抛错。
    return false;
  }
};

const resolveDriver = (driver: LocalStorageOptions["driver"]): LocalStorageDriver => {
  if (driver === "indexeddb") {
    return "indexeddb";
  }

  if (driver === "localstorage") {
    return "localstorage";
  }

  return isIndexedDBSupported() ? "indexeddb" : "localstorage";
};

const handleError = (error: unknown, onError?: LocalStorageOptions["onError"]) => {
  if (onError) {
    onError(error);
    return;
  }

  console.error(error);
};

/**
 * 写入前统一走 JSON 序列化语义，和 composable useLocalStorage 保持一致。
 * 用于剥离 ref/proxy 等不可序列化包装，得到“干净”的可持久化副本。
 */
const toStorageValue = <T>(value: T): T => {
  const serializedValue = JSON.stringify(value);

  if (serializedValue === undefined) {
    return value;
  }

  return JSON.parse(serializedValue) as T;
};

const readFromLocalStorage = <T>(key: string): T | undefined => {
  const raw = window.localStorage.getItem(key);

  if (raw === null) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    // 兼容历史写入的纯字符串值。
    return raw as unknown as T;
  }
};

const writeToLocalStorage = <T>(key: string, value: T): void => {
  window.localStorage.setItem(key, JSON.stringify(toStorageValue(value)));
};

/**
 * 当前实例最终选择的存储后端。
 *
 * 调用方可据此展示能力提示，例如“当前正在使用 IndexedDB”。
 */
export const getLocalStorageDriver = (
  options?: Pick<LocalStorageOptions, "driver">
): LocalStorageDriver => {
  return resolveDriver(options?.driver);
};

/**
 * 读取指定 key 的持久化数据。
 *
 * 当数据不存在或解析失败时返回 `undefined`，由调用方自行处理默认值。
 */
export const readLocalStorage = async <T = unknown>(
  key: string,
  options?: LocalStorageOptions
): Promise<T | undefined> => {
  try {
    const driver = resolveDriver(options?.driver);

    if (driver === "indexeddb") {
      return await getIDBKeyval<T>(key);
    }

    if (!isLocalStorageSupported()) {
      return undefined;
    }

    return readFromLocalStorage<T>(key);
  } catch (error) {
    handleError(error, options?.onError);
    return undefined;
  }
};

/**
 * 写入指定 key 的持久化数据。
 *
 * 写入前会做一次 JSON roundtrip，避免把响应式包装或不可序列化字段落到底层存储里。
 */
export const writeLocalStorage = async <T>(
  key: string,
  value: T,
  options?: LocalStorageOptions
): Promise<boolean> => {
  try {
    const driver = resolveDriver(options?.driver);
    const storageValue = toStorageValue(value);

    if (driver === "indexeddb") {
      await setIDBKeyval(key, storageValue);
      return true;
    }

    if (!isLocalStorageSupported()) {
      return false;
    }

    writeToLocalStorage(key, storageValue);
    return true;
  } catch (error) {
    handleError(error, options?.onError);
    return false;
  }
};

/**
 * 删除指定 key 的持久化数据。
 */
export const removeLocalStorage = async (
  key: string,
  options?: LocalStorageOptions
): Promise<boolean> => {
  try {
    const driver = resolveDriver(options?.driver);

    if (driver === "indexeddb") {
      await deleteIDBKeyval(key);
      return true;
    }

    if (!isLocalStorageSupported()) {
      return false;
    }

    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    handleError(error, options?.onError);
    return false;
  }
};

/**
 * 以“读 -> 改 -> 写”的方式原子地更新指定 key。
 *
 * - 当 key 不存在时，updater 收到的入参为 `undefined`，便于按需返回初始值。
 * - 当 updater 返回 `undefined` 时，会删除该 key，与“清空草稿”等语义保持一致。
 *
 * 注意：受底层存储限制，这里并非真正的多页签事务，只是单调用内的串行更新。
 */
export const updateLocalStorage = async <T>(
  key: string,
  updater: (currentValue: T | undefined) => T | undefined | Promise<T | undefined>,
  options?: LocalStorageOptions
): Promise<T | undefined> => {
  try {
    const currentValue = await readLocalStorage<T>(key, options);
    const nextValue = await updater(currentValue);

    if (nextValue === undefined) {
      await removeLocalStorage(key, options);
      return undefined;
    }

    await writeLocalStorage(key, nextValue, options);
    return nextValue;
  } catch (error) {
    handleError(error, options?.onError);
    return undefined;
  }
};

/**
 * 列出当前后端中已存在的所有 key。
 *
 * 主要面向调试和清理场景；localStorage 路径下会一次性遍历全部条目。
 */
export const listLocalStorageKeys = async (options?: LocalStorageOptions): Promise<string[]> => {
  try {
    const driver = resolveDriver(options?.driver);

    if (driver === "indexeddb") {
      const keys = await keysIDBKeyval();
      return keys.map((key) => String(key));
    }

    if (!isLocalStorageSupported()) {
      return [];
    }

    const keys: string[] = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);

      if (key !== null) {
        keys.push(key);
      }
    }

    return keys;
  } catch (error) {
    handleError(error, options?.onError);
    return [];
  }
};
