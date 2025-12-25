import { getRouterParam } from "h3";
import { prisma } from "@@/server/db";
import { z } from "zod";
import { getBadResponse, getNotFoundResponse, getOKResponse } from "@@/server/utils/response";

export default defineEventHandler(async (event) => {
  const { error, data: id } = z.coerce.number().safeParse(getRouterParam(event, "id"));

  if (error) return getBadResponse(event, error.message);

  const category = await prisma.articleCategory.findUnique({
    include: {
      _count: {
        select: { articles: true }
      }
    },
    where: { id, status: 1 }
  });

  if (category === null) return getNotFoundResponse(event);

  const { _count, ...rest } = category;
  return getOKResponse(event, {
    ...rest,
    count: _count.articles
  });
});
