import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import {
  CANVAS_DOCUMENT_TYPES,
  type CanvasDocumentType
} from "#shared/enums";
import { getRouterParam } from "h3";
import { z } from "zod";

/**
 * 画布文档全量列表查询
 * @description 按路径 type 不分页返回全部列表；列表不返回核心数据(data)字段，避免响应体过大
 */
export default defineEventHandler(async (event) => {
  // 校验路径参数 type 是否为合法的画布文档类型
  const { data: type, error: typeError } = z
    .enum(CANVAS_DOCUMENT_TYPES as [CanvasDocumentType, ...CanvasDocumentType[]])
    .safeParse(getRouterParam(event, "type"));

  if (typeError) return getOKResponse(event, []);

  const results = await prisma.canvasDocument.findMany({
    where: {
      type: type as CanvasDocumentType,
      status: { not: 0 }
    },
    select: {
      id: true,
      created_at: true,
      created_by: true,
      updated_at: true,
      updated_by: true,
      type: true,
      title: true,
      description: true,
      cover: true,
      status: true
    },
    orderBy: [{ id: "desc" }]
  });

  return getOKResponse(event, results);
});
