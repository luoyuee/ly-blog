/**
 * Ly Blog 构建期注入的元数据结构定义
 */
export interface LyBlogMetadata {
  /** 应用名称（来自 package.json name） */
  appName: string;
  /** 应用版本（来自 package.json version，缺失时使用 0.0.0） */
  appVersion: string;
  /** 仓库 URL（固定值） */
  repoUrl: string;
  /** 开源许可协议（缺失时使用 Unknown） */
  license: string;
  /** Nuxt 版本（来自 package.json dependencies.nuxt） */
  nuxtVersion: string;
  /** 构建时 Node.js 版本（process.version） */
  buildNodeVersion: string;
  /** 构建时间（ISO 字符串） */
  buildTime: string;
  /** 当前环境变量（NODE_ENV） */
  env: "development" | "production" | "test" | string;
  /** 依赖项（来自 package.json dependencies） */
  dependencies: Record<string, string>;
  /** 开发依赖项（来自 package.json devDependencies） */
  devDependencies: Record<string, string>;
}

/**
 * 编译期常量声明：供 TypeScript 正确提示与类型检查
 * 该常量由 Vite 在构建阶段替换为字面量对象
 */
declare const __LY_BLOG_METADATA__: LyBlogMetadata;

/**
 * 运行时全局声明：插件会把常量挂到 globalThis.__LY_BLOG_METADATA__
 */
declare global {
  // 运行时可读的全局变量
  var __LY_BLOG_METADATA__: LyBlogMetadata | undefined;
}

