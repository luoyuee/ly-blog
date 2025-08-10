import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    page: z.number().int(),
    per_page: z.number().int(),
  });

  const { error, data: params } = zodSchema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const results = await prisma.hitokotoType.findMany({
    include: {
      _count: {
        select: { hitokotos: true },
      },
    },
    skip: (params.page - 1) * params.per_page,
    take: params.per_page,
  });

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total: results.length,
    data: results.map((item) => {
      const { _count, ...rest } = item;
      return {
        ...rest,
        count: _count.hitokotos,
      };
    }),
  });
});
