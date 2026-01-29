import type {
  DailyStatistics,
  IpRequestSummary,
  RequestStatsValue
} from "@@/shared/types/dashboard";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import { useIPLocation } from "@@/server/utils/ip";
import { prisma } from "@@/server/db";
import customParseFormat from "dayjs/plugin/customParseFormat";
import DailyRotateFile from "winston-daily-rotate-file";
import config from "@@/server/config";
import process from "node:process";
import * as winston from "winston";
import readline from "readline";
import dayjs from "dayjs";
import zlib from "zlib";
import fs from "fs";

dayjs.extend(customParseFormat);

type LoggerMessage = {
  time: string;
  method: string;
  path: string;
  ip: string;
  userAgent: string;
};

const LOG_DATE_PATTERN =
  process.env.NODE_ENV === "development" ? "YYYY-MM-DD-HH-mm" : "YYYY-MM-DD-HH";

const transport: DailyRotateFile = new DailyRotateFile({
  filename: config.LOG_PATH + "/%DATE%.log",
  datePattern: LOG_DATE_PATTERN,
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d"
});

const createLogReadStream = (filePath: string): NodeJS.ReadableStream => {
  if (fs.existsSync(filePath)) {
    return fs.createReadStream(filePath);
  }

  const gzPath = `${filePath}.gz`;

  if (fs.existsSync(gzPath)) {
    return fs.createReadStream(gzPath).pipe(zlib.createGunzip());
  }

  throw new Error(`[logger] 日志文件不存在: ${filePath} 或 ${gzPath}`);
};

transport.on("rotate", async (oldFilename) => {
  console.log("[logger] rotate", oldFilename);

  const date = oldFilename.match(/\d{4}-\d{2}-\d{2}-\d{2}/)?.[0];

  if (!date) return;

  const nowTime = dayjs(date, "YYYY-MM-DD-HH");

  const rl = readline.createInterface({
    input: createLogReadStream(oldFilename),
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
      const message = JSON.parse(line) as LoggerMessage;

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
        if (ipStats[message.ip]) {
          ipStats[message.ip].total += 1;
        } else {
          ipStats[message.ip] = {
            total: 1,
            location: ""
          };
        }
      }
    } catch (error) {
      console.log(`[logger] 分析失败：(${error}) ${line}`);
    }
  }

  try {
    const { getIPLocation } = useIPLocation();

    for (const ip of Object.keys(ipStats)) {
      ipStats[ip].location = getIPLocation(ip) ?? "未知";
    }
  } catch (error) {
    console.error("[logger] IP 归属地统计失败", error);
  }

  console.log("[logger] 统计结果:");
  console.log(hourlyStats);
  console.log(ipStats);

  const dailyData = await prisma.dashboard.findFirst({
    where: {
      time: nowTime.startOf("d").toDate()
    }
  });

  const nowHour = nowTime.hour().toString();

  if (dailyData) {
    const dailyStats = dailyData?.data as unknown as DailyStatistics;
    const totalRequests = { ...hourlyStats };

    Object.keys(ipStats).forEach((ip) => {
      if (dailyStats.ipRequests[ip]) {
        dailyStats.ipRequests[ip].total += ipStats[ip].total;
      } else {
        dailyStats.ipRequests[ip] = ipStats[ip];
      }
    });

    if (dailyStats.hourlyRequests[nowHour]) {
      (Object.keys(hourlyStats) as (keyof RequestStatsValue)[]).forEach((key) => {
        hourlyStats[key] += dailyStats.hourlyRequests[nowHour][key];
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

const logger = winston.createLogger({
  level: "http",
  format: winston.format.printf((info) => {
    return String(info.message);
  }),
  transports: [transport]
});

export default defineEventHandler(async (event) => {
  logger.http(
    JSON.stringify({
      time: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      method: event.method,
      path: event.path,
      ip: getRequestIP(event, { xForwardedFor: true }),
      userAgent: event.headers.get("User-Agent")
    })
  );
});
