import type { Prisma } from "@@/prisma/generated/client";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { z } from "zod";

const schema = z.object({
  page: z.coerce.number().int(),
  per_page: z.coerce.number().int(),
  keyword: z.string().optional(),
  status: z.coerce.number().int().optional()
});

export default defineEventHandler(async (event) => {
  const { error, data: params } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const where: Prisma.NavigationWebsiteWhereInput = {};

  if (params.keyword) {
    where.OR = [
      { name: { contains: params.keyword } },
      { url: { contains: params.keyword } },
      { description: { contains: params.keyword } },
      { tags: { path: [], string_contains: params.keyword } }
    ];
  }

  if (params.status !== undefined) {
    where.status = params.status;
  }

  const results = await prisma.navigationWebsite.findMany({
    where,
    skip: (params.page - 1) * params.per_page,
    take: params.per_page,
    orderBy: { id: "desc" }
  });

  const total = await prisma.navigationWebsite.count({ where });

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data: results
  });
});
