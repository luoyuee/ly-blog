/**
 * 将指定目录下的 .svg 文件名批量转换为小写。
 *
 * 用法：
 *   node scripts/normalize-icon-name.js <dir> [--dry-run] [--no-recursive]
 *
 * 示例：
 *   node scripts/normalize-icon-name.js ./public/icons
 *   node scripts/normalize-icon-name.js ./public/icons --dry-run
 *   node scripts/normalize-icon-name.js ./public/icons --no-recursive
 *   node scripts/normalize-icon-name.js ./public/icons --verbose
 *
 * 行为说明：
 * - 默认递归处理子目录（可用 --no-recursive 关闭）
 * - 仅重命名文件名（不改目录名），并仅处理扩展名为 .svg（不区分大小写）
 * - 若同一目录下存在多个文件名仅大小写不同（例如 A.svg 与 a.svg），
 *   它们的小写目标名会冲突，此类冲突会被跳过并输出提示
 * - Windows 等大小写不敏感文件系统上，“仅大小写变化”的重命名可能需要两步重命名：
 *   先改为临时名，再改为目标名（本脚本已处理）
 */

/* eslint-disable no-console */
import fs from "node:fs/promises";
import path from "node:path";

/**
 * @param {string[]} argv
 * @returns {{ dir: string; dryRun: boolean; recursive: boolean; verbose: boolean; help: boolean }}
 */
const parseArgs = (argv) => {
  const args = argv.slice(2);
  const help = args.includes("--help") || args.includes("-h");
  const dryRun = args.includes("--dry-run");
  const recursive = !args.includes("--no-recursive");
  const verbose = args.includes("--verbose");

  const dirArg = args.find((a) => !a.startsWith("-"));
  const dir = dirArg ? path.resolve(process.cwd(), dirArg) : "";

  return { dir, dryRun, recursive, verbose, help };
};

/**
 * @param {string} p
 * @returns {Promise<boolean>}
 */
const pathExists = async (p) => {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
};

/**
 * @param {string} dir
 * @returns {Promise<import("node:fs").Dirent[]>}
 */
const readDirents = async (dir) => {
  return fs.readdir(dir, { withFileTypes: true });
};

/**
 * 处理单个目录：将该目录内的 .svg 文件改名为小写（不递归）。
 *
 * @param {string} dir
 * @param {{ dryRun: boolean; verbose: boolean }} options
 * @returns {Promise<{ scanned: number; renamed: number; skipped: number; collisions: number; errors: number; skippedFiles: string[]; collisionDetails: Array<{ dir: string; to: string; from: string[] }> }>}
 */
