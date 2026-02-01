/**
 * 该任务用于执行完整备份：
 * - 备份数据库数据
 * - 备份 /data 目录中的文件
 * - 将上述内容压缩为 zip 文件，按时间命名存储到 /data/backup 中
 */
import { to as copyTo } from "pg-copy-streams";
import { pipeline } from "node:stream/promises";
import config from "@@/server/config";
import archiver from "archiver";
import path from "node:path";
import dayjs from "dayjs";
import fs from "node:fs";
import pg from "pg";

/**
 * 按依赖顺序排序好的表名常量：
 * - 表名来源于 prisma/schema.prisma 中各模型的 @@map
 * - 顺序基于模型间的外键依赖关系（父表在前，子表在后）
 * - 若后续修改 schema，需要手动维护该列表
 */
const BACKUP_TABLES: string[] = [
  "config",
  "hitokoto_type",
  "hitokoto",
  "note_folder",
  "note",
  "note_version",
  "article_category",
  "article",
  "article_comment",
  "image_folder",
  "image",
  "file_folder",
  "file",
  "user",
  "message_board",
  "fleeting_thought",
  "system_runtime_data",
  "dashboard"
];

/**
 * 确保目录存在：
 * - 若目录不存在则递归创建
 * - 若已存在则不做任何操作
 */
const ensureDirectoryExists = (directoryPath: string): void => {
  if (fs.existsSync(directoryPath)) return;
  fs.mkdirSync(directoryPath, { recursive: true });
};

/**
 * 对 PostgreSQL 标识符（schema、表名等）做安全转义：
 * - 替换内部的双引号为两个双引号
 * - 外层再包裹一层双引号
 * 这样可保证包含特殊字符（如连字符）的标识符也能被正确识别
 */
const quoteIdentifier = (identifier: string): string => {
  return `"${identifier.replace(/"/g, '""')}"`;
};

/**
 * 将指定 schema 下的所有表导出为 CSV 文件保存在指定目录
 *
 * 目录结构：
 * - dir/
 *   - table1.csv
 *   - table2.csv
 *   - ...
 *
 * @param client 已连接的 PostgreSQL 客户端
 * @param schema 需要导出的 schema 名称
 * @param dir    CSV 文件输出目录
 */
const backupDatabaseToDirectory = async (client: pg.PoolClient, schema: string, dir: string) => {
  ensureDirectoryExists(dir);

  const tables = BACKUP_TABLES;

  for (const tableName of tables) {
    console.log(`开始备份表：${tableName}`);
    const target = `${quoteIdentifier(schema)}.${quoteIdentifier(tableName)}`;
    const filePath = path.join(dir, `${tableName}.csv`);

    const copySql = `COPY ${target} TO STDOUT WITH CSV HEADER`;

    /**
     * 使用 COPY ... TO STDOUT 将表数据以 CSV 格式流式导出，
     * 再通过 pipeline 写入本地文件，避免一次性加载大量数据到内存。
     */
    const copyStream = client.query(copyTo(copySql));
    const fileStream = fs.createWriteStream(filePath, {
      encoding: "utf8"
    });

    await pipeline(copyStream, fileStream);
  }
};

/**
 * 复制指定目录列表到目标临时目录中：
 * - 支持传入多个目录路径（相对路径或绝对路径）
 * - 相对路径会以 WORK_DIR 为基准进行解析
 * - 自动排除 backup 目录本身，避免备份文件嵌套备份
 *
 * @param targetRoot  临时备份根目录，例如：/data/backup/tmp-xxxx
 * @param directories 需要备份的目录列表
 */
const copyDataDirectory = async (targetRoot: string, directories: string[]): Promise<void> => {
  for (const dir of directories) {
    const sourceDir = path.isAbsolute(dir) ? dir : path.join(config.WORK_DIR, dir);

    console.log(`开始备份目录：${sourceDir}`);

    if (!fs.existsSync(sourceDir)) {
      continue;
    }

    const targetDir = path.join(targetRoot, path.basename(sourceDir));

    ensureDirectoryExists(targetDir);

    await fs.promises.cp(sourceDir, targetDir, {
      recursive: true
    });
  }
};

