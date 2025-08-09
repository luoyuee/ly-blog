import { ImageFolderEnum } from "#shared/constants";
import { prisma } from "@@/server/db";
import { checkAndMigrateDatabase } from "@@/server/db";
import { mkdirSync, existsSync } from "fs";

const HitokotoTypeData = [
  {
    name: "动画",
    description: "Anime - 动画",
  },
  {
    name: "漫画",
    description: "Comic - 漫画",
  },
  {
    name: "游戏",
    description: "Game - 游戏",
  },
  {
    name: "文学",
    description: "Literature - 文学。主要收录现代文学：小说、散文、戏剧。",
  },
  {
    name: "原创",
    description: "Original - 原创",
  },
  {
    name: "网络",
    description: "Internet - 来自网络",
  },
  {
    name: "其他",
    description: "Other - 其他",
  },
  {
    name: "影视",
    description: "Video - 影视",
  },
  {
    name: "诗词",
    description:
      "Poem - 诗词。主要收录中国古代文学，如：诗、歌、词、赋、曲等。",
  },
  {
    name: "网易云",
    description: "NCM - 网易云。主要收录网易云音乐热评。",
  },
  {
    name: "哲学",
    description: "Philosophy - 哲学",
  },
  {
    name: "抖机灵",
    description: "Funny - 抖机灵",
  },
];

// 初始化状态：0=未初始化，1=正在迁移数据库，2=正在初始化数据，3=已完成
let initState = 0;

export default defineNitroPlugin(async (nitroApp) => {
  // 已经完成初始化，直接返回
  if (initState === 3) {
    return;
  }

  // 数据库迁移阶段
  if (initState === 0) {
    initState = 1; // 标记为正在迁移

    try {
      await checkAndMigrateDatabase();
      console.log("数据库检查和迁移完成");
    } catch (error) {
      console.error("数据库迁移失败:", error);
      initState = 0; // 失败时重置状态
      return; // 迁移失败则退出
    }
  }

  // 检查是否需要初始化数据
  try {
    const configCount = await prisma.config.count();
    if (configCount > 0) {
      initState = 3; // 标记为已完成
      return; // 已经初始化过，直接返回
    }
  } catch (error) {
    console.error("检查配置失败:", error);
    return; // 出错时返回，避免继续执行
  }

  // 防止并发初始化
  if (initState === 2) {
    return;
  }

  initState = 2; // 标记为正在初始化数据

  try {
    // 创建必要的目录
    const directories = [
      "./logs",
      "./static/images",
      "./static/images/preview",
      "./database",
    ];

    for (const dir of directories) {
      if (!existsSync(dir)) {
        console.log(`创建目录: ${dir}`);
        mkdirSync(dir, { recursive: true });
      }
    }

    // 初始化数据
    const now = new Date();

    // 创建配置项
    console.log("开始初始化数据...");
    await prisma.config.createMany({
      data: [
        {
          created_at: now,
          name: "client",
          data: {
            created_at: Math.floor(now.getTime() / 1000),
            locale: "zh-CN",
            basic: {
              title: "洛月的博客",
              description: "洛月的博客",
              keywords: ["nuxt", "博客"],
            },
            author_card: {
              name: "洛月",
              avatar: "/images/avatar.webp",
              motto: "永远相信美好的事情即将发生",
              links: [],
            },
            external_link_card: [
              {
                title: "Nuxt官网",
                href: "https://nuxt.com",
              },
            ],
            background: {
              home_title: "我在人间凑数的日子",
              home_sub_title: "🍂总有人间一两风，填我十万八千梦🍂",
            },
            swiper: [],
            nav_menu: [],
            beian: {},
            hitokoto: {},
            article: {},
            message_board: {},
            fleeting_thought: {},
          },
        },
        {
          created_at: now,
          name: "server",
          data: {
            mailer: {
              enable: false,
            },
            storage: {
              port: 443,
              use_ssl: true,
            },
          },
        },
      ],
    });

    await prisma.imageFolder.createMany({
      data: [
        {
          id: ImageFolderEnum.SYSTEM,
          created_at: now,
          name: "系统图库",
          description: "",
        },
        {
          id: ImageFolderEnum.BACKGROUND,
          created_at: now,
          name: "博客随机图片",
          description: "博客随机图片存储目录，用于背景，文章封面等……",
        },
        {
          id: ImageFolderEnum.ARTICLE,
          created_at: now,
          name: "文章图库",
          description: "存储文章中所使用的图片。",
        },
      ],
    });

    await prisma.articleCategory.create({
      data: {
        id: 1,
        created_at: now,
        name: "默认分类",
        description: "默认分类",
      },
    });

    await prisma.noteFolder.create({
      data: {
        id: 1,
        created_at: now,
        name: "默认目录",
      },
    });

    await prisma.hitokotoType.createMany({
      data: HitokotoTypeData.map((item) => {
        return {
          ...item,
          created_at: now,
        };
      }),
    });

    await prisma.systemRuntimeData.createMany({
      data: [
        {
          name: "first_run_time",
          data: { data: Math.floor(now.getTime() / 1000) },
        },
      ],
    });

    console.log("初始化完毕");
    initState = 3; // 标记为已完成
  } catch (error) {
    console.error("初始化过程失败:", error);
    initState = 0; // 失败时重置状态
  }
});
