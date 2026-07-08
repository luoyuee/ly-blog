/**
 * SelectIcon 组件默认展示的少量常用图标（避免下拉列表过大）
 */
export const SelectIconDefaultOptions: string[] = [
  "colorful:home",
  "colorful:folder",
  "colorful:link"
];

/**
 * 社交平台图标名称列表
 * @description 用于社交链接组件的图标选择
 */
export const SocialIconNames = [
  "ri:gitee-fill",
  "ri:github-fill",
  "ri:mail-line",
  "ri:book-2-line",
  "ri:bilibili-fill",
  "ri:camera-lens-fill",
  "ri:chat-3-fill",
  "ri:facebook-box-fill",
  "ri:gitlab-fill",
  "ri:google-fill",
  "ri:twitter-fill",
  "ri:twitch-fill",
  "ri:twitter-x-fill",
  "ri:wechat-fill",
  "ri:youtube-fill",
  "ri:zhihu-line"
];

/**
 * 搜索引擎图标名称列表
 * @description 用于搜索引擎选择组件的图标
 */
export const SearchEngineIconNames = [
  "custom:baidu",
  "custom:bing",
  "custom:sogou",
  "custom:360so",
  "custom:google",
  "custom:duck",
  "custom:yahoo",
  "custom:yandex",
  "custom:github-rect",
  "custom:toutiao",
  "custom:csdn",
  "custom:soutushenqi",
  "custom:stackoverflow",
  "custom:search-2",
  "custom:world"
];

/**
 * 平台图标映射
 * @description 操作系统平台对应的图标
 */
export const PlatformIcon: Record<string, string> = {
  "Windows 11": "colorful:win11",
  "Windows 10": "colorful:win10",
  unknown: "colorful:unknown-system"
} as const;

/**
 * 浏览器图标映射
 * @description 浏览器类型对应的图标
 */
export const BrowserIcon: Record<string, string> = {
  Chrome: "colorful:chrome",
  Edge: "colorful:edge",
  Firefox: "colorful:firefox",
  unknown: "colorful:browser"
} as const;
