import type { Prisma } from "@@/prisma/generated/client";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { CanvasDocumentTypeEnum } from "#shared/enums";
import { isNil } from "#shared/utils/typed";
import { z } from "zod";

/**
 * 看板列表查询
 * @description 分页返回看板列表；列表不返回核心数据(data)字段，避免响应体过大
 */
const schema = z.object({
  page: z.coerce.number().int(),
  per_page: z.coerce.number().int(),
  status: z.coerce.number().int().optional(),
  keyword: z.string().optional()
});

export default defineEventHandler(async (event) => {
  const { error, data: params } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const where: Prisma.CanvasDocumentWhereInput = {
    type: CanvasDocumentTypeEnum.KANBAN,
    status: { not: 0 }
  };

  // 默认排除已软删除；指定状态且非 0 时精确匹配
  if (!isNil(params.status) && params.status !== 0) {
    where.status = params.status;
  }

  // 关键字模糊匹配标题与描述
  if (params.keyword) {
    where.OR = [
      { title: { contains: params.keyword } },
      { description: { contains: params.keyword } }
    ];
  }

  const [results, total] = await Promise.all([
    prisma.canvasDocument.findMany({
      where,
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
      skip: (params.page - 1) * params.per_page,
      take: params.per_page,
      orderBy: [{ id: "desc" }]
    }),
    prisma.canvasDocument.count({ where })
  ]);

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data: results
  });
});
