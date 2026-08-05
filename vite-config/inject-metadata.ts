import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import fs from "node:fs";
import path from "node:path";

// 启用时区支持：CI（如 GitHub Actions）默认 UTC，
// 需固定为 Asia/Shanghai 以产出稳定的北京时间字符串
dayjs.extend(utc);
dayjs.extend(timezone);

export default function injectMetadata() {
  /**
   * 读取 package.json，准备构建期元数据
   */
  const pkgJsonPath = path.resolve(process.cwd(), "package.json");
  const raw = fs.readFileSync(pkgJsonPath, "utf-8");
  const pkg = JSON.parse(raw) as {
    name?: string;
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  /**
   * 组装需要的元数据（可按需扩展）
   */
  const metadata = {
    appName: pkg.name ?? "ly-blog",
    appVersion: pkg.version ?? "0.0.0",
    repoUrl: "https://github.com/luoyuee/ly-blog",
    license: "MIT",
    nuxtVersion: pkg.dependencies?.nuxt ?? "unknown",
    buildNodeVersion: process.version,
    // 构建期直接格式化并固定时区：vite.define 注入后 SSR 与客户端拿到同一字面量，避免 hydration mismatch；
    // CI 默认 UTC，固定 Asia/Shanghai 保证始终为北京时间
    buildTime: dayjs().tz("Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss"),
    env: process.env.NODE_ENV || "development",
    dependencies: pkg.dependencies ?? {},
    devDependencies: pkg.devDependencies ?? {}
  };

  return {
    __LY_BLOG_METADATA__: JSON.stringify(metadata)
  };
}
