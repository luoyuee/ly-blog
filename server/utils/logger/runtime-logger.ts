import { createConsola, LogLevels } from "consola";
import process from "node:process";

/**
 * 用于实时打印的运行时日志实例。
 * 仅负责控制台输出，不负责日志归档。
 */
export const runtimeLogger = createConsola({
  level: process.env.NODE_ENV === "development" ? LogLevels.debug : LogLevels.info
});
