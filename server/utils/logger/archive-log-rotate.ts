import type { DailyStatistics, IpRequestSummary, RequestStatsValue } from "#shared/types/dashboard";
import type { ArchiveHttpLogContent } from "#shared/types/logger";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import { useIPLocation } from "@@/server/utils/ip";
import { runtimeLogger } from "@@/server/utils/logger/runtime-logger";
import { prisma } from "@@/server/db";
import type DailyRotateFile from "winston-daily-rotate-file";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import readline from "readline";
import dayjs from "dayjs";
import zlib from "zlib";
import fs from "fs";

dayjs.extend(customParseFormat);

let isAttached = false;

/**
 * 创建日志文件的读取流，支持普通文件和 gzip 压缩文件。
 */
const createStream = (filePath: string): NodeJS.ReadableStream => {
  if (fs.existsSync(filePath)) {
    return fs.createReadStream(filePath);
  }

  const gzPath = `${filePath}.gz`;

  if (fs.existsSync(gzPath)) {
    return fs.createReadStream(gzPath).pipe(zlib.createGunzip());
  }

  throw new Error(`[logger] 日志文件不存在: ${filePath} 或 ${gzPath}`);
};

/**
 * 为归档日志传输器挂载 rotate 统计逻辑。
 */
export const setupRotateHandler = (transport: DailyRotateFile): void => {
  if (isAttached) {
    return;
  }

  isAttached = true;

  transport.on("rotate", async (oldFilename) => {
    runtimeLogger.debug("[logger] rotate", oldFilename);

    const date = oldFilename.match(/\d{4}-\d{2}-\d{2}-\d{2}/)?.[0];

    if (!date) return;

    const nowTime = dayjs(date, "YYYY-MM-DD-HH");

    const rl = readline.createInterface({
      input: createStream(oldFilename),
      crlfDelay: Infinity
    });

    const hourlyStats: RequestStatsValue = {
      article: 0,
      like: 0,
      api: 0,
      page: 0,
      static: 0,
      total: 0
    };

    const ipStats: IpRequestSummary = {};

    for await (const line of rl) {
      try {
        const message = JSON.parse(line) as ArchiveHttpLogContent;

        if (!message.path) continue;

        hourlyStats.total += 1;

        const isArticleView = /^\/api\/article\/\d+$/.test(message.path);
        const isArticleLike = /^\/api\/article\/like\/\d+$/.test(message.path);
        const isApiRequest = /^\/api/.test(message.path);
        const isStaticRequest = /^(?!\/api\/).*\.[a-zA-Z0-9]+$/.test(message.path);

        if (isArticleView && message.method === "GET") {
          hourlyStats.article += 1;
        } else if (isArticleLike) {
          if (message.method === "POST") {
            hourlyStats.like += 1;
          } else if (message.method === "DELETE") {
            hourlyStats.like -= 1;
          }
        }

        if (isApiRequest) {
          hourlyStats.api += 1;
        } else if (isStaticRequest) {
          hourlyStats.static += 1;
        } else {
          hourlyStats.page += 1;
        }

        if (message.ip) {
          const currentIpStats = ipStats[message.ip];

          if (currentIpStats) {
            currentIpStats.total += 1;
          } else {
            ipStats[message.ip] = {
              total: 1,
              location: ""
            };
          }
        }
      } catch (error) {
        runtimeLogger.error(`[logger] 分析失败：${line}`, error);
      }
    }

    try {
      const { getIPLocation } = useIPLocation();

      for (const ip of Object.keys(ipStats)) {
        const currentIpStats = ipStats[ip];

        if (currentIpStats) {
          currentIpStats.location = getIPLocation(ip) ?? "未知";
        }
      }
    } catch (error) {
      runtimeLogger.error("[logger] IP 归属地统计失败", error);
    }

    runtimeLogger.debug("[logger] 统计结果:");
    runtimeLogger.debug(hourlyStats);
    runtimeLogger.debug(ipStats);

    const dailyData = await prisma.dashboard.findFirst({
      where: {
        time: nowTime.startOf("d").toDate()
      }
    });

    const nowHour = nowTime.hour().toString();

    if (dailyData) {
      const dailyStats = dailyData.data as unknown as DailyStatistics;
      const totalRequests = { ...hourlyStats };

      Object.keys(ipStats).forEach((ip) => {
        const currentIpStats = ipStats[ip];
        const currentDailyIpStats = dailyStats.ipRequests[ip];

        if (!currentIpStats) return;

        if (currentDailyIpStats) {
          currentDailyIpStats.total += currentIpStats.total;
        } else {
          dailyStats.ipRequests[ip] = currentIpStats;
        }
      });

      const currentHourlyStats = dailyStats.hourlyRequests[nowHour];

      if (currentHourlyStats) {
        (Object.keys(hourlyStats) as (keyof RequestStatsValue)[]).forEach((key) => {
          hourlyStats[key] += currentHourlyStats[key];
        });
      }

      if (dailyStats.totalRequests) {
        (Object.keys(totalRequests) as (keyof RequestStatsValue)[]).forEach((key) => {
          totalRequests[key] += dailyStats.totalRequests[key];
        });
      }

      await prisma.dashboard.update({
        where: {
          id: dailyData.id
        },
        data: {
          updated_at: new Date(),
          data: {
            date: dailyStats.date,
            totalRequests,
            hourlyRequests: {
              ...dailyStats.hourlyRequests,
              [nowHour]: hourlyStats
            },
            ipRequests: dailyStats.ipRequests
          } as unknown as InputJsonValue
        }
      });
    } else {
      await prisma.dashboard.create({
        data: {
          data: {
            date: nowTime.format("YYYY-MM-DD HH:mm:ss"),
            totalRequests: hourlyStats,
            hourlyRequests: {
              [nowHour]: hourlyStats
            },
            ipRequests: ipStats
          } as unknown as InputJsonValue,
          time: nowTime.startOf("d").toDate()
        }
      });
    }
  });
};
