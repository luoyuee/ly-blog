import { getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { CanvasDocumentTypeEnum } from "#shared/enums";

/**
 * 白板全量列表查询
 * @description 不分页返回全部白板列表；列表不返回核心数据(data)字段，避免响应体过大
 */
export default defineEventHandler(async (event) => {
  const results = await prisma.canvasDocument.findMany({
    where: {
      type: CanvasDocumentTypeEnum.WHITEBOARD,
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
