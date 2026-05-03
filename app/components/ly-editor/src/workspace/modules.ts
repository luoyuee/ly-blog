import type { WorkspaceModule } from "../types/workspace";

/**
 * 工作台一级模块注册表。
 */
export const workspaceModules: WorkspaceModule[] = [
  {
    key: "dashboard",
    label: "仪表盘",
    icon: "i-lucide-layout-dashboard",
    defaultPanel: "dashboard-panel"
  },
  {
    key: "note",
    label: "笔记",
    icon: "i-lucide-file-text",
    sidebar: "note-explorer",
    defaultPanel: "note"
  },
  {
    key: "article",
    label: "文章",
    icon: "i-lucide-newspaper",
    sidebar: "article-filter",
    defaultPanel: "article-panel"
  },
  {
    key: "image",
    label: "图片",
    icon: "i-lucide-image",
    sidebar: "image-explorer",
    defaultPanel: "image-panel"
  },
  {
    key: "hitokoto",
    label: "一言",
    icon: "i-lucide-quote",
    sidebar: "hitokoto-filter",
    defaultPanel: "hitokoto-panel"
  },
  {
    key: "navigation",
    label: "导航",
    icon: "i-lucide-compass",
    sidebar: "navigation-filter",
    defaultPanel: "navigation-website-panel"
  },
  {
    key: "work",
    label: "作品",
    icon: "i-lucide-briefcase-business",
    defaultPanel: "work-panel"
  },
  {
    key: "settings",
    label: "设置",
    icon: "i-lucide-settings",
    defaultPanel: "setting-panel"
  }
];
