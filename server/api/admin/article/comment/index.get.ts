import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const zodSchema = z.object({
    page: z.number({ coerce: true }).int(),
    per_page: z.number({ coerce: true }).int(),
  });

  const { error, data: params } = zodSchema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const results = await prisma.articleComment.findMany({
    where: { status: 1 },
    skip: (params.page - 1) * params.per_page,
    take: params.per_page,
  });

  const total = await prisma.articleComment.count();

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data: results,
  });
});
