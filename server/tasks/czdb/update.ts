import type { ReadableStream } from "node:stream/web";
import { resetIPLocationSearcher } from "@@/server/utils/ip";
import { getServerConfig } from "@@/server/db/config";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import config from "@@/server/config";
import unzipper from "unzipper";
import path from "node:path";
import dayjs from "dayjs";
import fs from "node:fs";

/**
 * 确保目录存在（递归创建）。
 *
 * - 该任务会在 data/czdb（或配置路径）下写入 zip，并将库文件解压到目标路径
 * - 使用 promises.mkdir({ recursive: true })，目录已存在时不会报错
 */
const ensureDirectoryExists = async (directoryPath: string) => {
  await fs.promises.mkdir(directoryPath, { recursive: true });
};

/**
 * 判断文件（或目录）是否存在。
 *
 * - 用于备份/回滚过程中判断目标文件是否可被 rename
 * - 与 fs.existsSync 不同，这里使用 access 的异步版本，便于统一 async 流程
 */
const exists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * unzipper.Open.file 返回的 zip 目录项的最小结构。
 *
 * - path：zip 内的路径（可能包含目录层级）
 * - type：一般为 "File" / "Directory"
 * - stream()：返回可读流（已经按 zip 的压缩方式解码后的内容流）
 *
 * 这里不直接依赖 unzipper 的完整类型定义，是为了避免在不同版本的 unzipper 下出现类型差异导致的编译问题。
 */
type ZipDirectoryEntry = {
  path: string;
  type: string;
  stream: () => NodeJS.ReadableStream;
};

/**
 * 将 zip 中的单个文件项解压到指定路径。
 *
 * - 采用流式 pipeline，避免将大文件一次性读入内存
 * - 写入完成后校验输出文件大小，避免出现“解压成功但产物为空”的静默失败
 */
const extractZipEntryToFile = async (
  entry: ZipDirectoryEntry,
  outputPath: string
): Promise<void> => {
  await ensureDirectoryExists(path.dirname(outputPath));

  const fileStream = fs.createWriteStream(outputPath);
  await pipeline(entry.stream(), fileStream);

  const stat = await fs.promises.stat(outputPath);
  if (stat.size === 0) {
    throw new Error(`解压失败：输出文件为空 (${entry.path})`);
  }
};

/**
 * 下载远程文件到本地路径，并返回文件大小（字节数）。
 *
 * - 使用 fetch + Readable.fromWeb 将 Web Stream 转为 Node Stream
 * - 使用 10 分钟超时保护，避免长时间卡死
 * - 仅负责下载与落盘，不做内容校验（zip 是否可用在后续解压阶段验证）
 */
