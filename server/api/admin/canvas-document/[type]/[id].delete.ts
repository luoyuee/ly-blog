import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import {
  CANVAS_DOCUMENT_TYPES,
  type CanvasDocumentType
} from "#shared/enums";
import { getRouterParam } from "h3";
import { z } from "zod";

/**
 * 画布文档删除
 * @description 软删除：将 status 置为 0
 */
export default defineEventHandler(async (event) => {
  // 校验路径参数 type 是否为合法的画布文档类型
  const { error: typeError } = z
    .enum(CANVAS_DOCUMENT_TYPES as [CanvasDocumentType, ...CanvasDocumentType[]])
    .safeParse(getRouterParam(event, "type"));

  if (typeError) return getBadResponse(event, "文档类型不合法");

  const { data: id, error } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  await prisma.canvasDocument.update({
    where: { id },
    data: {
      updated_at: new Date(),
      updated_by: event.context.user.id,
      status: 0
    }
  });

  return getOKResponse(event);
});
