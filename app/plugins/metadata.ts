/**
 * 将编译期注入的常量 __LY_BLOG_METADATA__ 挂载到 globalThis
 * 便于在客户端与服务端统一访问
 */
export default defineNuxtPlugin(() => {
  /**
   * 在运行时把常量赋值到全局对象
   * 注意：__LY_BLOG_METADATA__ 在构建阶段通过 vite.define 注入为字面量
   */
  const data = __LY_BLOG_METADATA__;

  // 在 Node 与 浏览器 环境下都通过 globalThis 访问
  (globalThis as unknown as { __LY_BLOG_METADATA__: typeof data }).__LY_BLOG_METADATA__ = data;
});

