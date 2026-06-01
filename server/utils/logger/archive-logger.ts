import type { ArchiveLogData, ArchiveLogLevel } from "#shared/types/logger";
import type { Logger } from "winston";
import { isDate, isError, isMap, isPlainObject, isSet } from "es-toolkit";
import { setupRotateHandler } from "./archive-log-rotate";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "@@/server/config";
import process from "node:process";
import * as winston from "winston";
import dayjs from "dayjs";

export const LOG_DATE_PATTERN =
  process.env.NODE_ENV === "development" ? "YYYY-MM-DD-HH-mm" : "YYYY-MM-DD-HH";

export const transport: DailyRotateFile = new DailyRotateFile({
  filename: config.LOG_PATH + "/%DATE%.log",
  datePattern: LOG_DATE_PATTERN,
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d"
});

setupRotateHandler(transport);

const winstonLogger: Logger = winston.createLogger({
  level: "http",
  format: winston.format.printf((info) => String(info.message)),
  transports: [transport]
});

const buildPayload = (data: ArchiveLogData): Record<string, unknown> => {
  const time = dayjs().format("YYYY-MM-DDTHH:mm:ss.SSS");

  if (data === null || data === undefined) {
    return { time, message: data };
  }

  if (isError(data)) {
    return { time, name: data.name, message: data.message, stack: data.stack };
  }

  if (isDate(data)) {
    return { time, message: data.toISOString() };
  }

  if (isMap(data)) {
    return { time, ...Object.fromEntries(data) };
  }

  if (isSet(data)) {
    return { time, message: Array.from(data) };
  }

  if (isPlainObject(data)) {
    return { time, ...data };
  }

  return { time, message: data };
};

const log = (level: ArchiveLogLevel, data: ArchiveLogData): void => {
  const payload = { level: level.toUpperCase(), ...buildPayload(data) };
  winstonLogger[level](JSON.stringify(payload));
};

/**
 * 用于归档的全局日志实例。
 * 仅用于 HTTP 请求日志或需要长期保留的服务端日志。
 */
export const archiveLogger = {
  http: (data: ArchiveLogData) => log("http", data),
  info: (data: ArchiveLogData) => log("info", data),
  warn: (data: ArchiveLogData) => log("warn", data),
  error: (data: ArchiveLogData) => log("error", data),
  debug: (data: ArchiveLogData) => log("debug", data)
};
