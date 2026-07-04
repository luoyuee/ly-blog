import { fileURLToPath } from "node:url";

/**
 * 开发环境专用页面注册表。
 * 新增测试页时只需要在这里追加路由定义，nuxt.config.ts 会统一接入。
 */
export const devPages = [
  {
    name: "dev-descriptions",
    path: "/test/descriptions",
    file: fileURLToPath(new URL("./descriptions.vue", import.meta.url))
  },
  {
    name: "dev-dialog",
    path: "/test/dialog",
    file: fileURLToPath(new URL("./dialog.vue", import.meta.url))
  },
  {
    name: "dev-spin",
    path: "/test/spin",
    file: fileURLToPath(new URL("./spin.vue", import.meta.url))
  },
  {
    name: "dev-tooltip-button",
    path: "/test/tooltip-button",
    file: fileURLToPath(new URL("./tooltip-button.vue", import.meta.url))
  }
];
