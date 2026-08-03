import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import {
  CANVAS_DOCUMENT_TYPES,
  CanvasDocumentTypeLabelMap,
  type CanvasDocumentType
} from "#shared/enums";
import { readBody, getRouterParam } from "h3";
import { z } from "zod";

/**
 * 画布文档新建
 * @description 创建一个画布文档，type 由路径参数决定，核心数据 data 结构由前端自治
 */
const schema = z.object({
  title: z.string().min(1, "请输入标题"),
  description: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
  cover: z.string().optional()
});

export default defineEventHandler(async (event) => {
  // 校验路径参数 type 是否为合法的画布文档类型
  const { data: type, error: typeError } = z
    .enum(CANVAS_DOCUMENT_TYPES as [CanvasDocumentType, ...CanvasDocumentType[]])
    .safeParse(getRouterParam(event, "type"));

  if (typeError) return getBadResponse(event, "文档类型不合法");

  const { error, data: body } = schema.safeParse(await readBody(event));

  if (error) return getBadResponse(event, error.message);

  await prisma.canvasDocument.create({
    data: {
      created_at: new Date(),
      created_by: event.context.user.id,
      type: type as CanvasDocumentType,
      title: body.title,
      description: body.description,
      data: body.data as object,
      cover: body.cover
    }
  });

  return getOKResponse(event);
});
