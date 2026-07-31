import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { readBody } from "h3";
import { z } from "zod";

/**
 * 看板更新
 * @description 更新看板元信息或核心数据；type 不可变更
 */
const schema = z.object({
  id: z.number().int(),
  title: z.string().min(1, "请输入标题").optional(),
  description: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  cover: z.string().optional(),
  status: z.number().int().optional()
});

export default defineEventHandler(async (event) => {
  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  await prisma.canvasDocument.update({
    where: { id: body.id },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      title: body.title,
      description: body.description,
      data: body.data as object,
      cover: body.cover,
      status: body.status
    }
  });

  return getOKResponse(event);
});
