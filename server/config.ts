import process from "node:process";
import path from "node:path";

/**
 * 获取当前工作目录
 * 保证路径相关常量基于实际运行位置计算
 */
const getCurrentWorkingDirectory = (): string => {
  return process.cwd();
};

const BASE_DIR = getCurrentWorkingDirectory();

const STATIC_PATH = path.join(BASE_DIR, "/static");

const PUBLIC_PATH = path.join(BASE_DIR, "/public");

const IMAGE_FOLDER_PATH = path.join(STATIC_PATH, "/images");

const CZDB_PATH = process.env.LY_CZDB_PATH || "/database";

const CZDB_IPV4_PATH = path.join(CZDB_PATH, "/v4.czdb");
const CZDB_IPV6_PATH = path.join(CZDB_PATH, "/v6.czdb");

const LOG_PATH = path.join(BASE_DIR, "/log");

/**
 * 校验环境变量是否存在且非空
 * 若不存在则抛出错误，终止进程启动
 */
const assertEnv = (key: string, value: unknown): string => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`环境变量 ${key} 未配置，请在环境文件或部署环境中设置该变量`);
  }
  return value;
};

// 强制校验关键配置项，任何缺失将直接抛出错误终止运行
const JWT_SECRET = assertEnv("LY_JWT_SECRET", process.env.LY_JWT_SECRET);
const DATABASE_URL = assertEnv("LY_DATABASE_URL", process.env.LY_DATABASE_URL);
const CZDB_KEY = assertEnv("LY_CZDB_KEY", process.env.LY_CZDB_KEY);

export default {
  // JWT 相关配置
  JWT_SECRET,
  JWT_ALG: "dir",
  JWT_ENC: "A128CBC-HS256",
  JWT_EXP: "3 h",
  JWT_EXP_7D: "7 d",

  // 目录相关配置
  BASE_DIR,
  STATIC_PATH,
  PUBLIC_PATH,
  IMAGE_FOLDER_PATH,

  // 数据库连接字符串
  DATABASE_URL,

  // 纯真数据库配置
  CZDB_KEY,
  CZDB_PATH,
  CZDB_IPV4_PATH,
  CZDB_IPV6_PATH,

  // 日志目录
  LOG_PATH
};
