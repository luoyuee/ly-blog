import type { ConsolaInstance, LogType } from "consola";
import { createConsola, LogLevels } from "consola";

type LogLevelValue = (typeof LogLevels)[LogType];

/**
 * 浏览器侧暴露给调试用的全局变量。
 *
 * - `__APP_LOG_LEVEL__`：当前实际生效的数字等级
 * - `__setAppLogLevel__`：写入新的等级到 localStorage，并更新当前 logger 基座
 *
 * 当前实现的语义是：修改后会更新 logger 基座并写入缓存，
 * 但已创建的带 tag 实例不会实时同步，刷新后会统一保持一致。
 * 这里保留 setter 的主要价值，是方便在控制台里统一调试和写入缓存，
 * 避免手动操作 localStorage 键值。
 */
type LoggerWindow = Window & {
  __APP_LOG_LEVEL__?: LogLevelValue;
  __setAppLogLevel__?: (level: LogType | LogLevelValue) => boolean;
};

/**
 * localStorage 中用于缓存日志等级的键。
 */
const APP_LOG_LEVEL_STORAGE_KEY = "app-log-level";

/**
 * 开发环境默认日志等级。
 */
const DEFAULT_DEV_LOG_LEVEL: LogType = "debug";

/**
 * 生产环境默认日志等级。
 */
const DEFAULT_PROD_LOG_LEVEL: LogType = "info";

/**
 * 根据当前环境得到默认日志等级名。
 */
const getDefaultLogLevel = (): LogType => {
  return import.meta.env.DEV ? DEFAULT_DEV_LOG_LEVEL : DEFAULT_PROD_LOG_LEVEL;
};

/**
 * 判断字符串是否为受支持的日志等级名。
 */
const isLoggerLevelName = (value: string): value is LogType => {
  return value in LogLevels;
};

/**
 * 判断数字是否为受支持的日志等级值。
 */
const isLoggerLevelValue = (value: number): value is LogLevelValue => {
  return Object.values(LogLevels).some((level) => level === value);
};

/**
 * 将外部输入归一化为数字等级。
 *
 * 支持：
 * - 数字值：如 `3`、`4`
 * - 数字字符串：如 `"3"`
 * - `consola` 支持的等级名：如 `"info"`、`"debug"`
 */
const normalizeLogLevel = (value: string | number | null | undefined): LogLevelValue | null => {
  if (typeof value === "number") {
    return isLoggerLevelValue(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  if (/^-?\d+$/.test(value)) {
    const parsedValue = Number(value);
    return isLoggerLevelValue(parsedValue) ? parsedValue : null;
  }

  if (isLoggerLevelName(value)) {
    return LogLevels[value];
  }

  return null;
};

/**
 * 将日志等级写入 localStorage。
 *
 * 缓存格式固定为数字字符串，便于后续直接比较和迁移。
 */
const setPersistedLogLevel = (level: LogLevelValue): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(APP_LOG_LEVEL_STORAGE_KEY, `${level}`);
    return true;
  } catch {
    return false;
  }
};

/**
 * 获取当前应生效的日志等级。
 *
 * 规则：
 * 1. 优先读取 localStorage 缓存
 * 2. 缓存不存在或非法时，按环境使用默认值
 * 3. 若使用了默认值，会立即写入 localStorage，确保后续行为一致
 */
const getPersistedLogLevel = (): LogLevelValue => {
  const defaultLevel = LogLevels[getDefaultLogLevel()];

  if (typeof window === "undefined") {
    return defaultLevel;
  }

  try {
    const cachedLevel = window.localStorage.getItem(APP_LOG_LEVEL_STORAGE_KEY);
    const normalizedLevel = normalizeLogLevel(cachedLevel);

    if (normalizedLevel !== null) {
      return normalizedLevel;
    }
  } catch {
    return defaultLevel;
  }

  setPersistedLogLevel(defaultLevel);
  return defaultLevel;
};

/**
 * 应用全局唯一的 logger 基座。
 *
 * 模块初始化时会先根据缓存确定初始 level。
 * 后续通过 setter 修改时，会更新 logger 基座并持久化到 localStorage。
 * 已经通过 `withTag()` 创建出的实例不会实时同步新的 level。
 */
const appBaseLogger = createConsola({
  level: getPersistedLogLevel()
});

/**
 * 设置新的日志等级。
 *
 * 这里会同时：
 * - 更新 logger 基座的 level
 * - 写入 localStorage
 * - 同步全局调试变量 `__APP_LOG_LEVEL__`
 *
 * 返回 `false` 表示输入非法，或日志等级写入缓存失败。
 */
const setAppLogLevel = (level: LogType | LogLevelValue): boolean => {
  const normalizedLevel = normalizeLogLevel(level);

  if (normalizedLevel === null) {
    return false;
  }

  const success = setPersistedLogLevel(normalizedLevel);
  if (!success) {
    appLogger.error("设置日志级别失败");
    return false;
  }

  appBaseLogger.level = normalizedLevel;
  appLogger.info(
    `日志级别已设置为: ${normalizedLevel}，已写入缓存；已创建的日志实例需要刷新页面后统一生效`
  );

  if (typeof window !== "undefined") {
    (window as LoggerWindow).__APP_LOG_LEVEL__ = normalizedLevel;
  }

  return true;
};

/**
 * 在浏览器全局挂调试入口。
 *
 * 之所以保留它们，是为了让开发者可以直接在控制台里：
 * - 读取当前数字级别：`window.__APP_LOG_LEVEL__`
 * - 写入新的级别：`window.__setAppLogLevel__("debug")`
 *
 * 其中：
 * - `__APP_LOG_LEVEL__` 暴露数字值
 * - `__setAppLogLevel__` 同时支持数字和字符串别名输入
 */
if (typeof window !== "undefined") {
  const loggerWindow = window as LoggerWindow;

  loggerWindow.__APP_LOG_LEVEL__ = appBaseLogger.level;
  loggerWindow.__setAppLogLevel__ = (level) => setAppLogLevel(level);
}

/**
 * 创建带 tag 的 logger。
 *
 * 当前项目使用同一个 logger 基座，并通过 `withTag()` 区分日志来源。
 */
export const createLogger = (tag?: string) => {
  return tag ? appBaseLogger.withTag(tag) : appBaseLogger;
};

/**
 * 应用通用 logger。
 */
export const appLogger = createLogger("app");

export type { ConsolaInstance, LogType, LogLevelValue };