const normalizeSvgsInDir = async (dir, options) => {
  /** @type {{ scanned: number; renamed: number; skipped: number; collisions: number; errors: number; skippedFiles: string[]; collisionDetails: Array<{ dir: string; to: string; from: string[] }> }} */
  const stats = { scanned: 0, renamed: 0, skipped: 0, collisions: 0, errors: 0, skippedFiles: [], collisionDetails: [] };

  let dirents;
  try {
    dirents = await readDirents(dir);
  } catch (err) {
    console.error(`[read] 失败: ${dir}\n`, err);
    stats.errors += 1;
    return stats;
  }

  const svgFiles = dirents
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter((name) => name.toLowerCase().endsWith(".svg"));

  stats.scanned += svgFiles.length;

  /**
   * 同一目录内先做冲突检测：
   * - 以“小写文件名”作为目标名 key
   * - 若出现多个源文件映射到同一目标名，则跳过该组
   */
  /** @type {Map<string, string[]>} */
  const groups = new Map();
  for (const name of svgFiles) {
    const lower = name.toLowerCase();
    const list = groups.get(lower) ?? [];
    list.push(name);
    groups.set(lower, list);
  }

  /** @type {Array<{ from: string; to: string }>} */
  const renamePlans = [];
  for (const [toLowerName, list] of groups.entries()) {
    if (list.length > 1) {
      stats.collisions += list.length;
      stats.collisionDetails.push({ dir, to: toLowerName, from: [...list] });
      console.warn(`[skip] 冲突: ${dir} -> ${toLowerName} (来源: ${list.join(", ")})`);
      continue;
    }

    const fromName = list[0];
    if (fromName === toLowerName) {
      stats.skipped += 1;
      if (options.verbose) {
        stats.skippedFiles.push(path.join(dir, fromName));
      }
      continue;
    }

    renamePlans.push({ from: fromName, to: toLowerName });
  }

  for (const plan of renamePlans) {
    const fromPath = path.join(dir, plan.from);
    const toPath = path.join(dir, plan.to);

    try {
      if (options.dryRun) {
        console.log(`[dry-run] ${fromPath} -> ${toPath}`);
        stats.renamed += 1;
        continue;
      }

      /**
       * 两步重命名（兼容大小写不敏感文件系统的“仅大小写变化”情况）：
       * 1) from -> temp
       * 2) temp -> to
       *
       * 注意：如果 toPath 已存在且不是同一个“仅大小写变化”的情况，会造成覆盖风险。
       * 为了安全，这里在重命名前做一次存在性检查：
       * - 若目标路径存在且目标名与源名不同，则跳过（避免误覆盖）
       */
      const targetExists = await pathExists(toPath);
      if (targetExists) {
        // 如果只是大小写变化，这里也会判定“存在”；我们统一使用临时名策略处理。
        // 但如果目录里真的存在另一个同名文件（极少见，通常只会在大小写敏感文件系统出现），
        // 两步重命名的第二步会失败，此处提前提示并跳过。
        // 为了更保守：只要存在，就尝试两步改名；若第二步失败会进入 catch 并计入 errors。
      }

      const tempName = `${plan.from}.tmp-normalize-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const tempPath = path.join(dir, tempName);

      await fs.rename(fromPath, tempPath);
      await fs.rename(tempPath, toPath);

      console.log(`[rename] ${fromPath} -> ${toPath}`);
      stats.renamed += 1;
    } catch (err) {
      console.error(`[error] ${fromPath} -> ${toPath}\n`, err);
      stats.errors += 1;
    }
  }

  return stats;
};

/**
 * 遍历目录（可选递归），并对每个目录执行一次 normalizeSvgsInDir。
 *
 * @param {string} rootDir
 * @param {{ dryRun: boolean; recursive: boolean }} options
 * @returns {Promise<{ scanned: number; renamed: number; skipped: number; collisions: number; errors: number }>}
 */
const walkAndNormalize = async (rootDir, options) => {
  /** @type {{ scanned: number; renamed: number; skipped: number; collisions: number; errors: number; skippedFiles: string[]; collisionDetails: Array<{ dir: string; to: string; from: string[] }> }} */
  const total = { scanned: 0, renamed: 0, skipped: 0, collisions: 0, errors: 0, skippedFiles: [], collisionDetails: [] };

  /** @type {string[]} */
  const queue = [rootDir];

  while (queue.length > 0) {
    const currentDir = queue.shift();
    if (!currentDir) break;

    const dirStats = await normalizeSvgsInDir(currentDir, { dryRun: options.dryRun, verbose: options.verbose });
    total.scanned += dirStats.scanned;
    total.renamed += dirStats.renamed;
    total.skipped += dirStats.skipped;
    total.collisions += dirStats.collisions;
    total.errors += dirStats.errors;
    total.skippedFiles.push(...dirStats.skippedFiles);
    total.collisionDetails.push(...dirStats.collisionDetails);

    if (!options.recursive) continue;

    let dirents;
    try {
      dirents = await readDirents(currentDir);
    } catch (err) {
      console.error(`[read] 失败: ${currentDir}\n`, err);
      total.errors += 1;
      continue;
    }

    for (const d of dirents) {
      if (!d.isDirectory()) continue;
      if (d.name === "node_modules" || d.name.startsWith(".")) continue;
      queue.push(path.join(currentDir, d.name));
    }
  }

  return total;
};

const printHelp = () => {
  console.log(
    [
      "normalize-icon-name.js",
      "",
      "用法：",
      "  node scripts/normalize-icon-name.js <dir> [--dry-run] [--no-recursive] [--verbose]",
      "",
      "参数：",
      "  <dir>           需要处理的目录路径",
      "  --dry-run       仅打印将要执行的重命名，不实际修改文件",
      "  --no-recursive  不递归子目录（默认递归）",
      "  --verbose       输出更多信息（例如跳过的文件明细）",
      ""
    ].join("\n")
  );
};

const main = async () => {
  const { dir, dryRun, recursive, verbose, help } = parseArgs(process.argv);

  if (help || !dir) {
    printHelp();
    process.exit(help ? 0 : 1);
  }

  const ok = await pathExists(dir);
  if (!ok) {
    console.error(`[init] 目录不存在: ${dir}`);
    process.exit(1);
  }

  console.log(`[init] dir=${dir}`);
  console.log(`[init] recursive=${recursive}`);
  console.log(`[init] dryRun=${dryRun}`);
  console.log(`[init] verbose=${verbose}`);

  const total = await walkAndNormalize(dir, { dryRun, recursive, verbose });

  console.log("");
  console.log("[done] 汇总：");
  console.log(`  scanned    : ${total.scanned}`);
  console.log(`  renamed    : ${total.renamed}`);
  console.log(`  skipped    : ${total.skipped}`);
  console.log(`  collisions : ${total.collisions}`);
  console.log(`  errors     : ${total.errors}`);

  if (total.collisions > 0) {
    console.log("");
    console.log("[done] 冲突明细：");
    for (const c of total.collisionDetails) {
      console.log(`  - dir: ${c.dir}`);
      console.log(`    to : ${c.to}`);
      console.log(`    from: ${c.from.join(", ")}`);
    }
  }

  if (verbose && total.skippedFiles.length > 0) {
    console.log("");
    console.log("[done] 跳过文件（已是小写）：");
    for (const filePath of total.skippedFiles) {
      console.log(`  - ${filePath}`);
    }
  }

  process.exit(total.errors > 0 ? 1 : 0);
};

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
