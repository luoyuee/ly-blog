export const UserRoleEnum = {
  ADMIN: 1,
  VISITOR: 2,
  NORMAL_USER: 3
} as const;

export const ImageFolderEnum = {
  SYSTEM: 1,
  BACKGROUND: 2,
  ARTICLE: 3
} as const;

export const DashboardEnum = {
  VIEW: 1,
  LIKE: 2,
  COMMENT: 3,
  API: 4,
  PAGE: 5
} as const;

export const ConfigNameEnum = {
  CLIENT: "client",
  SERVER: "server",
  WORK: "work",
  NOTICE: "notice"
} as const;

export const LyEditorTabPanelEnum = {
  EditorPanel: "editor-panel",
  ArticlePanel: "article-panel",
  ImagePanel: "image-panel",
  HitokotoPanel: "hitokoto-panel",
  UserPanel: "user-panel",
  SettingPanel: "setting-panel"
} as const;
