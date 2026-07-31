import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { CanvasDocumentTypeEnum } from "#shared/enums";
import { readBody } from "h3";
import { z } from "zod";

/**
 * 白板新建
 * @description 创建一个白板，type 由服务端固定为 whiteboard，核心数据 data 结构由前端自治
 */
const schema = z.object({
  title: z.string().min(1, "请输入标题"),
  description: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
  cover: z.string().optional()
});

export default defineEventHandler(async (event) => {
  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  await prisma.canvasDocument.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user.id,
      type: CanvasDocumentTypeEnum.WHITEBOARD,
      title: body.title,
      description: body.description,
      data: body.data as object,
      cover: body.cover
    }
  });

  return getOKResponse(event);
});
