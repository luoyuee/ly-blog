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
  "#F6416C",
] as const;

export const PlatformIcon: Record<string, string> = {
  "Windows 11": "win11",
  "Windows 10": "win10",
  unknown: "unknown-system",
} as const;

export const BrowserIcon: Record<string, string> = {
  Chrome: "chrome",
  Edge: "edge",
  Firefox: "firefox",
  unknown: "browser",
} as const;

export const MdcEditorActivityMenu = {
  NoteManager: 1,
  ArticleManager: 2,
  SearchPanel: 3,
  ImageManager: 4,
  HitokotoManager: 5,
  SettingPanel: 99,
} as const;

export const ImageFolderEnum = {
  SYSTEM: 1,
  BACKGROUND: 2,
  ARTICLE: 3,
} as const;
