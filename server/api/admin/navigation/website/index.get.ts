import type { Prisma } from "@@/prisma/generated/client";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { isNil } from "es-toolkit";
import { z } from "zod";

const schema = z.object({
  page: z.coerce.number().int(),
  per_page: z.coerce.number().int(),
  keyword: z.string().optional(),
  type: z.coerce.number().int().optional(),
  status: z.coerce.number().int().optional()
});

export default defineEventHandler(async (event) => {
  const { error, data: params } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const where: Prisma.NavigationWebsiteWhereInput = {
    status: {
      not: 0
    }
  };
  const andConditions: Prisma.NavigationWebsiteWhereInput[] = [];

  if (params.keyword) {
    andConditions.push({
      OR: [
        { name: { contains: params.keyword } },
        { url: { contains: params.keyword } },
        { description: { contains: params.keyword } },
        { tags: { path: [], string_contains: params.keyword } }
      ]
    });
  }

  if (!isNil(params.status) && params.status !== 0) {
    where.status = params.status;
  }

  if (!isNil(params.type)) {
    where.type = params.type;
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const results = await prisma.navigationWebsite.findMany({
    where,
    skip: (params.page - 1) * params.per_page,
    take: params.per_page,
    orderBy: [{ is_favorite: "desc" }, { hot: "desc" }, { id: "desc" }]
  });

  const total = await prisma.navigationWebsite.count({ where });

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data: results
  });
});
