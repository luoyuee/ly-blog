export const TagColors: string[] = [
  "#6fa3ef",
  "#bc99c4",
  "#4C83FF",
  "#FF52E5",
  "#5151E5",
  "#FA742B",
  "#f093fb",
  "#32CCBC",
  "#f9bb3c",
  "#F067B4",
  "#28C76F",
  "#F6416C"
] as const;

export const PlatformIcon: Record<string, string> = {
  "Windows 11": "colorful:win11",
  "Windows 10": "colorful:win10",
  unknown: "colorful:unknown-system"
} as const;

export const BrowserIcon: Record<string, string> = {
  Chrome: "colorful:chrome",
  Edge: "colorful:edge",
  Firefox: "colorful:firefox",
  unknown: "colorful:browser"
} as const;

export const LyEditorActivityMenu = {
  NoteManager: 1,
  ArticleManager: 2,
  SearchPanel: 3,
  ImageManager: 4,
  HitokotoManager: 5,
  NavigationWebsiteManager: 6,
  WorkManager: 7,
  DashboardPanel: 97,
  CronJobPanel: 98,
  SettingPanel: 99
} as const;

export const ImageFolderEnum = {
  SYSTEM: 1,
  BACKGROUND: 2,
  ARTICLE: 3
} as const;

export const MarkdownSupportURL = "https://markdown.com.cn/cheat-sheet.html" as const;

export * from "./default-configs";

export const ConfigNameEnum = {
  CLIENT: "client",
  SERVER: "server",
  ME_PAGE: "me_page",
  WORK: "work",
  NOTICE: "notice"
} as const;
