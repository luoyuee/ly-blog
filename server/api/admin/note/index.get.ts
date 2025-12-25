import { getOKResponse, getBadResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { getQuery } from "h3";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    page: z.number().int(),
    per_page: z.number().int(),
  });

  const { error, data: params } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const results = await prisma.note.findMany({
    where: { status: 1 },
    skip: (params.page - 1) * params.per_page,
    take: params.per_page,
  });

  const total = await prisma.note.count({
    where: { status: 1 },
  });

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data: results,
  });
});
