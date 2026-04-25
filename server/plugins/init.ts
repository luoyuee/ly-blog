import { ConfigNameEnum } from "#shared/constants";
import {
  DefaultArticleCategoryData,
  DefaultClientConfig,
  DefaultImageFolderData,
  DefaultMePageConfig,
  DefaultNoteFolderData,
  DefaultNoticeConfig,
  DefaultServerConfig,
  DefaultWorkConfig,
  HitokotoTypeData
} from "#shared/constants/default-configs";
import { mkdirSync, existsSync } from "fs";
import { prisma } from "@@/server/db";
import config from "@@/server/config";
import dayjs from "dayjs";

// 初始化状态枚举
const InitState = {
  NOT_INITIALIZED: 0, // 未初始化
  INITIALIZING: 1, // 正在初始化数据
  COMPLETED: 2 // 已完成
} as const;

let initState: (typeof InitState)[keyof typeof InitState] = InitState.NOT_INITIALIZED;

export default defineNitroPlugin(async () => {
  // 已经完成初始化，直接返回
  if (initState === InitState.COMPLETED) {
    return;
  }

  // 检查是否需要初始化数据
  try {
    const configCount = await prisma.config.count();
    if (configCount > 0) {
      initState = InitState.COMPLETED; // 标记为已完成
      return; // 已经初始化过，直接返回
    }
  } catch (error) {
    console.error("检查配置失败:", error);
    return; // 出错时返回，避免继续执行
  }

  // 防止并发初始化
  if (initState === InitState.INITIALIZING) {
    return;
  }

  initState = InitState.INITIALIZING; // 标记为正在初始化数据

  try {
    // 创建必要的目录
    const directories = [config.FILE_PATH, config.CZDB_PATH, config.LOG_PATH, config.BACKUP_PATH];

    for (const dir of directories) {
      if (!existsSync(dir)) {
        console.log(`创建目录: ${dir}`);
        mkdirSync(dir, { recursive: true });
      }
    }

    // 初始化数据
    const now = new Date();
    const nowStr = dayjs(now).format("YYYY-MM-DD HH:mm:ss");

    // 创建配置项
    console.log("开始初始化数据...");
    await prisma.config.createMany({
      data: [
        {
          created_at: now,
          name: ConfigNameEnum.CLIENT,
          data: {
            ...DefaultClientConfig,
            created_at: nowStr,
            updated_at: nowStr
          }
        },
        {
          created_at: now,
          name: ConfigNameEnum.SERVER,
          data: {
            ...DefaultServerConfig,
            created_at: nowStr,
            updated_at: nowStr
          }
        },
        {
          created_at: now,
          name: ConfigNameEnum.ME_PAGE,
          data: DefaultMePageConfig
        },
        {
          created_at: now,
          name: ConfigNameEnum.WORK,
          data: DefaultWorkConfig
        },
        {
          created_at: now,
          name: ConfigNameEnum.NOTICE,
          data: DefaultNoticeConfig
        }
      ]
    });

    await prisma.imageFolder.createMany({
      data: DefaultImageFolderData.map((item) => {
        return {
          ...item,
          created_at: now
        };
      })
    });

    await prisma.articleCategory.create({
      data: {
        ...DefaultArticleCategoryData,
        created_at: now
      }
    });

    await prisma.noteFolder.create({
      data: {
        ...DefaultNoteFolderData,
        created_at: now
      }
    });

    await prisma.hitokotoType.createMany({
      data: HitokotoTypeData.map((item) => {
        return {
          ...item,
          created_at: now
        };
      })
    });

    await prisma.systemRuntimeData.createMany({
      data: [
        {
          name: "first_run_time",
          created_at: now,
          data: { date: nowStr }
        }
      ]
    });

    console.log("初始化完毕");
    initState = InitState.COMPLETED; // 标记为已完成
  } catch (error) {
    console.error("初始化过程失败:", error);
    initState = InitState.NOT_INITIALIZED; // 失败时重置状态
  }
});
