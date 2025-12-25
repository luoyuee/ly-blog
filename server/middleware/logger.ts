import * as winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import readline from "readline";
import fs from "fs";
import dayjs from "dayjs";

const transport: DailyRotateFile = new DailyRotateFile({
  filename: "./logs/http-%DATE%.log",
  datePattern: "YYYY-MM-DD-HH",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
});

transport.on("rotate", async (oldFilename, newFilename) => {
  console.log(oldFilename, newFilename);

  const rl = readline.createInterface({
    input: fs.createReadStream(oldFilename),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    console.log(line);
  }
});

const logger = winston.createLogger({
  level: "http",
  format: winston.format.printf((info) => {
    return String(info.message);
  }),
  transports: [transport],
});

export default defineEventHandler(async (event) => {
  logger.http(
    JSON.stringify({
      time: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
      method: event.method,
      path: event.path,
      ip: getRequestIP(event, { xForwardedFor: true }),
      userAgent: event.headers.get("User-Agent"),
    })
  );
});
