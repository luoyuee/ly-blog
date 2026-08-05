import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import {
  CANVAS_DOCUMENT_TYPES,
  CanvasDocumentTypeLabelMap,
  type CanvasDocumentType
} from "#shared/enums";
import { getRouterParam } from "h3";
import { z } from "zod";

/**
 * 画布文档详情
 * @description 返回单个画布文档完整信息（含核心数据 data），供前端组件渲染
 */
export default defineEventHandler(async (event) => {
  // 校验路径参数 type 是否为合法的画布文档类型
  const { data: type, error: typeError } = z
    .enum(CANVAS_DOCUMENT_TYPES as [CanvasDocumentType, ...CanvasDocumentType[]])
    .safeParse(getRouterParam(event, "type"));

  if (typeError) return getBadResponse(event, "文档类型不合法");

  const { data: id, error } = z.coerce.number().int().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const result = await prisma.canvasDocument.findUnique({
    where: { id }
  });

  if (!result) {
    return getBadResponse(event, `${CanvasDocumentTypeLabelMap[type as CanvasDocumentType]}不存在`);
  }

  return getOKResponse(event, result);
});
