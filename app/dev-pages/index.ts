import { fileURLToPath } from "node:url";

/**
 * 开发环境专用页面注册表。
 * 新增测试页时只需要在这里追加路由定义，nuxt.config.ts 会统一接入。
 */
export const devPages = [
  {
    name: "dev-index",
    path: "/test",
    file: fileURLToPath(new URL("./index.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "首页",
        icon: "lucide:house",
        order: 0
      }
    }
  },
  {
    name: "dev-descriptions",
    path: "/test/descriptions",
    file: fileURLToPath(new URL("./descriptions.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Descriptions",
        icon: "lucide:list-tree",
        order: 1
      }
    }
  },
  {
    name: "dev-dialog",
    path: "/test/dialog",
    file: fileURLToPath(new URL("./dialog.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Dialog",
        icon: "lucide:panel-top-open",
        order: 2
      }
    }
  },
  {
    name: "dev-spin",
    path: "/test/spin",
    file: fileURLToPath(new URL("./spin.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Spin",
        icon: "lucide:loader-circle",
        order: 3
      }
    }
  },
  {
    name: "dev-tooltip-button",
    path: "/test/tooltip-button",
    file: fileURLToPath(new URL("./tooltip-button.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Tooltip Button",
        icon: "lucide:message-square-more",
        order: 4
      }
    }
  },
  {
    name: "dev-kanban-dndkit",
    path: "/test/kanban-dndkit",
    file: fileURLToPath(new URL("./kanban/kanban-dndkit.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Kanban DnD Kit",
        icon: "lucide:columns-3",
        order: 5
      }
    }
  },
  {
    name: "dev-placeholder",
    path: "/test/placeholder",
    file: fileURLToPath(new URL("./placeholder.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Placeholder",
        icon: "lucide:square-dashed",
        order: 6
      }
    }
  },
  {
    name: "dev-resizable-table",
    path: "/test/resizable-table",
    file: fileURLToPath(new URL("./resizable-table.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Resizable Table",
        icon: "lucide:table-properties",
        order: 7
      }
    }
  }
];
