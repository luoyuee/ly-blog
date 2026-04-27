import type { Prisma } from "@@/prisma/generated/client";
import { getBadResponse, getNotAuthResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { z } from "zod";

const schema = z.object({
  page: z.coerce.number().int(),
  per_page: z.coerce.number().int(),
  keyword: z.string().optional(),
  search_engine_id: z.coerce.number().int().optional()
});

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    return getNotAuthResponse(event, "请先登录");
  }

  const { error, data: params } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const where: Prisma.NavigationSearchHistoryWhereInput = {
    created_by: event.context.user.id
  };

  if (params.keyword) {
    where.keyword = { contains: params.keyword };
  }

  if (params.search_engine_id) {
    where.search_engine_id = params.search_engine_id;
  }

  const [results, total] = await Promise.all([
    prisma.navigationSearchHistory.findMany({
      where,
      include: {
        NavigationSearchEngine: true
      },
      skip: (params.page - 1) * params.per_page,
      take: params.per_page,
      orderBy: { id: "desc" }
    }),
    prisma.navigationSearchHistory.count({ where })
  ]);

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data: results
  });
});