/**
 * 将指定目录打包为 zip 压缩文件
 *
 * @param sourceDir  需要压缩的源目录（例如临时备份目录）
 * @param outputFile 输出 zip 文件路径
 */
const createZipArchive = async (sourceDir: string, outputFile: string): Promise<void> => {
  ensureDirectoryExists(path.dirname(outputFile));

  const output = fs.createWriteStream(outputFile);
  const archive = archiver("zip", {
    zlib: { level: 9 }
  });

  archive.pipe(output);

  archive.directory(sourceDir, false);

  await archive.finalize();

  await new Promise<void>((resolve, reject) => {
    output.on("close", () => resolve());
    output.on("error", (error) => reject(error));
  });
};

export default defineTask({
  meta: {
    name: "backup:full",
    description: "备份数据库所有数据和 data 目录内容到压缩包中"
  },
  async run() {
    /**
     * 使用服务端统一的 DATABASE_URL 配置，保证与 Prisma 等组件一致
     */
    const connectionString = config.DATABASE_URL;

    /**
     * 使用 dayjs 生成时间戳，用于区分每一次备份
     * 格式示例：2026-02-01-03-00
     */
    const timestamp = dayjs().format("YYYY-MM-DD-HH-mm");

    console.log(`执行备份：${timestamp}`);

    /**
     * 构造当前备份的临时目录：
     * - 主目录：/data/backup/tmp-时间戳
     * - 数据库导出目录：/data/backup/tmp-时间戳/db
     */
    const tempDir = path.join(config.BACKUP_PATH, `tmp-${timestamp}`);

    const dbBackupDir = path.join(tempDir, "db");

    ensureDirectoryExists(tempDir);

    /**
     * 创建 PostgreSQL 连接池，并获取一个客户端用于后续所有导出操作
     */
    const pool = new pg.Pool({
      connectionString
    });

    const client = await pool.connect();

    try {
      /**
       * 优先从连接串中解析 schema 参数（例如 ?schema=ly-blog-dev）
       * 若未配置则回退到 public
       */
      let schema = "public";

      try {
        const url = new URL(connectionString);
        const schemaParam = url.searchParams.get("schema");

        if (schemaParam) {
          schema = schemaParam;
        }
      } catch {
        schema = "public";
      }

      console.log(`开始备份数据库`);
      const backupDatabaseStartTime = Date.now();
      /**
       * 1. 导出指定 schema 下所有表数据到 dbBackupDir
       */
      await backupDatabaseToDirectory(client, schema, dbBackupDir);

      console.log(
        `数据库备份完成：${dbBackupDir} (耗时 ${Date.now() - backupDatabaseStartTime}ms)`
      );

      console.log(`开始备份数据目录`);
      const backupDataStartTime = Date.now();

      /**
       * 2. 复制指定目录到临时目录中（当前为 data，排除 backup）
       */
      await copyDataDirectory(tempDir, [config.FILE_PATH, config.LOG_PATH]);

      console.log(`数据目录备份完成：${tempDir} (耗时 ${Date.now() - backupDataStartTime}ms)`);

      /**
       * 3. 将整个临时目录打包成 zip 压缩文件，放入正式 backup 目录
       */
      console.log(`开始打包压缩文件`);
      const backupArchiveStartTime = Date.now();
      const archiveName = `backup-${timestamp}.zip`;
      const archivePath = path.join(config.BACKUP_PATH, archiveName);

      await createZipArchive(tempDir, archivePath);
      console.log(
        `压缩文件打包完成：${archivePath} (耗时 ${Date.now() - backupArchiveStartTime}ms)`
      );
    } finally {
      /**
       * 无论任务成功或失败，均需要保证：
       * - 释放数据库连接
       * - 关闭连接池
       * - 删除临时目录，避免磁盘被占满
       */
      client.release();
      await pool.end();

      await fs.promises.rm(tempDir, {
        recursive: true,
        force: true
      });
    }

    /**
     * 返回任务执行结果，方便通过 /_nitro/tasks 等方式查看最近一次备份信息
     */
    return {
      result: {
        ok: true,
        time: timestamp
      }
    };
  }
});
