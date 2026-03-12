/**
 * 扫描本地 SVG 图标资源目录，生成 `shared/constants/icons.ts`。
 *
 * 用途：
 * - 避免在运行时使用 `import.meta.glob()` 产生较大的映射对象（key + 导入函数）
 * - 把“可选的图标名称列表”直接固化为 TS 常量，供 SelectIcon 等组件使用
 *
 * 用法：
 * - node scripts/generate-icons-constants.js
 */

import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();

const assetsDirs = [
  { dir: "app/assets/icons", prefix: "custom", exportName: "CustomIconNames" },
  { dir: "app/assets/colorful-icons", prefix: "colorful", exportName: "ColorfulIconNames" },
  { dir: "app/assets/skill-icons", prefix: "skills", exportName: "SkillIconNames" }
];

const defaultOptionsName = "SelectIconDefaultOptions";
const defaultOptions = ["colorful:home", "colorful:folder", "colorful:link"];

/**
 * @param {string} absoluteDir
 * @returns {Promise<string[]>} 返回不带扩展名的文件名列表
 */
const readSvgBaseNames = async (absoluteDir) => {
  const dirents = await fs.readdir(absoluteDir, { withFileTypes: true });

  return dirents
    .filter((d) => d.isFile() && d.name.toLowerCase().endsWith(".svg"))
    .map((d) => d.name.slice(0, -4))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
};

/**
 * @param {string[]} items
 * @returns {string}
 */
const formatStringArray = (items) => {
  const length = items.length;
  if (length === 0) return "[]";
  const lines = items
    .map((s, i) => `  ${JSON.stringify(s)}${i === length - 1 ? "" : ","}`)
    .join("\n");
  return `[\n${lines}\n]`;
};

/**
 * @param {{ exportName: string; names: string[] }[]} groups
 * @returns {string}
 */
const generateIconsTs = (groups) => {
  const generatedAt = new Date().toISOString();

  const sections = groups
    .map(({ exportName, names }) => {
      return `export const ${exportName}: string[] = ${formatStringArray(names)};`;
    })
    .join("\n\n");

  const header = `/**
 * 本文件由脚本自动生成：scripts/generate-icons-constants.js
 * 生成时间：${generatedAt}
 *
 * 注意：
 * - 修改图标资源后，请重新运行脚本更新本文件
 */`;

  const footer = `/**
 * SelectIcon 组件默认展示的少量常用图标（避免下拉列表过大）
 */
export const ${defaultOptionsName}: string[] = ${formatStringArray(defaultOptions)};`;

  return `${header}\n\n${sections}\n\n${footer}\n`;
};

const main = async () => {
  const groups = [];

  for (const item of assetsDirs) {
    const absDir = path.resolve(projectRoot, item.dir);
    const baseNames = await readSvgBaseNames(absDir);
    const fullNames = baseNames.map((name) => `${item.prefix}:${name}`);
    groups.push({ exportName: item.exportName, names: fullNames });
    console.log(`[ok] ${item.dir}: ${baseNames.length}`);
  }

  const content = generateIconsTs(groups);
  const outFile = path.resolve(projectRoot, "shared/constants/icons.ts");
  await fs.writeFile(outFile, content, "utf8");
  console.log(`[write] ${path.relative(projectRoot, outFile)}`);
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
