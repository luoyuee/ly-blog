import { fileURLToPath } from "node:url";

/**
 * 开发环境专用页面注册表。
 * 新增测试页时只需要在这里追加路由定义，nuxt.config.ts 会统一接入。
 */
export const devPages = [
  {
    name: "dev-descriptions-v2",
    path: "/test/descriptions-v2",
    file: fileURLToPath(new URL("./descriptions-v2.vue", import.meta.url))
  }
];
