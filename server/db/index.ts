import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

// SQLite数据库文件路径
const DATABASE_URL = process.env.DATABASE_URL || "file:../database/sqlite3.db";

export const prisma = new PrismaClient({
  datasourceUrl: DATABASE_URL,
});

/**
 * 检查并自动执行数据库迁移
 */
export async function checkAndMigrateDatabase() {
  try {
    console.log("检查SQLite数据库...");

    // 检查数据库目录是否存在
    const dbDir = join(process.cwd(), "database");
    if (!existsSync(dbDir)) {
      console.log(`创建数据库目录: ${dbDir}`);
      mkdirSync(dbDir, { recursive: true });
    }

    // 检查prisma/migrations目录是否存在
    const migrationsDir = join(process.cwd(), "prisma", "migrations");
    const hasMigrations = existsSync(migrationsDir);

    // 为SQLite设置环境变量
    const env = {
      ...process.env,
      DATABASE_URL,
    };

    if (hasMigrations) {
      // 如果有迁移文件，执行prisma migrate deploy命令应用迁移
      console.log("应用现有迁移...");
      execSync("npx prisma migrate deploy", {
        stdio: "inherit",
        env,
      });
    } else {
      // 如果没有迁移文件，创建初始迁移
      console.log("没有找到迁移文件，创建初始迁移...");
      execSync("npx prisma migrate dev --name init", {
        stdio: "inherit",
        env,
      });
    }

    console.log("SQLite数据库迁移完成");
    return Promise.resolve();
  } catch (error) {
    console.error("SQLite数据库迁移失败:", error);
    return Promise.reject(error);
  }
}
