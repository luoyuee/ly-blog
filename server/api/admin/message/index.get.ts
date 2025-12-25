import { getBadResponse, getOKResponse } from "@@/server/utils/response";
import { prisma } from "@@/server/db";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const schema = z.object({
    page: z.number().int(),
    per_page: z.number().int(),
  });

  const { error, data: params } = schema.safeParse(getQuery(event));

  if (error) return getBadResponse(event, error.message);

  const result = await prisma.messageBoard.findMany({
    where: { status: 1 },
    skip: (params.page - 1) * params.per_page,
    take: params.per_page,
  });

  const total = await prisma.messageBoard.count();

  return getOKResponse(event, {
    page: params.page,
    per_page: params.per_page,
    total,
    data: result,
  });
});
