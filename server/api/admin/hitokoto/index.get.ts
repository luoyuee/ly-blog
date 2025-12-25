import type { Prisma } from "@@/prisma/generated/client";
import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    page: z.coerce.number().int(),
    per_page: z.coerce.number().int(),
    type: z.coerce.number().int().optional(),
    keyword: z.string().optional()
  });

  const { error, data: params } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const where: Prisma.HitokotoWhereInput = {};

  if (params.type) {
    where.type = params.type;
  }

  if (params.keyword) {
    where.content = {
      contains: params.keyword
    };
  }

  const results = await prisma.hitokoto.findMany({
    where,
    skip: (params.page - 1) * params.per_page,
    take: params.per_page
  });

  const total = await prisma.hitokoto.count({ where });

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data: results
  });
});
