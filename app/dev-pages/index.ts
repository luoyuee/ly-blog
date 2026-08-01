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
    file: fileURLToPath(new URL("./kanban-dndkit.vue", import.meta.url)),
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
  },
  {
    name: "dev-time-picker",
    path: "/test/time-picker",
    file: fileURLToPath(new URL("./time-picker.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "TimePicker",
        icon: "lucide:clock",
        order: 8
      }
    }
  },
  {
    name: "dev-transfer",
    path: "/test/transfer",
    file: fileURLToPath(new URL("./transfer.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Transfer",
        icon: "lucide:arrow-left-right",
        order: 9
      }
    }
  },
  {
    name: "dev-picker",
    path: "/test/picker",
    file: fileURLToPath(new URL("./picker.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Picker",
        icon: "lucide:list-ordered",
        order: 10
      }
    }
  },
  {
    name: "dev-date-picker",
    path: "/test/date-picker",
    file: fileURLToPath(new URL("./date-picker.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "DatePicker",
        icon: "lucide:calendar",
        order: 11
      }
    }
  },
  {
    name: "dev-color-picker",
    path: "/test/color-picker",
    file: fileURLToPath(new URL("./color-picker.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "ColorPicker",
        icon: "lucide:palette",
        order: 12
      }
    }
  },
  {
    name: "dev-cascader",
    path: "/test/cascader",
    file: fileURLToPath(new URL("./cascader.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Cascader",
        icon: "lucide:list-tree",
        order: 13
      }
    }
  },
  {
    name: "dev-whiteboard",
    path: "/test/whiteboard",
    file: fileURLToPath(new URL("./whiteboard.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Whiteboard",
        icon: "lucide:pencil-sparkles",
        order: 14
      }
    }
  },
  {
    name: "dev-flowchart",
    path: "/test/flowchart",
    file: fileURLToPath(new URL("./flowchart.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Flowchart",
        icon: "lucide:workflow",
        order: 15
      }
    }
  },
  {
    name: "dev-mindmap",
    path: "/test/mindmap",
    file: fileURLToPath(new URL("./mindmap.vue", import.meta.url)),
    meta: {
      layout: "test",
      devPage: {
        label: "Mindmap",
        icon: "lucide:brain",
        order: 16
      }
    }
  }
];
