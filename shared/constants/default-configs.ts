import type { HitokotoTypeSelectOption } from "#shared/types/hitokoto";
import type {
  IClientConfig,
  IMePageConfig,
  IServerConfig,
  NoticeConfig,
  WorkItem
} from "#shared/types/config";

/**
 * 客户端配置默认值。
 */
export const DefaultClientConfig = {
  created_at: "",
  updated_at: "",
  locale: "zh-CN",
  basic: {
    title: "洛月的博客",
    description: "洛月的博客",
    keywords: ["nuxt", "博客"]
  },
  author_card: {
    name: "洛月",
    avatar: "/images/avatar.webp",
    motto: "永远相信美好的事情即将发生",
    links: []
  },
  external_link_card: [
    {
      title: "Nuxt官网",
      href: "https://nuxt.com"
    }
  ],
  background: {
    home_title: "我在人间凑数的日子",
    home_sub_title: "🍂总有人间一两风，填我十万八千梦🍂"
  },
  swiper: [],
  nav_menu: [],
  beian: {},
  hitokoto: {},
  article: {},
  message_board: {},
  fleeting_thought: {},
  live2d: {}
} satisfies IClientConfig;

/** 服务端配置默认值。 */
export const DefaultServerConfig = {
  created_at: "",
  updated_at: "",
  mailer: {
    enabled: false
  },
  storage: {
    port: 443,
    use_ssl: true
  },
  czdb: {}
} satisfies IServerConfig;

/** 个人页默认配置。 */
export const DefaultMePageConfig = {
  author: {
    name: "",
    avatar: "",
    location: "",
    dev_role: "",
    dev_direction: "",
    quote: "",
    tags: []
  },
  github_snake: {
    light: "",
    dark: ""
  },
  intro: {
    base_info: [],
    skills: [],
    interest_tags: [],
    language_proficiency: []
  },
  skills_grid: [],
  website_list: [],
  project_list: [],
  social_links: [],
  faq_items: []
} satisfies IMePageConfig;

/** 公告配置默认值。 */
export const DefaultNoticeConfig = {
  card: {
    content: "网站初始化完毕！"
  },
  toast: {
    content: "",
    delay: 3000,
    position: "top-right"
  },
  modal: {
    content: "",
    delay: 3000,
    fullscreen: false
  }
} satisfies NoticeConfig;

/** 公告读取接口使用的空态默认值。 */
export const EmptyNoticeConfig = {
  card: {
    content: ""
  },
  toast: {
    content: "",
    delay: 3000,
    position: "top-right"
  },
  modal: {
    content: "",
    delay: 3000,
    fullscreen: false
  }
} satisfies NoticeConfig;

/** 作品配置默认值。 */
export const DefaultWorkConfig = [] satisfies WorkItem[];

/** 系统图库初始化默认数据。 */
export const DefaultImageFolderData = [
  {
    id: 1,
    name: "系统图库",
    description: ""
  },
  {
    id: 2,
    name: "博客随机图片",
    description: "博客随机图片存储目录，用于背景，文章封面等……"
  },
  {
    id: 3,
    name: "文章图库",
    description: "存储文章中所使用的图片。"
  }
] as const;

/** 文章分类初始化默认数据。 */
export const DefaultArticleCategoryData = {
  id: 1,
  name: "默认分类",
  description: "默认分类"
} as const;

/** 笔记目录初始化默认数据。 */
export const DefaultNoteFolderData = {
  id: 1,
  name: "默认目录"
} as const;

/** 一言分类初始化默认数据。 */
export const HitokotoTypeData: HitokotoTypeSelectOption[] = [
  {
    id: 1,
    name: "动画",
    description: "Anime - 动画"
  },
  {
    id: 2,
    name: "漫画",
    description: "Comic - 漫画"
  },
  {
    id: 3,
    name: "游戏",
    description: "Game - 游戏"
  },
  {
    id: 4,
    name: "文学",
    description: "Literature - 文学。主要收录现代文学：小说、散文、戏剧。"
  },
  {
    id: 5,
    name: "原创",
    description: "Original - 原创"
  },
  {
    id: 6,
    name: "网络",
    description: "Internet - 来自网络"
  },
  {
    id: 7,
    name: "其他",
    description: "Other - 其他"
  },
  {
    id: 8,
    name: "影视",
    description: "Video - 影视"
  },
  {
    id: 9,
    name: "诗词",
    description: "Poem - 诗词。主要收录中国古代文学，如：诗、歌、词、赋、曲等。"
  },
  {
    id: 10,
    name: "网易云",
    description: "NCM - 网易云。主要收录网易云音乐热评。"
  },
  {
    id: 11,
    name: "哲学",
    description: "Philosophy - 哲学"
  },
  {
    id: 12,
    name: "抖机灵",
    description: "Funny - 抖机灵"
  }
];
