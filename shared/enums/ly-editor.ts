/**
 * 编辑器活动菜单枚举
 * @description 定义 LyEditor 左侧活动栏的菜单项
 */
export const LyEditorActivityMenuEnum = {
  /** 笔记管理 */
  NoteManager: "note-manager",
  /** 文章管理 */
  ArticleManager: "article-manager",
  /** 搜索面板 */
  SearchPanel: "search-panel",
  /** 图片管理 */
  ImageManager: "image-manager",
  /** 附件管理 */
  AttachmentManager: "attachment-manager",
  /** 一言管理 */
  HitokotoManager: "hitokoto-manager",
  /** 导航管理 */
  NavigationManager: "navigation-manager",
  /** 作品管理 */
  WorkManager: "work-manager",
  /** API Key 管理 */
  ApiKeyManager: "api-key-manager",
  /** 白板管理 */
  WhiteboardManager: "whiteboard-manager",
  /** 看板管理 */
  KanbanManager: "kanban-manager",
  /** 流程图管理 */
  FlowchartManager: "flowchart-manager",
  /** 思维导图管理 */
  MindmapManager: "mindmap-manager",
  /** 日历管理 */
  CalendarManager: "calendar-manager",
  /** 仪表盘面板 */
  DashboardPanel: "dashboard-panel",
  /** 定时任务面板 */
  CronJobPanel: "cron-job-panel",
  /** 设置面板 */
  SettingPanel: "setting-panel"
} as const;

/** 编辑器活动菜单类型 */
export type LyEditorActivityMenu =
  (typeof LyEditorActivityMenuEnum)[keyof typeof LyEditorActivityMenuEnum];

/**
 * 编辑器标签面板枚举
 * @description 定义 LyEditor 右侧标签面板的类型
 */
export const LyEditorTabPanelEnum = {
  /** 编辑器面板 */
  EditorPanel: "editor-panel",
  /** 文章面板 */
  ArticlePanel: "article-panel",
  /** 图片面板 */
  ImagePanel: "image-panel",
  /** 附件面板 */
  AttachmentPanel: "attachment-panel",
  /** 一言面板 */
  HitokotoPanel: "hitokoto-panel",
  /** 导航网站面板 */
  NavigationWebsitePanel: "navigation-website-panel",
  /** 导航历史面板 */
  NavigationHistoryPanel: "navigation-history-panel",
  /** API Key 面板 */
  ApiKeyPanel: "api-key-panel",
  /** 白板面板 */
  WhiteboardPanel: "whiteboard-panel",
  /** 看板面板 */
  KanbanPanel: "kanban-panel",
  /** 流程图面板 */
  FlowchartPanel: "flowchart-panel",
  /** 思维导图面板 */
  MindmapPanel: "mindmap-panel",
  /** 日历面板 */
  CalendarPanel: "calendar-panel",
  /** 用户面板 */
  UserPanel: "user-panel",
  /** 仪表盘面板 */
  DashboardPanel: "dashboard-panel",
  /** 定时任务面板 */
  CronJobPanel: "cron-job-panel",
  /** 设置面板 */
  SettingPanel: "setting-panel"
} as const;

/** 编辑器标签面板类型 */
export type LyEditorTabPanel = (typeof LyEditorTabPanelEnum)[keyof typeof LyEditorTabPanelEnum];
