import { PrismaClient } from "@@/prisma/generated/client";
import { runtimeLogger } from "@@/server/utils/logger";
import { PrismaPg } from "@prisma/adapter-pg";
import config from "@@/server/config";

if (!config.DATABASE_URL) {
  throw new Error("DATABASE_URL 未配置");
}

let schema = "public";

try {
  const url = new URL(config.DATABASE_URL);
  schema = url.searchParams.get("schema") || "public";
} catch {
  schema = "public";
}

const adapter = new PrismaPg({ connectionString: config.DATABASE_URL }, { schema });

const prisma = new PrismaClient({
  adapter
});

/** 测试数据库连接 */
const testConnection = async (): Promise<void> => {
  try {
    await prisma.$connect();
    runtimeLogger.success("数据库连接成功");
  } catch (error) {
    runtimeLogger.error("数据库连接失败:", error);
    throw error;
  }
};

testConnection();

export { prisma };
