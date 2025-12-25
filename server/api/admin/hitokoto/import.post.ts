import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { readFormData } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event);

  const file: File | null = formData.get("file") as File;
  if (file === null) {
    return getBadResponse(event, "数据异常");
  }

  if (file.type !== "application/json") {
    return getBadResponse(event, "仅支持 JSON 文件");
  }

  const arrayBuffer = await file.arrayBuffer();

  const content = Buffer.from(arrayBuffer).toString("utf8");

  const jsonData = JSON.parse(content);

  const schema = z
    .object({
      type: z.number().int().optional().nullable(),
      source: z.string().optional().nullable(),
      author: z.string().optional().nullable(),
      content: z.string().min(1)
    })
    .array();

  const { data, error } = schema.safeParse(jsonData);

  if (error) return getBadResponse(event, error.message);

  const types = await prisma.hitokotoType.findMany({
    select: {
      id: true
    }
  });

  const typeMap = types.reduce((map: Record<number, number>, item) => {
    map[item.id] = item.id;
    return map;
  }, {});

  const now = new Date();
  // TODO: type是否可为空还要调整一下
  const result = await prisma.hitokoto.createMany({
    data: data.map((item) => {
      return {
        created_at: now,
        created_by: event.context.user.id,
        type: item.type ? (typeMap[item.type] ?? null) : null,
        source: item.source ? item.source : null,
        author: item.author ? item.author : null,
        content: item.content,
        length: item.content.length
      };
    })
  });

  getOKResponse(event, { count: result.count });
});
