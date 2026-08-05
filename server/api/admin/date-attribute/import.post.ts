import type { Prisma } from "@@/prisma/generated/client";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { readFormData } from "h3";
import { z } from "zod";

dayjs.extend(customParseFormat);

const importSchema = z.record(z.string(), z.record(z.string(), z.unknown()));
const batchSize = 500;

const parseDateKey = (key: string) => {
  const date = dayjs(key, "YYYY-MM-DD", true);
  if (!date.isValid()) return null;

  return {
    year: date.year(),
    month: date.month() + 1,
    day: date.date()
  };
};

/** 按公历日期导入并覆盖日期拓展字段。 */
export default defineEventHandler(async (event) => {
  const formData = await readFormData(event);
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return getBadResponse(event, "请选择 JSON 文件");
  }

  if (file.type !== "application/json") {
    return getBadResponse(event, "仅支持 JSON 文件");
  }

  let jsonData: unknown;
  try {
    jsonData = JSON.parse(await file.text());
  } catch {
    return getBadResponse(event, "JSON 解析失败");
  }

  const { data, error } = importSchema.safeParse(jsonData);
  if (error) return getBadResponse(event, error.message);

  const records: Array<{
    year: number;
    month: number;
    day: number;
    extra: Prisma.InputJsonValue;
  }> = [];

  for (const [dateKey, extra] of Object.entries(data)) {
    const date = parseDateKey(dateKey);
    if (!date) return getBadResponse(event, `无效日期：${dateKey}`);

    records.push({
      ...date,
      extra: extra as Prisma.InputJsonValue
    });
  }

  for (let offset = 0; offset < records.length; offset += batchSize) {
    const batch = records.slice(offset, offset + batchSize);
    await prisma.$transaction(
      batch.map((record) =>
        prisma.dateAttribute.upsert({
          where: {
            year_month_day: {
              year: record.year,
              month: record.month,
              day: record.day
            }
          },
          create: record,
          update: { extra: record.extra }
        })
      )
    );
  }

  return getOKResponse(event, { count: records.length });
});