const downloadToFile = async (url: string, outputPath: string): Promise<number> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("下载超时"), 10 * 60 * 1000);

  try {
    const response = await fetch(url, {
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`下载失败：${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("下载失败：响应体为空");
    }

    await ensureDirectoryExists(path.dirname(outputPath));

    const fileStream = fs.createWriteStream(outputPath);
    const readable = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
    await pipeline(readable, fileStream);

    const stat = await fs.promises.stat(outputPath);
    return stat.size;
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * 从 zip 目录项中定位 CZDB 的 v4/v6 文件条目。
 *
 * 规则：
 * - 仅匹配文件（type === "File"）
 * - 必须以 .czdb 结尾
 * - 文件名（不区分大小写）中包含 "v4" 或 "v6" 关键字
 *
 * 说明：
 * - zip 内路径可能包含反斜杠/正斜杠，因此统一归一化后再判断
 */
const findCzdbEntries = (entries: ZipDirectoryEntry[]) => {
  const normalized = entries.map((entry) => ({
    ...entry,
    normalizedName: entry.path.replace(/\\/g, "/").toLowerCase()
  }));

  const v4 = normalized.find(
    (entry) =>
      entry.type === "File" &&
      entry.normalizedName.endsWith(".czdb") &&
      entry.normalizedName.includes("v4")
  );

  const v6 = normalized.find(
    (entry) =>
      entry.type === "File" &&
      entry.normalizedName.endsWith(".czdb") &&
      entry.normalizedName.includes("v6")
  );

  return { v4, v6 };
};

/**
 * 清理历史备份文件，仅保留最近一次备份。
 *
 * 背景：
 * - 本任务每次更新前都会为 v4/v6 生成一份带时间戳的备份文件：`${filePrefix}.bak-${timestamp}`
 * - 若不清理，备份会无限增长，占用磁盘空间
 *
 * 策略：
 * - 分别对 v4 与 v6 的备份文件进行清理
 * - 按文件 mtime（最后修改时间）倒序排序
 * - 仅保留最新的 1 个备份，其余全部删除
 */
const cleanupOldBackups = async () => {
  /**
   * 清理某一类备份（v4 或 v6）。
   *
   * @param filePrefix 原数据库文件名（如 v4.czdb / v6.czdb）
   */
  const cleanupByPrefix = async (filePrefix: string) => {
    // 读取备份目录下的所有文件条目（使用 Dirent 过滤文件/目录）
    const dirents = await fs.promises.readdir(config.CZDB_PATH, { withFileTypes: true });
    const candidates = dirents
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => name.startsWith(`${filePrefix}.bak-`))
      .map((name) => path.join(config.CZDB_PATH, name));

    // 获取备份文件的 mtime，用于判断“最新备份”
    const withStat = await Promise.all(
      candidates.map(async (filePath) => {
        const stat = await fs.promises.stat(filePath);
        return { filePath, mtimeMs: stat.mtimeMs };
      })
    );

    // mtime 倒序：第一个即最新备份
    withStat.sort((a, b) => b.mtimeMs - a.mtimeMs);

    // 仅保留最新 1 个，其余删除
    const oldFiles = withStat.slice(1).map((item) => item.filePath);
    await Promise.all(oldFiles.map((filePath) => fs.promises.rm(filePath, { force: true })));
  };

  await cleanupByPrefix(config.CZDB_IPV4_FILE_NAME);
  await cleanupByPrefix(config.CZDB_IPV6_FILE_NAME);
};

/**
 * 原子化替换 v4/v6 数据库文件，并提供回滚能力。
 *
 * 目标：
 * - v4/v6 都成功替换后才算更新完成
 * - 任何一步失败都回滚到旧版本，避免出现“v4 新、v6 旧”这种半更新状态
 *
 * 实现策略：
 * - 先将当前线上文件重命名为 `.bak-${timestamp}`（备份）
 * - 再将 zip 中的 v4/v6 文件直接解压到目标路径
 * - 若过程中抛错：
 *   - 清理解压出的目标文件（避免留下半成品）
 *   - 再恢复备份文件
 */
const replaceDatabases = async (params: {
  v4Entry: ZipDirectoryEntry;
  v6Entry: ZipDirectoryEntry;
  timestamp: string;
}) => {
  const v4TargetPath = config.CZDB_IPV4_PATH;
  const v6TargetPath = config.CZDB_IPV6_PATH;

  const v4BackupPath = path.join(
    config.CZDB_PATH,
    `${config.CZDB_IPV4_FILE_NAME}.bak-${params.timestamp}`
  );
  const v6BackupPath = path.join(
    config.CZDB_PATH,
    `${config.CZDB_IPV6_FILE_NAME}.bak-${params.timestamp}`
  );

  const backups: { target: string; backup: string }[] = [];

  const stageBackup = async (targetPath: string, backupPath: string) => {
    if (!(await exists(targetPath))) return;
    await fs.promises.rename(targetPath, backupPath);
    backups.push({ target: targetPath, backup: backupPath });
  };

  const rollback = async () => {
    if (await exists(v4TargetPath)) {
      await fs.promises.rm(v4TargetPath, { force: true });
    }

    if (await exists(v6TargetPath)) {
      await fs.promises.rm(v6TargetPath, { force: true });
    }

    for (const item of backups.reverse()) {
      if (await exists(item.backup)) {
        await fs.promises.rename(item.backup, item.target);
      }
    }
  };

  await ensureDirectoryExists(config.CZDB_PATH);

  await stageBackup(v4TargetPath, v4BackupPath);
  await stageBackup(v6TargetPath, v6BackupPath);

  try {
    await extractZipEntryToFile(params.v4Entry, v4TargetPath);
    await extractZipEntryToFile(params.v6Entry, v6TargetPath);
  } catch (error) {
    await rollback();
    throw error;
  }
};

export default defineTask({
  meta: {
    name: "czdb:update",
    description: "下载并更新 CZDB 的 v4/v6 数据库文件"
  },
  async run() {
    /**
     * 下载链接来自数据库配置：
     * - 若未配置（或读取失败），任务直接跳过
     */
    const timestamp = dayjs().format("YYYY-MM-DD-HH-mm");

    let downloadUrl: string | undefined = undefined;

    try {
      const serverConfig = await getServerConfig({ cache: false });
      downloadUrl = serverConfig.czdb?.download_url;
    } catch {
      downloadUrl = undefined;
    }

    if (!downloadUrl) {
      console.log("未配置 CZDB 下载链接，跳过更新");
      return {
        result: {
          ok: true,
          time: timestamp
        }
      };
    }

    await ensureDirectoryExists(config.CZDB_PATH);

    /**
     * zip 下载路径带时间戳，避免并发/重入导致覆盖。
     *
     * - 成功或失败都会在 finally 中删除 zip，避免磁盘持续增长
     */
    const zipPath = path.join(config.CZDB_PATH, `czdb-${timestamp}.zip`);

    try {
      /**
       * 1) 下载 zip 到本地
       * 2) 使用 unzipper 读取 zip 目录，定位 v4/v6 文件条目
       * 3) 先备份旧库，再将 v4/v6 直接解压到目标路径（失败则回滚）
       * 4) 重置内存中的 searcher（下一次查询会按新库重新初始化）
       */
      const zipSize = await downloadToFile(downloadUrl, zipPath);
      if (zipSize === 0) {
        throw new Error("下载失败：zip 文件为空");
      }

      const zipDirectory = await unzipper.Open.file(zipPath);
      const entries = zipDirectory.files as ZipDirectoryEntry[];
      const { v4, v6 } = findCzdbEntries(entries);

      if (!v4 || !v6) {
        const names = entries
          .map((e) => e.path)
          .slice(0, 20)
          .join(", ");
        throw new Error(`zip 中未找到 v4/v6 czdb 文件，前 20 项：${names}`);
      }

      await replaceDatabases({
        v4Entry: v4,
        v6Entry: v6,
        timestamp
      });

      resetIPLocationSearcher();

      return {
        result: {
          ok: true,
          time: timestamp
        }
      };
    } finally {
      await fs.promises.rm(zipPath, { force: true });
      await cleanupOldBackups().catch(() => undefined);
    }
  }
});
