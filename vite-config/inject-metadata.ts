import fs from "node:fs";
import path from "node:path";

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
    buildTime: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
    dependencies: pkg.dependencies ?? {},
    devDependencies: pkg.devDependencies ?? {}
  };

  return {
    __LY_BLOG_METADATA__: JSON.stringify(metadata)
  };
}
